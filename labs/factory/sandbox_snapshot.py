"""Bounded, immutable input data for a future isolated worker; never executes it.

Only explicitly supplied bytes are inspected. No filesystem access, extraction,
processes or networking. Validation/hashes do not verify isolation or absence of
secrets inside arbitrary content; callers must select and review source inputs.
"""
from __future__ import annotations

from dataclasses import dataclass
from hashlib import sha256
from io import BytesIO
import stat
import struct
import unicodedata
from zipfile import BadZipFile, ZIP_DEFLATED, ZIP_STORED, ZipFile
import zlib

MAX_FILES = 100
MAX_FILE_BYTES = 1024 * 1024
MAX_TOTAL_BYTES = 8 * 1024 * 1024
MAX_ARCHIVE_BYTES = 9 * 1024 * 1024
MAX_PATH_BYTES = 1024
MAX_COMPRESSION_RATIO = 200
DIGEST_DOMAIN = b"nexus-factory-snapshot:v1\x00"
_RESERVED = {"con", "prn", "aux", "nul", "conin$", "conout$", "clock$"} | {
    prefix + str(number) for prefix in ("com", "lpt") for number in range(1, 10)
}
_PRIVATE_NAMES = {
    ".git", ".hg", ".svn", ".ssh", ".aws", ".azure", ".gcloud", ".gnupg",
    ".kube", ".docker", ".netrc", ".npmrc", ".pypirc", ".git-credentials",
    ".gitconfig", ".bash_history", ".zsh_history", ".envrc", "credentials", "credentials.json",
    "credentials.ini", "service-account.json", "id_rsa", "id_dsa", "id_ecdsa", "id_ed25519",
}


class SnapshotValidationError(ValueError):
    """Stable reason only: paths/content are intentionally absent from errors."""

    def __init__(self, reason: str):
        self.reason = reason
        super().__init__(reason)


@dataclass(frozen=True)
class SnapshotFile:
    path: str
    content: bytes


@dataclass(frozen=True)
class Snapshot:
    files: tuple[SnapshotFile, ...]
    digest: str
    total_bytes: int


def _path_key(path: str) -> str:
    if type(path) is not str or not path or len(path) > MAX_PATH_BYTES:
        raise SnapshotValidationError("invalid-path")
    if unicodedata.normalize("NFKC", path) != path:
        raise SnapshotValidationError("noncanonical-path")
    if any(unicodedata.category(char).startswith("C") for char in path):
        raise SnapshotValidationError("invalid-path")
    if len(path.encode("utf-8")) > MAX_PATH_BYTES or any(char in path for char in '\\:<>"|?*'):
        raise SnapshotValidationError("invalid-path")
    parts = path.split("/")
    if len(parts) > 16 or any(not part or part in (".", "..") or part.endswith((".", " "))
                              or len(part.encode("utf-8")) > 255 for part in parts):
        raise SnapshotValidationError("invalid-path")
    for part in parts:
        key = part.casefold()
        if key.split(".")[0] in _RESERVED:
            raise SnapshotValidationError("reserved-path")
        if key in _PRIVATE_NAMES or key == ".env" or key.startswith(".env.") or key.endswith(
            (".pem", ".key", ".p12", ".pfx", ".jks", ".keystore")
        ):
            raise SnapshotValidationError("private-path")
    return path.casefold()


def _validate_names(paths: list[str]) -> None:
    seen = set()
    spellings = {}
    for path in paths:
        key = _path_key(path)
        if key in seen:
            raise SnapshotValidationError("duplicate-path")
        seen.add(key)
        parts = path.split("/")
        for end in range(1, len(parts) + 1):
            prefix = "/".join(parts[:end])
            folded = prefix.casefold()
            if folded in spellings and spellings[folded] != prefix:
                raise SnapshotValidationError("path-alias")
            spellings[folded] = prefix
    for key in seen:
        parts = key.split("/")
        if any("/".join(parts[:end]) in seen for end in range(1, len(parts))):
            raise SnapshotValidationError("path-conflict")


def validate_snapshot(entries: list[SnapshotFile] | tuple[SnapshotFile, ...]) -> Snapshot:
    """Validate supplied regular-file bytes; freeze sorted paths/content and digest.

    A concrete bounded collection is required: no unbounded/generator ingestion.
    The digest framing is domain + per-file uint32BE path length, UTF-8 path,
    uint64BE content length and content, ordered by UTF-8 path bytes.
    """
    if type(entries) not in (list, tuple) or not 1 <= len(entries) <= MAX_FILES:
        raise SnapshotValidationError("invalid-file-count")
    if any(type(entry) is not SnapshotFile or type(entry.content) is not bytes for entry in entries):
        raise SnapshotValidationError("invalid-file")
    _validate_names([entry.path for entry in entries])
    total = 0
    for entry in entries:
        if len(entry.content) > MAX_FILE_BYTES:
            raise SnapshotValidationError("file-too-large")
        total += len(entry.content)
        if total > MAX_TOTAL_BYTES:
            raise SnapshotValidationError("snapshot-too-large")
    files = tuple(sorted(entries, key=lambda entry: entry.path.encode("utf-8")))
    digest = sha256(DIGEST_DOMAIN)
    for entry in files:
        name = entry.path.encode("utf-8")
        digest.update(len(name).to_bytes(4, "big"))
        digest.update(name)
        digest.update(len(entry.content).to_bytes(8, "big"))
        digest.update(entry.content)
    return Snapshot(files, digest.hexdigest(), total)


