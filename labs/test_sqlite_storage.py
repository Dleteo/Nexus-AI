"""Offline adversarial filesystem checks; only the trusted demo CLIs run."""
import json
import os
from pathlib import Path
import stat
import subprocess
import sys
import tempfile
import unittest
from types import SimpleNamespace
from unittest.mock import patch

from sqlite_storage import UnsafeDatabasePath, _check_directory, connect_private_db

ROOT = Path(__file__).resolve().parents[1]


class SQLiteStorageTests(unittest.TestCase):
    def setUp(self):
        self.folder = tempfile.TemporaryDirectory()
        self.root = Path(self.folder.name)
        self.outside = self.root / "sentinel.txt"
        self.outside.write_bytes(b"outside data must stay unchanged")
        self.db_path = self.root / "storage" / "demo.sqlite3"

    def tearDown(self):
        self.folder.cleanup()

    def link(self, destination, target):
        try:
            destination.symlink_to(target, target_is_directory=target.is_dir())
        except (OSError, NotImplementedError) as exc:
            self.skipTest("OS does not permit symlink creation: " + type(exc).__name__)

    def test_private_creation_and_reopen(self):
        with connect_private_db(self.db_path) as db:
            db.execute("CREATE TABLE check_data(value TEXT)")
            db.execute("INSERT INTO check_data VALUES('persisted')")
        db.close()
        with connect_private_db(self.db_path) as db:
            self.assertEqual(db.execute("SELECT value FROM check_data").fetchone()[0], "persisted")
        db.close()
        if os.name == "posix":
            self.assertEqual(stat.S_IMODE(self.db_path.stat().st_mode), 0o600)
            self.assertEqual(stat.S_IMODE(self.db_path.parent.stat().st_mode), 0o700)

    def test_linked_db_does_not_touch_target(self):
        self.db_path.parent.mkdir()
        self.link(self.db_path, self.outside)
        with self.assertRaises(UnsafeDatabasePath):
            connect_private_db(self.db_path)
        self.assertEqual(self.outside.read_bytes(), b"outside data must stay unchanged")

    def test_linked_ancestor_creates_nothing_outside(self):
        real_folder = self.root / "outside-dir"
        real_folder.mkdir()
        self.link(self.db_path.parent, real_folder)
        with self.assertRaises(UnsafeDatabasePath):
            connect_private_db(self.db_path)
        self.assertEqual(list(real_folder.iterdir()), [])

    def test_broken_ancestor_link_is_rejected(self):
        self.link(self.db_path.parent, self.root / "missing-dir")
        with self.assertRaises(UnsafeDatabasePath):
            connect_private_db(self.db_path)
        self.assertFalse((self.root / "missing-dir").exists())

    def test_linked_sqlite_sidecars_do_not_touch_target(self):
        self.db_path.parent.mkdir()
        for suffix in ("-wal", "-shm", "-journal"):
            with self.subTest(suffix=suffix):
                link = Path(str(self.db_path) + suffix)
                self.link(link, self.outside)
                with self.assertRaises(UnsafeDatabasePath):
                    connect_private_db(self.db_path)
                self.assertEqual(self.outside.read_bytes(), b"outside data must stay unchanged")
                self.assertFalse(self.db_path.exists())
                link.unlink()

    def test_hardlinked_database_or_sidecar_is_rejected(self):
        self.db_path.parent.mkdir()
        for suffix in ("", "-wal", "-shm", "-journal"):
            with self.subTest(suffix=suffix):
                link = Path(str(self.db_path) + suffix)
                try:
                    os.link(self.outside, link)
                except (OSError, NotImplementedError) as exc:
                    self.skipTest("OS does not permit hardlinks: " + type(exc).__name__)
                with self.assertRaises(UnsafeDatabasePath):
                    connect_private_db(self.db_path)
                self.assertEqual(self.outside.read_bytes(), b"outside data must stay unchanged")
                link.unlink()

    @unittest.skipUnless(hasattr(os, "mkfifo"), "FIFO test requires POSIX")
    def test_special_file_rejected_without_blocking(self):
        self.db_path.parent.mkdir()
        os.mkfifo(self.db_path)
        with self.assertRaises(UnsafeDatabasePath):
            connect_private_db(self.db_path)

    @unittest.skipUnless(os.name == "posix", "Mode checks require POSIX")
    def test_publicly_writable_parent_rejected(self):
        self.db_path.parent.mkdir(mode=0o777)
        self.db_path.parent.chmod(0o777)
        with self.assertRaises(UnsafeDatabasePath):
            connect_private_db(self.db_path)
        self.assertFalse(self.db_path.exists())

    @unittest.skipUnless(os.name == "posix", "Mode checks require POSIX")
    def test_publicly_writable_nonsticky_ancestor_rejected(self):
        unsafe = self.root / "shared"
        unsafe.mkdir()
        unsafe.chmod(0o777)
        private = unsafe / "private"
        private.mkdir(mode=0o700)
        with self.assertRaises(UnsafeDatabasePath):
            connect_private_db(private / "demo.sqlite3")
        self.assertEqual(list(private.iterdir()), [])

    @unittest.skipUnless(os.name == "posix", "Mode checks require POSIX")
    def test_publicly_writable_existing_file_rejected(self):
        self.db_path.parent.mkdir()
        self.db_path.write_bytes(b"")
        self.db_path.chmod(0o666)
        with self.assertRaises(UnsafeDatabasePath):
            connect_private_db(self.db_path)
        self.assertEqual(self.db_path.stat().st_size, 0)

    @unittest.skipUnless(os.name == "posix", "Ownership checks require POSIX")
    def test_other_user_owned_ancestors_rejected_even_with_sticky_bit(self):
        with patch("sqlite_storage.os.geteuid", return_value=1000):
            for mode in (0o755, 0o1777):
                with self.subTest(mode=oct(mode)):
                    info = SimpleNamespace(st_mode=stat.S_IFDIR | mode, st_uid=2000)
                    with self.assertRaises(UnsafeDatabasePath):
                        _check_directory(info)
            for owner in (0, 1000):
                with self.subTest(allowed_owner=owner):
                    _check_directory(SimpleNamespace(st_mode=stat.S_IFDIR | 0o1777, st_uid=owner))

    def test_traversal_rejected_before_directory_creation(self):
        with self.assertRaises(UnsafeDatabasePath):
            connect_private_db(self.root / "new" / ".." / "demo.sqlite3")
        self.assertFalse((self.root / "new").exists())
        self.assertFalse((self.root / "demo.sqlite3").exists())

    def test_all_four_clis_use_checks_under_isolated_python(self):
        commands = {"commerce": {"action": "list"}, "studio": {"action": "get"},
                    "monitor": {"action": "list"}, "factory": {"action": "list"}}
        self.db_path.parent.mkdir()
        for lab, command in commands.items():
            with self.subTest(lab=lab):
                path = self.db_path.parent / (lab + ".sqlite3")
                env = {**os.environ, "NEXUS_" + lab.upper() + "_DB": str(path)}
                script = ROOT / "labs" / lab / "backend.py"
                result = subprocess.run([sys.executable, "-I", str(script)], input=json.dumps(command),
                                        text=True, capture_output=True, env=env, timeout=10)
                self.assertEqual(result.returncode, 0, result.stderr)
                self.assertTrue(json.loads(result.stdout)["ok"])
                path.unlink()
                self.link(path, self.outside)
                result = subprocess.run([sys.executable, "-I", str(script)], input=json.dumps(command),
                                        text=True, capture_output=True, env=env, timeout=10)
                self.assertEqual(result.returncode, 1)
                self.assertEqual(result.stdout, "")
                self.assertNotIn(str(self.outside), result.stderr)
                self.assertNotIn(str(path), result.stderr)
                self.assertNotIn("Traceback", result.stderr)
                self.assertEqual(self.outside.read_bytes(), b"outside data must stay unchanged")
                path.unlink()


if __name__ == "__main__":
    unittest.main()
