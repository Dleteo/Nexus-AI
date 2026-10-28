"""Monitor tests: real SQLite history, safe target, alerts, retention and concurrency."""
from concurrent.futures import ThreadPoolExecutor
import json
from pathlib import Path
import tempfile
import unittest

from backend import connect, execute, record, snapshot, summarize, SLOW_MS


def sample(ok=True, ms=42):
    return {"ok": ok, "ms": ms, "status_code": 200 if ok else 503,
            "note": "healthy" if ok else "unhealthy-response"}


class MonitorBackendTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.db = Path(self.temp.name) / "monitor.sqlite3"

    def tearDown(self):
        self.temp.cleanup()

    def test_persists_real_samples_between_calls(self):
        state = execute({"action": "list"}, self.db)
        self.assertEqual(state["alert"]["level"], "unknown")
        first = execute({"action": "probe", "port": 3100}, self.db, probe=lambda _: sample())
        self.assertTrue(first["ok"])
        self.assertEqual(first["checks"][0]["ms"], 42)
        self.assertEqual(first["alert"]["level"], "healthy")
        again = execute({"action": "list"}, self.db)
        self.assertEqual(again["checks"][0]["id"], first["checks"][0]["id"])
        self.assertEqual(again["alert"]["successPercent"], 100)

    def test_local_alerts_transition_and_p95(self):
        def probe(result):
            return execute({"action": "probe", "port": 3100}, self.db, probe=lambda _: result)
        probe(sample(True, 10))
        probe(sample(False, 55))
        probe(sample(False, 60))
        self.assertEqual(probe(sample(False, 65))["alert"]["level"], "critical")
        self.assertEqual(execute({"action": "list"}, self.db)["alert"]["consecutiveFailures"], 3)
        state = probe(sample(True, SLOW_MS))
        self.assertEqual(state["alert"]["level"], "warning")
        self.assertEqual(state["alert"]["message"], "The latest local health check exceeded 500 ms.")
        self.assertEqual(state["alert"]["p95Ms"], SLOW_MS)
        state = probe(sample(True, 100))
        self.assertEqual(state["alert"]["level"], "healthy")
        self.assertEqual(state["alert"]["consecutiveFailures"], 0)
        self.assertEqual(state["alert"]["samples"], 6)
        self.assertEqual(state["alert"]["successPercent"], 50)

    def test_rejects_non_port_inputs_and_arbitrary_urls(self):
        forbidden = [0, 65536, -1, 2.3, True, "3000", None]
        for port in forbidden:
            result = execute({"action": "probe", "port": port}, self.db)
            self.assertEqual(result["reason"], "invalid-port")
        self.assertEqual(execute({"action": "scan", "url": "http://example.com"}, self.db)["reason"],
                         "unsupported-action")
        # Only the numeric port reaches the injected probe; caller URL is ignored.
        called = []
        execute({"action": "probe", "port": 3100, "url": "http://example.com"},
                self.db, probe=lambda port: (called.append(port) or sample()))
        self.assertEqual(called, [3100])
        self.assertEqual(execute({"action": "list"}, self.db)["checks"][0]["note"], "healthy")

    def test_bounded_history_and_atomic_concurrent_records(self):
        with connect(self.db) as db:
            for index in range(310):
                record(db, sample(True, index))
            self.assertEqual(db.execute("SELECT COUNT(*) FROM monitor_checks").fetchone()[0], 300)
            self.assertEqual(len(snapshot(db)["checks"]), 100)
        def check(_):
            return execute({"action": "probe", "port": 3001}, self.db,
                           probe=lambda _: sample(False, 10))
        with ThreadPoolExecutor(max_workers=4) as executor:
            result = list(executor.map(check, range(8)))
        self.assertTrue(all(item["ok"] for item in result))
        with connect(self.db) as db:
            self.assertEqual(db.execute("SELECT COUNT(*) FROM monitor_checks").fetchone()[0], 300)
            self.assertEqual(db.execute("SELECT COUNT(DISTINCT id) FROM monitor_checks").fetchone()[0], 300)

    def test_rejects_malformed_record_not_inserts(self):
        with connect(self.db) as db:
            for value in [{"ok": True, "ms": -1, "status_code": 200, "note": "healthy"},
                          {"ok": "yes", "ms": 1, "status_code": 200, "note": "healthy"},
                          {"ok": False, "ms": 1, "status_code": 1000, "note": "failure"},
                          {"ok": False, "ms": 1, "status_code": None, "note": ""}]:
                with self.assertRaises(ValueError):
                    record(db, value)
            self.assertEqual(len(snapshot(db)["checks"]), 0)


if __name__ == "__main__":
    unittest.main()
