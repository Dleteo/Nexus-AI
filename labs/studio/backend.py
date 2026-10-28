"""Nexus Studio: local-only SQLite document revisions with optimistic locking.

Standard library only. One bounded JSON command through stdin/stdout.
Never expose the development API to other computers or the public internet.
"""
from __future__ import annotations

import json
import os
from pathlib import Path
import re
import sqlite3
import sys

ROOT = Path(__file__).resolve().parents[2]
DEFAULT_DB = ROOT / ".nexus-local" / "studio.sqlite3"
INITIAL = [
    {"id": "hero-1", "type": "hero", "text": "Build something remarkable."},
    {"id": "text-2", "type": "text", "text": "Your next idea starts here."},
    {"id": "button-3", "type": "button", "text": "Get started"},
]
ID_PATTERN = re.compile(r"^[a-zA-Z0-9_-]{1,80}$")
TYPES = {"hero", "text", "button"}


def validate_blocks(blocks: object) -> bool:
    if not isinstance(blocks, list) or len(blocks) > 30:
        return False
    seen = set()
    for block in blocks:
        if not isinstance(block, dict) or set(block) != {"id", "type", "text"}:
            return False
        block_id, kind, label = block["id"], block["type"], block["text"]
        if not isinstance(block_id, str) or not ID_PATTERN.fullmatch(block_id):
            return False
        if block_id in seen or not isinstance(kind, str) or kind not in TYPES:
            return False
        if not isinstance(label, str) or len(label) > 500 or "\x00" in label:
            return False
        seen.add(block_id)
    return True


def connect(path: Path) -> sqlite3.Connection:
    path.parent.mkdir(parents=True, exist_ok=True)
    db = sqlite3.connect(str(path), timeout=5, isolation_level=None)
    db.row_factory = sqlite3.Row
    db.execute("PRAGMA busy_timeout=5000")
    db.executescript("""
        CREATE TABLE IF NOT EXISTS studio_documents (
            id TEXT PRIMARY KEY,
            revision INTEGER NOT NULL CHECK(revision >= 0),
            blocks_json TEXT NOT NULL,
            updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
        );
        CREATE TABLE IF NOT EXISTS studio_revisions (
            document_id TEXT NOT NULL,
            revision INTEGER NOT NULL CHECK(revision >= 0),
            blocks_json TEXT NOT NULL,
            created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
            PRIMARY KEY(document_id, revision),
            FOREIGN KEY(document_id) REFERENCES studio_documents(id)
        );
    """)
    original = json.dumps(INITIAL, ensure_ascii=False, separators=(",", ":"))
    db.execute(
        "INSERT OR IGNORE INTO studio_documents(id,revision,blocks_json) VALUES('landing',0,?)",
        (original,),
    )
    db.execute(
        "INSERT OR IGNORE INTO studio_revisions(document_id,revision,blocks_json) "
        "VALUES('landing',0,?)",
        (original,),
    )
    return db


def current(db: sqlite3.Connection) -> dict:
    row = db.execute(
        "SELECT revision,blocks_json,updated_at FROM studio_documents WHERE id='landing'"
    ).fetchone()
    return {
        "ok": True, "mode": "local-sqlite", "revision": row["revision"],
        "blocks": json.loads(row["blocks_json"]), "updatedAt": row["updated_at"],
    }


def history(db: sqlite3.Connection) -> dict:
    items = [
        {"revision": row["revision"], "createdAt": row["created_at"]}
        for row in db.execute(
            "SELECT revision,created_at FROM studio_revisions WHERE document_id='landing' "
            "ORDER BY revision DESC LIMIT 30"
        )
    ]
    return {**current(db), "revisions": items}


def write(db: sqlite3.Connection, expected: object, blocks: object) -> dict:
    if type(expected) is not int or expected < 0 or not validate_blocks(blocks):
        return {"ok": False, "reason": "invalid-document"}
    serialized = json.dumps(blocks, ensure_ascii=False, separators=(",", ":"))
    try:
        db.execute("BEGIN IMMEDIATE")
        row = db.execute(
            "SELECT revision FROM studio_documents WHERE id='landing'"
        ).fetchone()
        if row["revision"] != expected:
            db.execute("ROLLBACK")
            return {"ok": False, "reason": "revision-conflict", "currentRevision": row["revision"]}
        next_revision = expected + 1
        db.execute(
            "UPDATE studio_documents SET revision=?,blocks_json=?,"
            "updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id='landing'",
            (next_revision, serialized),
        )
        db.execute(
            "INSERT INTO studio_revisions(document_id,revision,blocks_json) VALUES('landing',?,?)",
            (next_revision, serialized),
        )
        db.execute("COMMIT")
    except Exception:
        if db.in_transaction:
            db.execute("ROLLBACK")
        raise
    return history(db)


def restore(db: sqlite3.Connection, expected: object, revision: object) -> dict:
    if type(revision) is not int or revision < 0:
        return {"ok": False, "reason": "invalid-revision"}
    row = db.execute(
        "SELECT blocks_json FROM studio_revisions WHERE document_id='landing' AND revision=?",
        (revision,),
    ).fetchone()
    if row is None:
        return {"ok": False, "reason": "revision-not-found"}
    # Restoring is a NEW revision; old history is never deleted.
    return write(db, expected, json.loads(row["blocks_json"]))


def execute(command: object, db_path: Path) -> dict:
    if not isinstance(command, dict):
        return {"ok": False, "reason": "invalid-request"}
    action = command.get("action")
    if action not in ("get", "save", "restore"):
        return {"ok": False, "reason": "unsupported-action"}
    with connect(db_path) as db:
        if action == "get":
            return history(db)
        if action == "save":
            return write(db, command.get("expectedRevision"), command.get("blocks"))
        return restore(db, command.get("expectedRevision"), command.get("revision"))


def main() -> int:
    try:
        payload = sys.stdin.buffer.read(20001)
        if len(payload) > 20000:
            raise ValueError("too-large")
        command = json.loads(payload.decode("utf-8"))
        db_path = Path(os.environ.get("NEXUS_STUDIO_DB", str(DEFAULT_DB)))
        sys.stdout.write(json.dumps(execute(command, db_path), ensure_ascii=False))
        return 0
    except (ValueError, UnicodeDecodeError, json.JSONDecodeError):
        sys.stdout.write(json.dumps({"ok": False, "reason": "invalid-request"}))
        return 0
    except (sqlite3.Error, OSError):
        sys.stderr.write("Nexus Studio SQLite operation failed.\n")
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
