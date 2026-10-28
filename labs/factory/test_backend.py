"""Offline Factory QA: approval gate, artifact content, conflicts and bounded history."""
from concurrent.futures import ThreadPoolExecutor
from io import BytesIO
import json
from pathlib import Path
import stat
import struct
import tempfile
import unittest
import warnings
from unittest.mock import patch
from zipfile import ZipFile, ZipInfo, ZIP_BZIP2, ZIP_DEFLATED
import zlib

from backend import connect, execute, FILES, sha256, verify_artifact
from factory.sandbox_snapshot import SnapshotFile, validate_snapshot

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

    def test_execution_stays_not_run_after_static_qa_and_ignored_self_reports(self):
        expected = {"enabled": False, "status": "not_run", "reason": "isolation_not_verified"}
        with patch.dict("os.environ", {"NEXUS_FACTORY_EXECUTION": "1", "NEXUS_SANDBOX_ENABLED": "1"}):
            job = execute({"action": "propose", "request": REQUEST, "kind": "feature",
                           "execution": {"enabled": True, "status": "passed"}}, self.db)["job"]
            self.assertEqual(job["execution"], expected)
            for action in ("approve", "build"):
                job = execute({"action": action, "id": job["id"], "confirmed": True,
                               "execution": {"enabled": True, "status": "passed"}}, self.db)["job"]
                self.assertEqual(job["execution"], expected)
            self.assertTrue(job["qa"]["passed"])
            self.assertEqual(execute({"action": "preview", "id": job["id"]}, self.db)
                             ["preview"]["execution"], expected)
            self.assertEqual(execute({"action": "list"}, self.db)["jobs"][0]["execution"], expected)
            for action in ("execute", "run", "test"):
                self.assertEqual(execute({"action": action, "id": job["id"]}, self.db)["reason"],
                                 "unsupported-action")
            self.assertEqual(execute({"action": "list"}, self.db)["jobs"][0]["execution"], expected)

    def test_snapshot_digest_matches_preview_bytes_and_changes_only_with_source(self):
        job = self.make_job("Review a source snapshot with accents: café and áéíóú")
        preview = execute({"action": "preview", "id": job["id"]}, self.db)["preview"]
        displayed = [SnapshotFile(item["name"], item["content"].encode("utf-8"))
                     for item in preview["files"]]
        snapshot = validate_snapshot(displayed)
        self.assertEqual(preview["snapshot"], {"sha256": snapshot.digest, "fileCount": 3,
                                             "totalBytes": sum(len(item.content) for item in displayed)})
        self.assertEqual(execute({"action": "preview", "id": job["id"]}, self.db)
                         ["preview"]["snapshot"], preview["snapshot"])
        execute({"action": "approve", "id": job["id"], "confirmed": True}, self.db)
        execute({"action": "build", "id": job["id"]}, self.db)
        self.assertEqual(execute({"action": "preview", "id": job["id"]}, self.db)
                         ["preview"]["snapshot"], preview["snapshot"])
        different = self.make_job("Review another source snapshot with different text")
        other = execute({"action": "preview", "id": different["id"]}, self.db)["preview"]
        self.assertNotEqual(other["snapshot"]["sha256"], preview["snapshot"]["sha256"])
        self.assertFalse(other["execution"]["enabled"])

    def built_zip(self):
        job = self.make_job()
        execute({"action": "approve", "id": job["id"], "confirmed": True}, self.db)
        self.assertTrue(execute({"action": "build", "id": job["id"]}, self.db)["ok"])
        with connect(self.db) as db:
            raw = db.execute("SELECT artifact FROM factory_jobs WHERE id=?", (job["id"],)).fetchone()[0]
        with ZipFile(BytesIO(raw)) as archive:
            return job, [(info.filename, archive.read(info)) for info in archive.infolist()]

    def repack(self, entries, compression=ZIP_DEFLATED):
        out = BytesIO()
        with warnings.catch_warnings():
            warnings.simplefilter("ignore", UserWarning)  # Deliberate duplicate member below.
            with ZipFile(out, "w", compression) as archive:
                for name, data in entries:
                    archive.writestr(name, data)
        return out.getvalue()

    def test_zip_paths_duplicates_and_legacy_archives_are_rejected(self):
        job, entries = self.built_zip()
        for name in ("../index.html", "/index.html", "C:\\index.html", "folder/../index.html"):
            with self.subTest(path=name):
                self.assertFalse(verify_artifact(self.repack([(name, entries[0][1]), *entries[1:]])))
        self.assertFalse(verify_artifact(self.repack([*entries, entries[0]])))
        legacy = self.repack(entries[:-1])
        self.assertFalse(verify_artifact(legacy))
        with connect(self.db) as db:
            db.execute("UPDATE factory_jobs SET artifact=? WHERE id=?", (legacy, job["id"]))
        self.assertEqual(execute({"action": "artifact", "id": job["id"]}, self.db)["reason"],
                         "artifact-integrity-failed")
        self.assertEqual(execute({"action": "list"}, self.db)["jobs"][0]["status"], "built")

    def test_zip_symlinks_special_files_and_unsupported_compression_are_rejected(self):
        _, entries = self.built_zip()
        for file_type in (stat.S_IFLNK, stat.S_IFIFO, stat.S_IFCHR):
            with self.subTest(file_type=file_type):
                info = ZipInfo("index.html")
                info.create_system = 3
                info.external_attr = (file_type | 0o600) << 16
                self.assertFalse(verify_artifact(self.repack([(info, entries[0][1]), *entries[1:]])))
        self.assertFalse(verify_artifact(self.repack(entries, ZIP_BZIP2)))

    def test_zip_limits_and_corrupt_compressed_data_are_rejected(self):
        _, entries = self.built_zip()
        self.assertFalse(verify_artifact(self.repack([("index.html", b"a" * 12_001), *entries[1:]])))
        self.assertFalse(verify_artifact(b"a" * 120_001))
        self.assertFalse(verify_artifact(b"not-a-zip"))
        raw = bytearray(self.repack(entries))
        with ZipFile(BytesIO(raw)) as archive:
            info = archive.infolist()[0]
            payload_offset = info.header_offset + 30 + len(info.filename.encode()) + len(info.extra)
        raw[payload_offset] = 0xff
        self.assertFalse(verify_artifact(bytes(raw)))

    def test_download_rejects_hidden_deflate_output_beyond_declared_source(self):
        job, entries = self.built_zip()
        expected = dict(entries)
        prefix = expected["index.html"]
        hidden = b"INERT-HIDDEN-TRAILER" * 20
        raw = bytearray(self.repack([
            (name, content + hidden if name == "index.html" else content)
            for name, content in entries
        ]))
        central = raw.index(b"PK\x01\x02")
        # Lie consistently in both headers: standard ZipFile.read accepts the
        # expected prefix/CRC while ignoring the extra actual deflate output.
        for offset in (22, central + 24):
            struct.pack_into("<L", raw, offset, len(prefix))
        for offset in (14, central + 16):
            struct.pack_into("<L", raw, offset, zlib.crc32(prefix))
        with ZipFile(BytesIO(raw)) as archive:
            self.assertEqual(archive.read("index.html"), prefix)
        self.assertFalse(verify_artifact(bytes(raw)))
        self.assertFalse(verify_artifact(bytes(raw), expected))
        with connect(self.db) as db:
            db.execute("UPDATE factory_jobs SET artifact=? WHERE id=?", (bytes(raw), job["id"]))
        self.assertEqual(execute({"action": "artifact", "id": job["id"]}, self.db)["reason"],
                         "artifact-integrity-failed")
        persisted = execute({"action": "list"}, self.db)["jobs"][0]
        self.assertEqual(persisted["status"], "built")
        self.assertTrue(persisted["qa"]["passed"])
        self.assertEqual(persisted["execution"]["status"], "not_run")

    def test_archive_envelope_must_be_plain_and_match_its_members(self):
        _, entries = self.built_zip()
        raw = self.repack(entries)
        variants = [b"INERT-PREFIX" + raw, raw + b"INERT-TRAILER"]
        wrong_count = bytearray(raw)
        struct.pack_into("<HH", wrong_count, len(wrong_count) - 14, 1, 1)
        variants.append(bytes(wrong_count))
        for malformed in variants:
            with self.subTest(length=len(malformed)):
                self.assertFalse(verify_artifact(malformed, dict(entries)))
        # Both codecs used by legitimate small artifacts remain supported.
        self.assertTrue(verify_artifact(self.repack(entries, compression=0), dict(entries)))
        self.assertTrue(verify_artifact(raw, dict(entries)))

    def test_manifest_duplicate_keys_and_invalid_schema_are_rejected(self):
        _, entries = self.built_zip()
        manifest = json.loads(entries[-1][1])
        manifest["schemaVersion"] = True
        self.assertFalse(verify_artifact(self.repack([*entries[:-1], ("manifest.json", json.dumps(manifest))])))
        duplicate = entries[-1][1].replace(b'"schemaVersion": 1', b'"schemaVersion": 2, "schemaVersion": 1')
        self.assertFalse(verify_artifact(self.repack([*entries[:-1], ("manifest.json", duplicate)])))

    def test_download_rejects_rewritten_content_even_with_matching_manifest(self):
        job, entries = self.built_zip()
        files = dict(entries)
        files["index.html"] = b"<script>not the approved fixed template</script>"
        manifest = json.loads(files["manifest.json"])
        manifest["files"]["index.html"] = {"sha256": sha256(files["index.html"]),
                                              "size": len(files["index.html"])}
        files["manifest.json"] = json.dumps(manifest).encode()
        rewritten = self.repack(files.items())
        self.assertTrue(verify_artifact(rewritten))  # Self-consistency alone is not authenticity.
        with connect(self.db) as db:
            db.execute("UPDATE factory_jobs SET artifact=? WHERE id=?", (rewritten, job["id"]))
        self.assertEqual(execute({"action": "artifact", "id": job["id"]}, self.db)["reason"],
                         "artifact-integrity-failed")

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
