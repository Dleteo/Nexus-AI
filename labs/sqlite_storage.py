"""Filesystem checks for the four trusted, local-only SQLite demos.

This is not a sandbox: keep the directory private and do not allow another
process running as the same OS user to change it while the backend is running.
Python's sqlite3 API cannot pin the opened database and every journal to dirfds,
so these checks do not claim to eliminate concurrent path replacement attacks.
Windows checks reject links/reparse points, but do not validate Windows ACLs.
"""
from __future__ import annotations

import os
from pathlib import Path
import sqlite3
import stat


class UnsafeDatabasePath(OSError):
    """A local database path is unsafe; never include its contents in API logs."""


def _stat(path: Path):
    try:
        return path.lstat()
    except FileNotFoundError:
        return None


def _reject_link(info) -> None:
    if stat.S_ISLNK(info.st_mode) or (
        getattr(info, "st_file_attributes", 0)
        & getattr(stat, "FILE_ATTRIBUTE_REPARSE_POINT", 0x400)
    ):
        raise UnsafeDatabasePath("Database links and reparse points are forbidden.")


def _check_directory(info) -> None:
    _reject_link(info)
    if not stat.S_ISDIR(info.st_mode):
        raise UnsafeDatabasePath("Database ancestors must be directories.")
    # An ancestor owned by another unprivileged user can be renamed/replaced
    # even with a sticky bit. Only root and our own UID may own ancestors.
    if os.name == "posix" and info.st_uid not in (0, os.geteuid()):
        raise UnsafeDatabasePath("Database ancestors must have a trusted owner.")
    # Shared sticky roots such as root-owned /tmp are allowed; the immediate DB
    # directory still has to be owned by this user and not writable by others.
    if os.name == "posix" and stat.S_IMODE(info.st_mode) & 0o022 and not info.st_mode & stat.S_ISVTX:
        raise UnsafeDatabasePath("Database ancestors must not be publicly writable.")


def _check_file(path: Path):
    info = _stat(path)
    if info is None:
        return None
    _reject_link(info)
    if not stat.S_ISREG(info.st_mode) or info.st_nlink != 1:
        raise UnsafeDatabasePath("Database files must be regular and unshared.")
    if os.name == "posix" and (
        info.st_uid != os.geteuid() or stat.S_IMODE(info.st_mode) & 0o022
    ):
        raise UnsafeDatabasePath("Database files must be owned and not publicly writable.")
    return info


def _check_paths(path: Path) -> None:
    for parent in reversed(path.parents):
        info = _stat(parent)
        if info is not None:
            _check_directory(info)
    for candidate in (path, *(Path(str(path) + suffix) for suffix in ("-wal", "-shm", "-journal"))):
        _check_file(candidate)


def connect_private_db(path: Path) -> sqlite3.Connection:
    """Open only a checked local file; callers create their existing schema."""
    path = Path(path)
    if ".." in path.parts or path.name in ("", ".", ".."):
        raise UnsafeDatabasePath("Database path traversal is forbidden.")
    if not path.is_absolute():
        path = Path.cwd() / path
    _check_paths(path)
    # Build one level at a time so each newly created storage directory is 0700.
    for parent in reversed(path.parents):
        if _stat(parent) is None:
            try:
                parent.mkdir(mode=0o700)
            except FileExistsError:
                pass  # A concurrent invocation may have created the same folder.
        info = parent.lstat()
        _check_directory(info)
    parent_info = path.parent.lstat()
    if os.name == "posix" and (
        parent_info.st_uid != os.geteuid() or stat.S_IMODE(parent_info.st_mode) & 0o022
    ):
        raise UnsafeDatabasePath("Database directory must be owned and not publicly writable.")
    # O_EXCL never follows an existing link. O_NOFOLLOW additionally protects
    # existing DB files on supporting systems; neither is advertised as a sandbox.
    flags = os.O_RDWR | getattr(os, "O_NOFOLLOW", 0) | getattr(os, "O_BINARY", 0)
    try:
        descriptor = os.open(path, flags | os.O_CREAT | os.O_EXCL, 0o600)
    except FileExistsError:
        _check_file(path)
        descriptor = os.open(path, flags)
    try:
        before = os.fstat(descriptor)
        _check_paths(path)
        # mode=rw prevents SQLite silently creating a replacement if it vanished.
        db = sqlite3.connect(path.as_uri() + "?mode=rw", uri=True, timeout=5, isolation_level=None)
        try:
            after = path.lstat()
            if (before.st_dev, before.st_ino) != (after.st_dev, after.st_ino):
                raise UnsafeDatabasePath("Database file changed while opening.")
            return db
        except BaseException:
            db.close()
            raise
    finally:
        os.close(descriptor)
