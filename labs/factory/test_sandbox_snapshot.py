"""Adversarial inert data only: no generated source is executed or extracted."""
from dataclasses import FrozenInstanceError
from io import BytesIO
import socket
import stat
import struct
import subprocess
import unittest
from unittest.mock import patch
from zipfile import ZIP_BZIP2, ZIP_DEFLATED, ZIP_STORED, ZipFile, ZipInfo
import zlib

from sandbox_snapshot import (
    MAX_ARCHIVE_BYTES, MAX_FILE_BYTES, MAX_FILES, MAX_TOTAL_BYTES,
    SnapshotFile, SnapshotValidationError, snapshot_from_zip, validate_snapshot,
)


def make_zip(entries, compression=ZIP_STORED):
    output = BytesIO()
    with ZipFile(output, "w", compression=compression) as archive:
        for name, content in entries:
            archive.writestr(name, content)
    return output.getvalue()


class SnapshotTests(unittest.TestCase):
    def reject_path(self, path):
        with self.assertRaises(SnapshotValidationError):
            validate_snapshot([SnapshotFile(path, b"inert")])

    def test_digest_has_stable_framing_and_order(self):
        entries = [SnapshotFile("b.txt", b"B"), SnapshotFile("a.txt", b"A")]
        snapshot = validate_snapshot(entries)
        self.assertEqual(snapshot.digest, "68f0a8cd217e4da7e69f38a60b267d02faf9f896b6d9453c49341a1564433ffc")
        self.assertEqual(snapshot, validate_snapshot(tuple(reversed(entries))))
        self.assertEqual([entry.path for entry in snapshot.files], ["a.txt", "b.txt"])
        self.assertEqual(snapshot.total_bytes, 2)
        self.assertNotEqual(snapshot.digest, validate_snapshot([SnapshotFile("a.txt", b"AB")]).digest)

    def test_snapshot_is_immutable_and_does_not_retain_mutable_collection(self):
        entries = [SnapshotFile("source.py", b"raise RuntimeError('must never execute')")]
        snapshot = validate_snapshot(entries)
        entries.clear()
        self.assertEqual(len(snapshot.files), 1)
        with self.assertRaises(FrozenInstanceError):
            snapshot.files[0].path = "replacement.py"
        with self.assertRaises(FrozenInstanceError):
            snapshot.digest = "forged"
        with self.assertRaises(SnapshotValidationError):
            validate_snapshot([SnapshotFile("file", bytearray(b"mutable"))])

    def test_rejects_traversal_absolute_windows_and_ambiguous_paths(self):
        for path in ("", ".", "..", "../x", "a/../../x", "/root.txt", "a/./b", "a//b", "a/",
                     "C:/private", "C:\\private", "\\\\server\\share", "x:stream", "a\\b",
                     "x\x00.txt", "name.", "name ", "a/../b", "a/<b>", "a/?.txt", "a/\u202etxt",
                     "CON", "aux.txt", "com1.js", "LPT9.txt", "CONIN$", "x/" + "b" * 256,
                     "/".join(["x"] * 17)):
            with self.subTest(path=path):
                self.reject_path(path)

    def test_rejects_normalization_case_and_file_parent_collisions(self):
        for first, second in (("A.txt", "a.txt"), ("straße.txt", "STRASSE.txt"),
                              ("folder", "folder/child.txt"), ("FOLDER", "folder/child.txt"),
                              ("src/a.py", "SRC/b.py"), ("a/A", "A/b")):
            with self.subTest(paths=(first, second)), self.assertRaises(SnapshotValidationError):
                validate_snapshot([SnapshotFile(first, b"1"), SnapshotFile(second, b"2")])
        for path in ("cafe\u0301.txt", "\uff0e\uff0e/x", "\uff23\uff2f\uff2e", "a/\ufeffb"):
            self.reject_path(path)
        self.assertEqual(validate_snapshot([SnapshotFile("café.txt", b"")]).total_bytes, 0)

    def test_windows_device_aliases_with_spaces_are_rejected_in_files_and_parents(self):
        for device in ("CON", "nul", "Aux", "PRN", "COM1", "com9", "LPT1", "lpt9"):
            for path in (device + " .txt", "src/" + device + "   .log",
                         "src/" + device + " .dir/child.txt"):
                with self.subTest(path=path):
                    with self.assertRaisesRegex(SnapshotValidationError, "^reserved-path$"):
                        validate_snapshot([SnapshotFile(path, b"inert")])
                    for compression in (ZIP_STORED, ZIP_DEFLATED):
                        with self.assertRaisesRegex(SnapshotValidationError, "^reserved-path$"):
                            snapshot_from_zip(make_zip([(path, b"inert")], compression))
        # Ordinary spaces remain exact input data, without silent renaming.
        safe = SnapshotFile("docs/con artist.txt", b"inert")
        self.assertEqual(validate_snapshot([safe]).files, (safe,))

    def test_known_private_paths_are_rejected_but_content_is_not_secret_scanned(self):
        for path in (".git/config", "x/.git", ".env", "x/.env.production", ".ssh/id_ed25519",
                     "nested/credentials.json", "SERVICE-ACCOUNT.JSON", "x/.npmrc", "certificate.pem",
                     "secret.key", "x/private.p12", ".aws/config", ".envrc"):
            with self.subTest(path=path):
                self.reject_path(path)
        # Known names can be excluded; arbitrary source bytes still require human selection/review.
        self.assertEqual(validate_snapshot([SnapshotFile("source.txt", b"synthetic-token-in-text")]).total_bytes, 23)

    def test_count_type_and_size_limits_include_valid_boundaries(self):
        for invalid in ([], {}, (SnapshotFile(str(i), b"") for i in range(1)),
                        [SnapshotFile(str(i), b"") for i in range(MAX_FILES + 1)],
                        [{"path": "x", "content": b"x"}], [SnapshotFile(123, b"x")]):
            with self.subTest(kind=type(invalid)), self.assertRaises(SnapshotValidationError):
                validate_snapshot(invalid)
        self.assertEqual(len(validate_snapshot([SnapshotFile(str(i), b"") for i in range(MAX_FILES)]).files), MAX_FILES)
        self.assertEqual(validate_snapshot([SnapshotFile("x", b"x" * MAX_FILE_BYTES)]).total_bytes, MAX_FILE_BYTES)
        with self.assertRaisesRegex(SnapshotValidationError, "file-too-large"):
            validate_snapshot([SnapshotFile("x", b"x" * (MAX_FILE_BYTES + 1))])
        maximum = [SnapshotFile(str(i), b"x" * MAX_FILE_BYTES) for i in range(8)]
        self.assertEqual(validate_snapshot(maximum).total_bytes, MAX_TOTAL_BYTES)
        with self.assertRaisesRegex(SnapshotValidationError, "snapshot-too-large"):
            validate_snapshot(maximum + [SnapshotFile("extra", b"x")])

    def test_plain_stored_deflate_zip_has_same_identity_as_explicit_files(self):
        entries = [("src/main.py", b"raise RuntimeError('inert data')"), ("README.md", "café".encode())]
        expected = validate_snapshot([SnapshotFile(name, content) for name, content in entries])
        for compression in (ZIP_STORED, ZIP_DEFLATED):
            with self.subTest(compression=compression):
                self.assertEqual(snapshot_from_zip(make_zip(list(reversed(entries)), compression)), expected)

    def test_zip_slip_duplicates_and_conflicting_entries_are_rejected(self):
        for entries in ([('../escape', b"x")], [("C:/escape", b"x")], [("a\\b", b"x")],
                        [("A", b"1"), ("a", b"2")], [("a", b"1"), ("a/b", b"2")],
                        [(".git/config", b"private")], [(".env", b"private")]):
            with self.subTest(entries=entries), self.assertRaises(SnapshotValidationError):
                snapshot_from_zip(make_zip(entries))

    def test_zip_links_special_files_and_link_extra_metadata_rejected(self):
        for kind in (stat.S_IFLNK, stat.S_IFIFO, stat.S_IFSOCK, stat.S_IFCHR, stat.S_IFBLK, stat.S_IFDIR):
            info = ZipInfo("payload.txt")
            info.create_system = 3
            info.external_attr = (kind | 0o600) << 16
            with self.subTest(kind=kind), self.assertRaises(SnapshotValidationError):
                snapshot_from_zip(make_zip([(info, b"target")]))
        info = ZipInfo("payload.txt")
        info.extra = struct.pack("<HH", 0x000d, 4) + b"link"
        with self.assertRaises(SnapshotValidationError):
            snapshot_from_zip(make_zip([(info, b"target")]))

    def test_unsupported_zip_codec_comments_descriptors_encryption_and_corruption(self):
        archives = [make_zip([("x", b"hello")], ZIP_BZIP2)]
        for flag in (1, 8):
            data = bytearray(make_zip([("x", b"hello")]))
            central = data.index(b"PK\x01\x02")
            struct.pack_into("<H", data, 6, flag)
            struct.pack_into("<H", data, central + 8, flag)
            archives.append(bytes(data))
        corrupted = bytearray(make_zip([("x", b"hello")]))
        corrupted[31] ^= 0xff  # first payload byte; CRC must fail.
        archives.extend([bytes(corrupted), make_zip([("x", b"hello")]) + b"trailing",
                         make_zip([("x", b"hello")])[:-1], b"invalid"])
        with BytesIO() as output:
            with ZipFile(output, "w") as archive:
                archive.comment = b"comment"
                archive.writestr("x", b"hello")
            archives.append(output.getvalue())
        for data in archives:
            with self.subTest(length=len(data)), self.assertRaises(SnapshotValidationError):
                snapshot_from_zip(data)

    def test_zip_budgets_and_ratio_fail_before_unbounded_read(self):
        for data in (make_zip([("x", b"x" * (MAX_FILE_BYTES + 1))]),
                     make_zip([(str(i), b"") for i in range(MAX_FILES + 1)]),
                     make_zip([("x", b"x" * MAX_FILE_BYTES)], ZIP_DEFLATED),
                     b"x" * (MAX_ARCHIVE_BYTES + 1)):
            with self.assertRaises(SnapshotValidationError):
                snapshot_from_zip(data)
        # A huge declared central directory is rejected before ZipFile allocation.
        data = bytearray(make_zip([("x", b"hello")]))
        struct.pack_into("<L", data, len(data) - 10, MAX_ARCHIVE_BYTES)
        with patch("sandbox_snapshot.ZipFile", side_effect=AssertionError("must not parse")):
            with self.assertRaises(SnapshotValidationError):
                snapshot_from_zip(bytes(data))
        data = bytearray(make_zip([("x", b"hello"), ("y", b"world")]))
        struct.pack_into("<HH", data, len(data) - 14, 1, 1)
        with self.assertRaises(SnapshotValidationError):
            snapshot_from_zip(bytes(data))

    def test_zip_actual_deflate_output_and_eof_must_match_declared_size(self):
        data = bytearray(make_zip([("x", b"public" + b"hidden" * 100)], ZIP_DEFLATED))
        central = data.index(b"PK\x01\x02")
        # A ZIP reader trusting declared size would return only this prefix and
        # accept its CRC, ignoring the rest of the actual deflate output.
        struct.pack_into("<L", data, 22, 6)
        struct.pack_into("<L", data, 14, zlib.crc32(b"public"))
        struct.pack_into("<L", data, central + 24, 6)
        struct.pack_into("<L", data, central + 16, zlib.crc32(b"public"))
        with self.assertRaisesRegex(SnapshotValidationError, "invalid-archive"):
            snapshot_from_zip(bytes(data))
        # The archive-local filename must also match the central directory.
        data = bytearray(make_zip([("x", b"hello")]))
        data[30] = ord("y")
        with self.assertRaises(SnapshotValidationError):
            snapshot_from_zip(bytes(data))

    def test_validation_cannot_execute_extract_write_or_contact_network(self):
        archive = make_zip([("source.py", b"raise RuntimeError('must not execute')")])
        with patch("builtins.open", side_effect=AssertionError("must not open files")), \
                patch("os.open", side_effect=AssertionError("must not write")), \
                patch.object(subprocess, "Popen", side_effect=AssertionError("must not spawn")), \
                patch.object(socket, "socket", side_effect=AssertionError("must not connect")), \
                patch.object(ZipFile, "extract", side_effect=AssertionError("must not extract")), \
                patch.object(ZipFile, "extractall", side_effect=AssertionError("must not extract")):
            self.assertEqual(snapshot_from_zip(archive).files[0].path, "source.py")


if __name__ == "__main__":
    unittest.main()
