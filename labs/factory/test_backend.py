"""Offline Factory QA: approval gate, artifact content, conflicts and bounded history."""
from concurrent.futures import ThreadPoolExecutor
from io import BytesIO
import json
from pathlib import Path
import tempfile
import unittest
from zipfile import ZipFile

from backend import connect, execute, FILES, sha256, verify_artifact

REQUEST = "Create a portfolio landing page with accessible typography"


class FactoryBackendTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.db = Path(self.temp.name) / "factory.sqlite3"

    def tearDown(self):
        self.temp.cleanup()

    def make_job(self, request=REQUEST, kind="feature"):
        result = execute({"action": "propose", "request": request, "kind": kind}, self.db)
        self.assertTrue(result["ok"], result)
        return result["job"]

    def test_plan_requires_approval_then_builds_reviewable_zip(self):
        job = self.make_job()
        self.assertEqual(job["status"], "proposed")
        self.assertEqual(job["plan"]["files"], list(FILES))
        self.assertFalse(job["downloadReady"])
        preview = execute({"action": "preview", "id": job["id"]}, self.db)["preview"]
        self.assertEqual(preview["jobId"], job["id"])
        self.assertEqual([item["name"] for item in preview["files"]], list(FILES[:3]))
        self.assertTrue(preview["qa"]["passed"])
        self.assertEqual(preview["files"][0]["sha256"],
                         sha256(preview["files"][0]["content"].encode("utf-8")))
        self.assertEqual(execute({"action": "build", "id": job["id"]}, self.db)["reason"], "approval-required")
        self.assertEqual(execute({"action": "approve", "id": job["id"], "confirmed": False}, self.db)["reason"],
                         "approval-required")
        approved = execute({"action": "approve", "id": job["id"], "confirmed": True}, self.db)["job"]
        self.assertEqual(approved["status"], "approved")
        built = execute({"action": "build", "id": job["id"]}, self.db)["job"]
        self.assertEqual(built["status"], "built")
        self.assertTrue(built["downloadReady"])
        self.assertEqual(len(built["qa"]["checks"]), 6)
        self.assertTrue(all(item["passed"] for item in built["qa"]["checks"]))
        self.assertEqual([event["stage"] for event in built["events"]],
                         ["requirements", "approval", "generation", "qa", "artifact"])
        import base64
        zipped = execute({"action": "artifact", "id": job["id"]}, self.db)
        self.assertTrue(zipped["ok"])
        with ZipFile(BytesIO(base64.b64decode(zipped["base64"]))) as archive:
            self.assertEqual(tuple(archive.namelist()), FILES)
            self.assertIn(REQUEST, archive.read("index.html").decode())
            self.assertIn("styles.css", archive.read("index.html").decode())
            self.assertTrue(json.loads(archive.read("qa-results.json"))["passed"])
            manifest = json.loads(archive.read("manifest.json"))
            self.assertEqual(manifest["schemaVersion"], 1)
            for name, item in manifest["files"].items():
                self.assertEqual(item["sha256"], sha256(archive.read(name)))
            self.assertEqual(preview["files"][0]["content"], archive.read("index.html").decode("utf-8"))
        self.assertTrue(verify_artifact(base64.b64decode(zipped["base64"])))
        self.assertEqual(execute({"action": "build", "id": job["id"]}, self.db)["reason"], "approval-required")

    def test_html_injection_escaped_even_when_request_is_malicious(self):
        request = '<script>alert("x")</script> & "hello"'
        job = self.make_job(request)
        execute({"action": "approve", "id": job["id"], "confirmed": True}, self.db)
        self.assertTrue(execute({"action": "build", "id": job["id"]}, self.db)["ok"])
        import base64
        raw = execute({"action": "artifact", "id": job["id"]}, self.db)
        with ZipFile(BytesIO(base64.b64decode(raw["base64"]))) as archive:
            html = archive.read("index.html").decode()
            self.assertNotIn("<script>", html)
            self.assertIn("&lt;script&gt;", html)
            self.assertIn("&amp;", html)

    def test_rejects_bad_inputs_and_ids(self):
        for request in ["short", "x" * 501, 15, None]:
            self.assertEqual(execute({"action": "propose", "request": request, "kind": "feature"},
                                     self.db)["reason"], "invalid-request")
        self.assertEqual(execute({"action": "propose", "request": REQUEST, "kind": "shell"},
                                 self.db)["reason"], "invalid-kind")
        for action in ("preview", "approve", "build", "artifact"):
            self.assertFalse(execute({"action": action, "id": "../../etc/passwd", "confirmed": True},
                                     self.db)["ok"])
        job = self.make_job()
        self.assertFalse(execute({"action": "artifact", "id": job["id"]}, self.db)["ok"])
        self.assertEqual(execute({"action": "approve", "id": job["id"], "confirmed": "true"},
                                 self.db)["reason"], "approval-required")

    def test_tampered_zip_is_blocked_even_when_qa_was_previously_green(self):
        job = self.make_job()
        execute({"action": "approve", "id": job["id"], "confirmed": True}, self.db)
        execute({"action": "build", "id": job["id"]}, self.db)
        with connect(self.db) as db:
            raw = db.execute("SELECT artifact FROM factory_jobs WHERE id=?", (job["id"],)).fetchone()[0]
            self.assertTrue(verify_artifact(raw))
            with ZipFile(BytesIO(raw), "r") as archive:
                items = {name: archive.read(name) for name in archive.namelist()}
            items["index.html"] = b"<script>changed</script>"
            out = BytesIO()
            with ZipFile(out, "w") as archive:
                for name, content in items.items():
                    archive.writestr(name, content)
            self.assertFalse(verify_artifact(out.getvalue()))
            db.execute("UPDATE factory_jobs SET artifact=? WHERE id=?", (out.getvalue(), job["id"]))
        failed = execute({"action": "artifact", "id": job["id"]}, self.db)
        self.assertEqual(failed["reason"], "artifact-integrity-failed")

    def test_preview_does_not_approve_or_build(self):
        job = self.make_job("Review this important feature before any build")
        for _ in range(3):
            preview = execute({"action": "preview", "id": job["id"]}, self.db)
            self.assertTrue(preview["ok"])
        persisted = execute({"action": "list"}, self.db)["jobs"][0]
        self.assertEqual(persisted["status"], "proposed")
        self.assertEqual([event["stage"] for event in persisted["events"]], ["requirements"])
        self.assertFalse(persisted["downloadReady"])

    def test_concurrent_build_has_exactly_one_winner(self):
        job = self.make_job()
        execute({"action": "approve", "id": job["id"], "confirmed": True}, self.db)
        with ThreadPoolExecutor(max_workers=2) as pool:
            futures = [pool.submit(execute, {"action": "build", "id": job["id"]}, self.db)
                       for _ in range(2)]
            outcomes = [item.result() for item in futures]
        self.assertEqual(sum(x["ok"] for x in outcomes), 1)
        self.assertEqual(sum(x.get("reason") == "approval-required" for x in outcomes), 1)
        self.assertEqual(execute({"action": "list"}, self.db)["jobs"][0]["status"], "built")

    def test_list_is_durable_and_old_jobs_are_pruned(self):
        first = self.make_job()
        self.assertEqual(execute({"action": "list"}, self.db)["jobs"][0]["id"], first["id"])
        self.assertEqual(execute({"action": "list"}, self.db)["jobs"][0]["status"], "proposed")
        for index in range(41):
            self.make_job(f"Feature request number {index} for the landing page")
        with connect(self.db) as db:
            self.assertEqual(db.execute("SELECT COUNT(*) FROM factory_jobs").fetchone()[0], 40)
        self.assertEqual(len(execute({"action": "list"}, self.db)["jobs"]), 20)
        self.assertEqual(execute({"action": "build", "id": first["id"]}, self.db)["reason"], "job-not-found")


if __name__ == "__main__":
    unittest.main()
