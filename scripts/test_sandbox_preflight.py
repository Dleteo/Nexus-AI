"""Offline regressions for the fail-closed P1 inventory; no task execution."""

import contextlib
import io
import json
from pathlib import Path
import stat
import unittest
from unittest.mock import Mock, patch

import sandbox_preflight


class SandboxPreflightTests(unittest.TestCase):
    def test_installed_commands_cannot_claim_verified_execution(self):
        observations = {
            "platform": "Linux",
            "uid": 1000,
            "commands_present": {"podman": True, "docker": True},
            "cgroup_v2_present": True,
        }
        result = sandbox_preflight.report(observations)
        self.assertFalse(result["execution"]["enabled"])
        self.assertEqual(result["execution"]["status"], "not_run")
        self.assertTrue(all(value == "unverified" for value in result["verification"].values()))

    def test_windows_and_unknown_platforms_are_not_linux_candidates(self):
        for system in ("Windows", "Darwin", "", None):
            with self.subTest(system=system):
                result = sandbox_preflight.report({"platform": system})
                self.assertFalse(result["platform_candidate"])
                self.assertFalse(result["execution"]["enabled"])

    def test_inventory_does_not_invoke_detected_commands(self):
        with patch.object(sandbox_preflight.platform, "system", return_value="Windows"), \
                patch.object(sandbox_preflight.shutil, "which", return_value="unused-command"), \
                patch("subprocess.Popen", side_effect=AssertionError("must not spawn")), \
                patch("os.system", side_effect=AssertionError("must not spawn")), \
                patch("socket.socket", side_effect=AssertionError("must not connect")):
            observations = sandbox_preflight.inventory()
        self.assertTrue(all(observations["commands_present"].values()))
        self.assertFalse(observations["cgroup_v2_present"])

    def test_cli_reports_blocked_without_success_exit(self):
        output = io.StringIO()
        with patch.object(sandbox_preflight, "inventory", return_value={"platform": "Linux"}), \
                contextlib.redirect_stdout(output):
            exit_code = sandbox_preflight.main([])
        self.assertEqual(exit_code, 2)
        self.assertEqual(json.loads(output.getvalue())["execution"]["status"], "not_run")

    def test_enable_flag_is_rejected(self):
        with contextlib.redirect_stderr(io.StringIO()), self.assertRaises(SystemExit) as error:
            sandbox_preflight.main(["--enable"])
        self.assertNotEqual(error.exception.code, 0)

    def test_metadata_reads_are_bounded_ascii_and_fail_unknown(self):
        for raw, expected in ((b"cpu memory\n", "cpu memory"),
                              (b"x" * (sandbox_preflight.METADATA_LIMIT + 1), None),
                              (b"\xff", None)):
            with self.subTest(raw_length=len(raw)), \
                    patch.object(Path, "open", return_value=io.BytesIO(raw)):
                self.assertEqual(sandbox_preflight._read_metadata(Path("unused")), expected)
        for error in (FileNotFoundError(), PermissionError(), OSError()):
            with self.subTest(error=type(error).__name__), patch.object(Path, "open", side_effect=error):
                self.assertIsNone(sandbox_preflight._read_metadata(Path("unused")))

    def test_uid_mapping_rejects_malformed_or_excessive_metadata(self):
        self.assertEqual(sandbox_preflight._uid_mapping("0 1000 1"),
                         [{"inside": 0, "outside": 1000, "length": 1}])
        for raw in (None, "", "0 0", "0 0 1 2", "-1 0 1", "0 0 0", "0 0 nope",
                    "4294967295 0 2", "0 0 1\n" * 33):
            with self.subTest(raw=raw):
                self.assertIsNone(sandbox_preflight._uid_mapping(raw))

    def test_controllers_are_bounded_names_not_arbitrary_strings(self):
        self.assertEqual(sandbox_preflight._controller_names("pids cpu memory cpu"), ["cpu", "memory", "pids"])
        self.assertEqual(sandbox_preflight._controller_names(""), [])
        for raw in (None, "cpu ../memory", "memory\x00", "x" * 33, "cpu " * 33):
            with self.subTest(raw=raw):
                self.assertIsNone(sandbox_preflight._controller_names(raw))

    def test_cgroup_membership_cannot_select_outside_sysfs(self):
        self.assertEqual(sandbox_preflight._cgroup_directory("0::/"), (True, Path("/sys/fs/cgroup")))
        self.assertEqual(sandbox_preflight._cgroup_directory("0::/team/task"),
                         (True, Path("/sys/fs/cgroup/team/task")))
        self.assertEqual(sandbox_preflight._cgroup_directory("1:cpu:/legacy"), (False, None))
        for raw in (None, "0::../outside", "0::/../outside", "0::/team/./task", "0:://outside",
                    "0::/team/", "0::/team\\task", "0::/team\x00task", "0::/a\n0::/b",
                    "0::/" + "x" * 1025):
            with self.subTest(raw=raw):
                self.assertEqual(sandbox_preflight._cgroup_directory(raw), (None, None))

    def test_presence_and_write_observations_do_not_follow_socket_links(self):
        for mode, expected in ((stat.S_IFSOCK | 0o600, True), (stat.S_IFLNK | 0o777, False),
                               (stat.S_IFREG | 0o600, False)):
            with self.subTest(mode=mode), patch.object(Path, "lstat", return_value=Mock(st_mode=mode)):
                self.assertIs(sandbox_preflight._socket_present(Path("unused")), expected)
        for error, expected in ((FileNotFoundError(), False), (PermissionError(), None)):
            with patch.object(Path, "lstat", side_effect=error):
                self.assertIs(sandbox_preflight._socket_present(Path("unused")), expected)
        with patch.object(Path, "exists", return_value=False), patch.object(sandbox_preflight.os, "access") as access:
            self.assertIsNone(sandbox_preflight._path_writable(Path("unused")))
            access.assert_not_called()
        for writable in (True, False):
            with patch.object(Path, "exists", return_value=True), \
                    patch.object(sandbox_preflight.os, "access", return_value=writable):
                self.assertIs(sandbox_preflight._path_writable(Path("unused")), writable)
        with patch.object(Path, "exists", side_effect=PermissionError()):
            self.assertIsNone(sandbox_preflight._path_writable(Path("unused")))
        with patch.object(Path, "is_file", side_effect=PermissionError()):
            self.assertIsNone(sandbox_preflight._file_present(Path("unused")))

    def test_linux_inventory_with_available_metadata_still_cannot_enable_execution(self):
        contents = {
            "/proc/self/uid_map": "0 1000 1",
            "/proc/self/cgroup": "0::/worker",
            "/sys/fs/cgroup/worker/cgroup.controllers": "cpu memory pids",
            "/sys/fs/cgroup/worker/cgroup.subtree_control": "cpu memory pids",
        }
        with patch.object(sandbox_preflight.platform, "system", return_value="Linux"), \
                patch.object(sandbox_preflight.os, "getuid", return_value=1000, create=True), \
                patch.object(sandbox_preflight.shutil, "which", return_value="unused-command"), \
                patch.object(sandbox_preflight, "_file_present", return_value=True), \
                patch.object(sandbox_preflight, "_read_metadata", side_effect=lambda path: contents[str(path)]), \
                patch.object(sandbox_preflight, "_path_writable", return_value=True), \
                patch.object(sandbox_preflight, "_socket_present", return_value=True), \
                patch("subprocess.Popen", side_effect=AssertionError("must not spawn")), \
                patch("os.system", side_effect=AssertionError("must not spawn")), \
                patch("socket.socket", side_effect=AssertionError("must not connect")):
            observations = sandbox_preflight.inventory()
        metadata = observations["linux_metadata"]
        self.assertEqual(metadata["scope"], "metadata_only_not_isolation_evidence")
        self.assertTrue(metadata["cgroup_directory_writable"])
        self.assertTrue(metadata["conventional_rootless_socket_present"])
        self.assertEqual(metadata["cgroup_controllers"], ["cpu", "memory", "pids"])
        self.assertNotIn("/worker", json.dumps(metadata))
        result = sandbox_preflight.report(observations)
        self.assertFalse(result["execution"]["enabled"])
        self.assertEqual(result["execution"]["status"], "not_run")
        self.assertTrue(all(value == "unverified" for value in result["verification"].values()))

    def test_linux_missing_or_unreadable_metadata_remains_unknown(self):
        with patch.object(sandbox_preflight.platform, "system", return_value="Linux"), \
                patch.object(sandbox_preflight.os, "getuid", return_value=1000, create=True), \
                patch.object(sandbox_preflight.shutil, "which", return_value=None), \
                patch.object(Path, "open", side_effect=PermissionError()), \
                patch.object(Path, "is_file", side_effect=PermissionError()), \
                patch.object(Path, "lstat", side_effect=PermissionError()):
            observations = sandbox_preflight.inventory()
        self.assertIsNone(observations["cgroup_v2_present"])
        self.assertTrue(all(value is None for key, value in observations["linux_metadata"].items() if key != "scope"))
        self.assertFalse(sandbox_preflight.report(observations)["execution"]["enabled"])

    def test_non_linux_inventory_never_reads_linux_metadata(self):
        for system in ("Windows", "Darwin"):
            with self.subTest(system=system), \
                    patch.object(sandbox_preflight.platform, "system", return_value=system), \
                    patch.object(sandbox_preflight.shutil, "which", return_value=None), \
                    patch.object(sandbox_preflight, "_linux_metadata", side_effect=AssertionError("must not read")):
                observations = sandbox_preflight.inventory()
            self.assertEqual(observations["linux_metadata"], {"scope": "not_applicable"})
            self.assertFalse(observations["cgroup_v2_present"])


if __name__ == "__main__":
    unittest.main()