def _central_directory(data: bytes) -> tuple[int, int]:
    # Deliberately support only a plain, single-disk classic ZIP with no comment.
    # Bound central-directory allocation before ZipFile parses its members.
    if len(data) < 22 or data[-22:-18] != b"PK\x05\x06":
        raise SnapshotValidationError("invalid-archive")
    _, disk, start_disk, disk_count, count, size, offset, comment = struct.unpack("<4s4H2LH", data[-22:])
    if disk or start_disk or disk_count != count or not 1 <= count <= MAX_FILES or comment:
        raise SnapshotValidationError("unsupported-archive")
    if size > MAX_FILES * (46 + MAX_PATH_BYTES) or offset + size != len(data) - 22:
        raise SnapshotValidationError("invalid-archive")
    return offset, count


def snapshot_from_zip(data: bytes) -> Snapshot:
    """Validate ZIP metadata and read bounded regular files into memory only.

    No extraction, permissions or archive-provided links are carried forward.
    ZIP64, comments, extra fields, descriptors and non-stored/deflate codecs are
    intentionally unsupported; this rejects Unix link metadata as well.
    """
    if type(data) is not bytes or len(data) > MAX_ARCHIVE_BYTES:
        raise SnapshotValidationError("archive-too-large")
    central_offset, count = _central_directory(data)
    try:
        with ZipFile(BytesIO(data), "r") as archive:
            infos = archive.infolist()
            if not 1 <= len(infos) <= MAX_FILES or len(infos) != count:
                raise SnapshotValidationError("invalid-file-count")
            _validate_names([info.filename for info in infos])
            total = 0
            position = 0
            payloads = {}
            for info in sorted(infos, key=lambda item: item.header_offset):
                mode = stat.S_IFMT(info.external_attr >> 16)
                if (info.orig_filename != info.filename or info.is_dir() or info.external_attr & 0x10
                        or mode not in (0, stat.S_IFREG) or info.create_system not in (0, 3)
                        or info.flag_bits & ~0x800 or info.compress_type not in (ZIP_STORED, ZIP_DEFLATED)
                        or info.extra or info.comment or info.extract_version > 20 or info.volume):
                    raise SnapshotValidationError("unsupported-archive-entry")
                if info.file_size > MAX_FILE_BYTES:
                    raise SnapshotValidationError("file-too-large")
                total += info.file_size
                if total > MAX_TOTAL_BYTES:
                    raise SnapshotValidationError("snapshot-too-large")
                if info.file_size > max(1, info.compress_size) * MAX_COMPRESSION_RATIO:
                    raise SnapshotValidationError("compression-ratio-exceeded")
                if info.header_offset != position or position + 30 > central_offset:
                    raise SnapshotValidationError("invalid-archive")
                fields = struct.unpack_from("<4s5H3L2H", data, position)
                signature, version, flags, codec, _, _, crc, compressed, size, name_size, extra_size = fields
                if (signature != b"PK\x03\x04" or version > 20 or flags != info.flag_bits
                        or codec != info.compress_type or crc != info.CRC or compressed != info.compress_size
                        or size != info.file_size or name_size > MAX_PATH_BYTES or extra_size):
                    raise SnapshotValidationError("invalid-archive")
                name = data[position + 30:position + 30 + name_size].decode(
                    "utf-8" if flags & 0x800 else "cp437"
                )
                if name != info.orig_filename:
                    raise SnapshotValidationError("invalid-archive")
                payloads[info.header_offset] = position + 30 + name_size
                position += 30 + name_size + compressed
                if position > central_offset:
                    raise SnapshotValidationError("invalid-archive")
            if position != central_offset:
                raise SnapshotValidationError("invalid-archive")
            entries = []
            for info in infos:
                start = payloads[info.header_offset]
                compressed = memoryview(data)[start:start + info.compress_size]
                if info.compress_type == ZIP_STORED:
                    if info.compress_size != info.file_size:
                        raise SnapshotValidationError("invalid-archive")
                    content = bytes(compressed)
                else:
                    # ZipExtFile trusts file_size and can silently truncate a
                    # larger deflate stream. Verify actual output/EOF ourselves.
                    decoder = zlib.decompressobj(-zlib.MAX_WBITS)
                    content = decoder.decompress(compressed, MAX_FILE_BYTES + 1)
                    if not decoder.eof or decoder.unconsumed_tail or decoder.unused_data:
                        raise SnapshotValidationError("invalid-archive")
                if len(content) != info.file_size or zlib.crc32(content) != info.CRC:
                    raise SnapshotValidationError("invalid-archive")
                entries.append(SnapshotFile(info.filename, content))
            return validate_snapshot(entries)
    except SnapshotValidationError:
        raise
    except (BadZipFile, OSError, ValueError, UnicodeError, RuntimeError, NotImplementedError,
            EOFError, struct.error, zlib.error):
        raise SnapshotValidationError("invalid-archive") from None
