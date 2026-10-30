"""Studio regression tests: revision history, validation and write conflicts."""
import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest
from concurrent.futures import ThreadPoolExecutor

from backend import execute, validate_blocks

SCRIPT = Path(__file__).with_name("backend.py")
FIRST = [{"id": "hero-1", "type": "hero", "text": "A safer editor"}]
SECOND = [{"id": "hero-1", "type": "hero", "text": "Version two"},
          {"id": "text-2", "type": "text", "text": "Welcome"}]


class StudioBackendTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.db = Path(self.temp.name) / "studio.sqlite3"

    def tearDown(self):
        self.temp.cleanup()

    def test_initial_and_persistent_versions(self):
        state = execute({"action": "get"}, self.db)
        self.assertTrue(state["ok"])
        self.assertEqual(state["revision"], 0)
        self.assertEqual(len(state["blocks"]), 3)
        saved = execute({"action": "save", "expectedRevision": 0, "blocks": FIRST}, self.db)
        self.assertTrue(saved["ok"])
        self.assertEqual(saved["revision"], 1)
        reloaded = execute({"action": "get"}, self.db)
        self.assertEqual(reloaded["blocks"], FIRST)
        self.assertEqual([v["revision"] for v in reloaded["revisions"]], [1, 0])

    def test_schema_limits_and_html_as_data(self):
        bad_blocks = [
            None, "not-list", [{}], [{"id": "bad id", "type": "hero", "text": "x"}],
            [{"id": "ok", "type": "iframe", "text": "x"}],
            [{"id": "ok", "type": "hero", "text": "x" * 501}],
            [{"id": "ok", "type": "hero", "text": "x", "html": "<script>"}],
            FIRST * 2, FIRST * 31,
        ]
        for blocks in bad_blocks:
            self.assertFalse(validate_blocks(blocks))
            self.assertEqual(
                execute({"action": "save", "expectedRevision": 0, "blocks": blocks}, self.db)["reason"],
                "invalid-document",
            )
        self.assertEqual(execute({"action": "get"}, self.db)["revision"], 0)
        markup = [{"id": "safe-1", "type": "hero", "text": "<script>alert(1)</script>"}]
        self.assertTrue(execute({"action": "save", "expectedRevision": 0, "blocks": markup}, self.db)["ok"])
        self.assertEqual(execute({"action": "get"}, self.db)["blocks"], markup)
        # Markup remains plain text; rendering is escaped by Studio's separate HTML exporter.

    def test_restore_creates_new_revision_and_never_deletes_history(self):
        execute({"action": "save", "expectedRevision": 0, "blocks": FIRST}, self.db)
        execute({"action": "save", "expectedRevision": 1, "blocks": SECOND}, self.db)
        restored = execute({"action": "restore", "expectedRevision": 2, "revision": 1}, self.db)
        self.assertEqual(restored["revision"], 3)
        self.assertEqual(restored["blocks"], FIRST)
        self.assertEqual([v["revision"] for v in restored["revisions"]], [3, 2, 1, 0])
        self.assertEqual(execute({"action": "restore", "expectedRevision": 3, "revision": 99}, self.db)["reason"],
                         "revision-not-found")

    def test_revision_conflict_keeps_first_write(self):
        execute({"action": "get"}, self.db)
        def save(content):
            return execute({"action": "save", "expectedRevision": 0, "blocks": content}, self.db)
        with ThreadPoolExecutor(max_workers=2) as executor:
            first = executor.submit(save, FIRST)
            second = executor.submit(save, SECOND)
            outcomes = [first.result(), second.result()]
        self.assertEqual(sum(result["ok"] for result in outcomes), 1)
        self.assertEqual(sum(result.get("reason") == "revision-conflict" for result in outcomes), 1)
        self.assertEqual(execute({"action": "get"}, self.db)["revision"], 1)
        self.assertEqual(len(execute({"action": "get"}, self.db)["revisions"]), 2)

    def test_cli_roundtrip(self):
        env = {**os.environ, "NEXUS_STUDIO_DB": str(self.db)}
        for command in [
            {"action": "get"},
            {"action": "save", "expectedRevision": 0, "blocks": FIRST},
            {"action": "get"},
        ]:
            result = subprocess.run([sys.executable, str(SCRIPT)],
                                    input=json.dumps(command), capture_output=True,
                                    text=True, env=env, check=True)
            self.assertTrue(json.loads(result.stdout)["ok"])
        self.assertEqual(json.loads(result.stdout)["revision"], 1)


if __name__ == "__main__":
    unittest.main()
