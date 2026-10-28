"""Nexus Monitor: local-only, manually triggered health probes and SQLite history.

Standard library only. The probe is hard-coded to GET /api/labs/health on
127.0.0.1; neither a hostname nor a URL is accepted from the caller.
No background jobs, external probes, emails or vendor APIs.
"""
from __future__ import annotations

import http.client
import json
import os
from pathlib import Path
import sqlite3
import sys
from time import perf_counter

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "labs"))
from sqlite_storage import connect_private_db
DEFAULT_DB = ROOT / ".nexus-local" / "monitor.sqlite3"
MAX_HISTORY = 300
SLOW_MS = 500


def connect(path: Path) -> sqlite3.Connection:
    db = connect_private_db(path)
    db.row_factory = sqlite3.Row
    db.execute("PRAGMA busy_timeout=5000")
    db.executescript("""
        CREATE TABLE IF NOT EXISTS monitor_checks (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
          ok INTEGER NOT NULL CHECK (ok IN (0,1)),
          ms INTEGER NOT NULL CHECK (ms >= 0 AND ms <= 30000),
          status_code INTEGER,
          note TEXT NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_monitor_recent ON monitor_checks(id DESC);
    """)
    return db


def probe_local_health(port: int) -> dict:
    """One bounded HTTP request; no redirects or user-controlled target."""
    conn = http.client.HTTPConnection("127.0.0.1", port, timeout=2)
    start = perf_counter()
    response_code = None
    ok = False
    note = "probe-failed"
    try:
        conn.request("GET", "/api/labs/health", headers={"Accept": "application/json"})
        response = conn.getresponse()
        response_code = response.status
        if response_code == 200:
            payload = response.read(2049)
            if len(payload) <= 2048:
                doc = json.loads(payload)
                ok = isinstance(doc, dict) and doc.get("status") == "ok" and doc.get("service") == "nexus-labs"
        note = "healthy" if ok else "unhealthy-response"
    except (OSError, TimeoutError, json.JSONDecodeError, ValueError):
        note = "connection-error"
    finally:
        conn.close()
    elapsed = min(30000, max(0, round((perf_counter() - start) * 1000)))
    return {"ok": ok, "ms": elapsed, "status_code": response_code, "note": note}


def summarize(records: list[dict]) -> dict:
    if not records:
        return {"level": "unknown", "message": "No server-side measurements yet.", "consecutiveFailures": 0,
                "successPercent": None, "p95Ms": None, "samples": 0}
    consecutive = 0
    for row in records:
        if row["ok"]:
            break
        consecutive += 1
    valid_ms = sorted(row["ms"] for row in records if row["ok"])
    successful = len(valid_ms)
    p95 = valid_ms[(95 * successful + 99) // 100 - 1] if successful else None
    if consecutive >= 3:
        level, message = "critical", "Three consecutive local health checks failed."
    elif not records[0]["ok"]:
        level, message = "warning", "The latest local health check failed."
    elif records[0]["ms"] >= SLOW_MS:
        level, message = "warning", "The latest local health check exceeded 500 ms."
    else:
        level, message = "healthy", "Latest local health check passed."
    return {
        "level": level,
        "message": message,
        "consecutiveFailures": consecutive,
        "successPercent": round(100 * successful / len(records), 1),
        "p95Ms": p95,
        "samples": len(records),
    }


def snapshot(db: sqlite3.Connection) -> dict:
    checks = [
        {"id": row["id"], "at": row["at"], "ok": bool(row["ok"]), "ms": row["ms"],
         "statusCode": row["status_code"], "note": row["note"]}
        for row in db.execute("SELECT * FROM monitor_checks ORDER BY id DESC LIMIT 100")
    ]
    return {"ok": True, "mode": "local-sqlite", "checks": checks, "alert": summarize(checks),
            "scope": "127.0.0.1 /api/labs/health (manual probes only)"}


def record(db: sqlite3.Connection, sample: dict) -> dict:
    """Only invoked with results from the fixed local HTTP probe."""
    if not isinstance(sample, dict) or type(sample.get("ok")) is not bool:
        raise ValueError("invalid-probe")
    if type(sample.get("ms")) is not int or not 0 <= sample["ms"] <= 30000:
        raise ValueError("invalid-latency")
    code = sample.get("status_code")
    if code is not None and (type(code) is not int or not 100 <= code <= 599):
        raise ValueError("invalid-status")
    note = sample.get("note")
    if not isinstance(note, str) or not 1 <= len(note) <= 80:
        raise ValueError("invalid-note")
    db.execute("BEGIN IMMEDIATE")
    try:
        db.execute(
            "INSERT INTO monitor_checks(ok,ms,status_code,note) VALUES(?,?,?,?)",
            (int(sample["ok"]), sample["ms"], code, note),
        )
        db.execute(
            "DELETE FROM monitor_checks WHERE id NOT IN "
            "(SELECT id FROM monitor_checks ORDER BY id DESC LIMIT ?)",
            (MAX_HISTORY,),
        )
        db.execute("COMMIT")
    except Exception:
        if db.in_transaction:
            db.execute("ROLLBACK")
        raise
    return snapshot(db)


def execute(command: object, db_path: Path, probe=probe_local_health) -> dict:
    if not isinstance(command, dict):
        return {"ok": False, "reason": "invalid-request"}
    action = command.get("action")
    if action not in ("list", "probe"):
        return {"ok": False, "reason": "unsupported-action"}
    if action == "probe":
        port = command.get("port")
        if type(port) is not int or not 1 <= port <= 65535:
            return {"ok": False, "reason": "invalid-port"}
    with connect(db_path) as db:
        if action == "list":
            return snapshot(db)
        return record(db, probe(port))


def main() -> int:
    try:
        raw = sys.stdin.buffer.read(2049)
        if len(raw) > 2048:
            raise ValueError("request-too-large")
        command = json.loads(raw.decode("utf-8"))
        db_path = Path(os.environ.get("NEXUS_MONITOR_DB", str(DEFAULT_DB)))
        sys.stdout.write(json.dumps(execute(command, db_path)))
        return 0
    except (ValueError, UnicodeDecodeError, json.JSONDecodeError):
        sys.stdout.write(json.dumps({"ok": False, "reason": "invalid-request"}))
        return 0
    except (sqlite3.Error, OSError):
        sys.stderr.write("Nexus Monitor SQLite operation failed.\n")
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
