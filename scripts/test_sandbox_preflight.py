"""Offline regressions for the fail-closed P1 inventory; no task execution."""

import contextlib
import io
import json
import unittest
from unittest.mock import patch

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


if __name__ == "__main__":
    unittest.main()
