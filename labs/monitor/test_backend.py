"""Monitor tests: real SQLite history, safe target, alerts, retention and concurrency."""
from concurrent.futures import ThreadPoolExecutor
from contextlib import contextmanager
import json
from pathlib import Path
import socket
import socketserver
import tempfile
from threading import Thread
import unittest

from backend import connect, execute, record, snapshot, summarize, SLOW_MS


def sample(ok=True, ms=42):
    return {"ok": ok, "ms": ms, "status_code": 200 if ok else 503,
            "note": "healthy" if ok else "unhealthy-response"}


@contextmanager
def broken_local_health_response(payload):
    """Trusted bounded protocol fixture; never listens outside loopback."""
    requests, closed, errors = [], [], []

    class Handler(socketserver.BaseRequestHandler):
        def handle(self):
            self.request.settimeout(2)
            try:
                incoming = bytearray()
                while b"\r\n\r\n" not in incoming and len(incoming) < 4096:
                    chunk = self.request.recv(4096 - len(incoming))
                    if not chunk:
                        break
                    incoming.extend(chunk)
                requests.append(bytes(incoming))
                if payload:
                    self.request.sendall(payload)
                # Force a response EOF while still observing the client's close.
                self.request.shutdown(socket.SHUT_WR)
                closed.append(self.request.recv(1) == b"")
            except OSError as error:
                errors.append(type(error).__name__)

    server = socketserver.TCPServer(("127.0.0.1", 0), Handler)
    thread = Thread(target=lambda: server.serve_forever(poll_interval=0.01), daemon=True)
    thread.start()
    try:
        yield server.server_address[1], requests, closed, errors
    finally:
        server.shutdown()
        thread.join(timeout=3)
        server.server_close()
        if thread.is_alive():
            raise RuntimeError("local HTTP fixture did not stop")


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

    def test_protocol_failures_persist_and_feed_alerts_without_socket_leaks(self):
        execute({"action": "probe", "port": 3100}, self.db, probe=lambda _: sample())
        replies = [
            ("bad-status", b"NOT_HTTP\r\n\r\n", None),
            ("truncated-chunk", b"HTTP/1.1 200 OK\r\nTransfer-Encoding: chunked\r\n\r\n5\r\nab", 200),
            ("disconnected", b"", None),
            ("invalid-status", b"HTTP/1.1 600 Nonstandard\r\nContent-Length: 0\r\n\r\n", None),
        ]
        for index, (label, payload, expected_status) in enumerate(replies, start=1):
            with self.subTest(reply=label):
                with broken_local_health_response(payload) as (port, requests, closed, errors):
                    state = execute({"action": "probe", "port": port}, self.db)
                self.assertEqual(errors, [])
                self.assertEqual(closed, [True], "Probe must close the local connection after protocol errors")
                self.assertEqual(len(requests), 1)
                self.assertTrue(requests[0].startswith(b"GET /api/labs/health HTTP/1.1\r\n"))
                self.assertTrue(state["ok"])
                self.assertFalse(state["checks"][0]["ok"])
                self.assertEqual(state["checks"][0]["note"], "connection-error")
                self.assertEqual(state["checks"][0]["statusCode"], expected_status)
                self.assertTrue(0 <= state["checks"][0]["ms"] <= 30000)
                self.assertEqual(state["alert"]["samples"], index + 1)
                self.assertEqual(state["alert"]["consecutiveFailures"], index)
                self.assertEqual(state["alert"]["level"], "critical" if index >= 3 else "warning")
                persisted = execute({"action": "list"}, self.db)
                self.assertEqual(persisted["checks"], state["checks"])


if __name__ == "__main__":
    unittest.main()
