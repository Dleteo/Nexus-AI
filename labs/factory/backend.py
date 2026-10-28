"""Nexus Software Factory: a deterministic, *local-only* review-to-artifact pipeline.

No AI inference, shell execution, git writes, or arbitrary code execution.
The only template builds a self-contained static landing page in a ZIP stored
in disposable/ignored SQLite. All file names and contents are controlled here.
"""
from __future__ import annotations

import base64
import hashlib
from datetime import datetime, timezone
from html import escape
from html.parser import HTMLParser
from io import BytesIO
import json
import os
from pathlib import Path
import re
import sqlite3
import sys
from uuid import uuid4
from zipfile import ZipFile, ZIP_DEFLATED, BadZipFile

ROOT = Path(__file__).resolve().parents[2]
DEFAULT_DB = ROOT / ".nexus-local" / "factory.sqlite3"
ID_PATTERN = re.compile(r"^[0-9a-f]{32}$")
KINDS = {"feature", "bug", "refactor"}
MAX_JOBS = 40
FILES = ("index.html", "styles.css", "README.md", "qa-results.json", "manifest.json")
STYLES = """*{box-sizing:border-box}body{margin:0;min-height:100vh;display:grid;place-items:center;padding:2rem;background:#12151d;color:#f5f7fb;font:18px/1.6 system-ui,sans-serif}main{max-width:760px;padding:3rem;border:1px solid #394051;border-radius:20px;background:#1d2430}h1{font-size:clamp(2rem,5vw,4rem);line-height:1.1}p{color:#c8d1df}.tag{font-size:.8rem;letter-spacing:.2em;color:#9dbbff;text-transform:uppercase}"""
PLAN_STAGES = (
    "Requirements documented",
    "Human approval",
    "Template generation",
    "Deterministic QA checks",
    "Downloadable ZIP",
)


def utcnow() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def connect(path: Path) -> sqlite3.Connection:
    path.parent.mkdir(parents=True, exist_ok=True)
    db = sqlite3.connect(str(path), timeout=5, isolation_level=None)
    db.row_factory = sqlite3.Row
    db.execute("PRAGMA busy_timeout=5000")
    db.execute("PRAGMA foreign_keys=ON")
    db.executescript("""
        CREATE TABLE IF NOT EXISTS factory_jobs (
            id TEXT PRIMARY KEY,
            request TEXT NOT NULL,
            kind TEXT NOT NULL,
            status TEXT NOT NULL CHECK(status IN ('proposed','approved','built')),
            created_at TEXT NOT NULL,
            artifact BLOB,
            qa_json TEXT
        );
        CREATE TABLE IF NOT EXISTS factory_events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            job_id TEXT NOT NULL REFERENCES factory_jobs(id) ON DELETE CASCADE,
            stage TEXT NOT NULL,
            detail TEXT NOT NULL,
            created_at TEXT NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_factory_jobs ON factory_jobs(created_at DESC);
    """)
    return db


def emit(db: sqlite3.Connection, job_id: str, stage: str, detail: str) -> None:
    db.execute(
        "INSERT INTO factory_events(job_id,stage,detail,created_at) VALUES(?,?,?,?)",
        (job_id, stage, detail, utcnow()),
    )


def plan_for(request: str, kind: str) -> dict:
    return {
        "template": "static-landing-page",
        "scope": "Fixed HTML/CSS template only; no model, git or shell access",
        "input": request,
        "kind": kind,
        "files": list(FILES),
        "stages": list(PLAN_STAGES),
        "acceptance": [
            "HTML has one heading containing the request as escaped text.",
            "A local stylesheet is referenced; no external JavaScript is included.",
            "All ZIP paths belong to a fixed allowlist.",
            "QA results are generated before the artifact is made available.",
        ],
    }


def serialize(db: sqlite3.Connection, row: sqlite3.Row) -> dict:
    events = [
        {"stage": r["stage"], "detail": r["detail"], "at": r["created_at"]}
        for r in db.execute(
            "SELECT stage,detail,created_at FROM factory_events WHERE job_id=? ORDER BY id",
            (row["id"],),
        )
    ]
    return {
        "id": row["id"], "request": row["request"], "kind": row["kind"],
        "status": row["status"], "createdAt": row["created_at"],
        "plan": plan_for(row["request"], row["kind"]),
        "events": events,
        "qa": json.loads(row["qa_json"]) if row["qa_json"] else None,
        "downloadReady": row["status"] == "built" and row["artifact"] is not None,
    }


def lookup(db: sqlite3.Connection, job_id: object) -> sqlite3.Row | None:
    if not isinstance(job_id, str) or not ID_PATTERN.fullmatch(job_id):
        return None
    return db.execute("SELECT * FROM factory_jobs WHERE id=?", (job_id,)).fetchone()


def propose(db: sqlite3.Connection, request: object, kind: object) -> dict:
    if not isinstance(request, str) or not 10 <= len(request.strip()) <= 500:
        return {"ok": False, "reason": "invalid-request"}
    if not isinstance(kind, str) or kind not in KINDS:
        return {"ok": False, "reason": "invalid-kind"}
    description = request.strip()
    job_id = uuid4().hex
    db.execute("BEGIN IMMEDIATE")
    try:
        db.execute(
            "INSERT INTO factory_jobs(id,request,kind,status,created_at) VALUES(?,?,?,'proposed',?)",
            (job_id, description, kind, utcnow()),
        )
        emit(db, job_id, "requirements", "Deterministic plan prepared; no files changed.")
        # Keep bounded history. Do not let old job data grow forever.
        db.execute(
            "DELETE FROM factory_jobs WHERE id NOT IN "
            "(SELECT id FROM factory_jobs ORDER BY rowid DESC LIMIT ?)",
            (MAX_JOBS,),
        )
        db.execute("COMMIT")
    except Exception:
        if db.in_transaction:
            db.execute("ROLLBACK")
        raise
    return {"ok": True, "job": serialize(db, lookup(db, job_id))}


def approve(db: sqlite3.Connection, job_id: object, confirmed: object) -> dict:
    if confirmed is not True:
        return {"ok": False, "reason": "approval-required"}
    row = lookup(db, job_id)
    if row is None:
        return {"ok": False, "reason": "job-not-found"}
    db.execute("BEGIN IMMEDIATE")
    try:
        if db.execute(
            "UPDATE factory_jobs SET status='approved' WHERE id=? AND status='proposed'",
            (job_id,),
        ).rowcount != 1:
            db.execute("ROLLBACK")
            return {"ok": False, "reason": "invalid-transition"}
        emit(db, job_id, "approval", "Explicit human approval recorded. No code executed.")
        db.execute("COMMIT")
    except Exception:
        if db.in_transaction:
            db.execute("ROLLBACK")
        raise
    return {"ok": True, "job": serialize(db, lookup(db, job_id))}


class MarkupAudit(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.headings = []
        self.scripts = 0
        self.stylesheets = 0
        self.active_heading = False

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        if tag == "h1":
            self.active_heading = True
        if tag == "script":
            self.scripts += 1
        if tag == "link" and dict(attrs).get("href") == "styles.css":
            self.stylesheets += 1

    def handle_endtag(self, tag: str) -> None:
        if tag == "h1":
            self.active_heading = False

    def handle_data(self, data: str) -> None:
        if self.active_heading:
            self.headings.append(data)


def generate(request: str, kind: str) -> dict[str, bytes]:
    safe_title = escape(request, quote=True)
    html = (
        '<!doctype html><html lang="en"><head><meta charset="utf-8">'
        '<meta name="viewport" content="width=device-width, initial-scale=1">'
        '<title>Nexus Factory Demo</title><link rel="stylesheet" href="styles.css">'
        '</head><body><main><span class="tag">Nexus Software Factory</span>'
        f"<h1>{safe_title}</h1>"
        '<p>A deterministic, locally generated starter page. Review the source before publishing.</p>'
        '</main></body></html>'
    )
    readme = (
        "# Nexus Factory static starter\n\n"
        "Generated offline from an explicitly approved local request.\n"
        f"Request (JSON escaped): {json.dumps(request, ensure_ascii=True)}\n"
        f"Task type: {kind}\n\n"
        "Only static HTML/CSS. No AI model, repository edits or shell execution.\n"
        "QA validation is static and does not prove production readiness.\n"
    )
    return {
        "index.html": html.encode("utf-8"),
        "styles.css": STYLES.encode("utf-8"),
        "README.md": readme.encode("utf-8"),
    }


def check_artifacts(files: dict[str, bytes], request: str) -> dict:
    audit = MarkupAudit()
    html = files.get("index.html", b"").decode("utf-8")
    audit.feed(html)
    checks = [
        {"name": "Expected filenames only", "passed": set(files) == set(FILES[:3])},
        {"name": "Safe HTML heading", "passed": len(audit.headings) == 1 and audit.headings[0] == request},
        {"name": "Local stylesheet linked", "passed": audit.stylesheets == 1 and bool(files.get("styles.css"))},
        {"name": "No JavaScript tags", "passed": audit.scripts == 0},
        {"name": "Bounded static files", "passed": all(0 < len(data) <= 12000 for data in files.values())},
        {"name": "Escaped source text", "passed": escape(request, quote=True) in html},
    ]
    return {"passed": all(item["passed"] for item in checks), "checks": checks, "mode": "static-validation"}


def sha256(data: bytes) -> str:
    """Hex SHA-256; useful for accidental corruption checks, not a signature."""
    return hashlib.sha256(data).hexdigest()


def inspect_proposed_files(db: sqlite3.Connection, job_id: object) -> dict:
    """Review files without executing or persisting artifacts. No approval required."""
    row = lookup(db, job_id)
    if row is None:
        return {"ok": False, "reason": "job-not-found"}
    files = generate(row["request"], row["kind"])
    qa = check_artifacts(files, row["request"])
    return {
        "ok": True,
        "preview": {
            "jobId": row["id"],
            "files": [
                {"name": name, "content": files[name].decode("utf-8"), "sha256": sha256(files[name])}
                for name in FILES[:3]
            ],
            "qa": qa,
            "note": "Read-only source preview. No code has been executed and no ZIP has been built.",
        },
    }


def manifest_for(files: dict[str, bytes]) -> dict:
    return {
        "schemaVersion": 1,
        "algorithm": "sha256",
        "files": {name: {"sha256": sha256(files[name]), "size": len(files[name])}
                  for name in FILES[:-1]},
        "scope": "Archive integrity only; not an identity, authenticity or security signature.",
    }


def verify_artifact(archive_bytes: bytes) -> bool:
    """Reject modified or inconsistent ZIPs before returning them to the browser."""
    if not isinstance(archive_bytes, bytes) or len(archive_bytes) > 120_000:
        return False
    try:
        with ZipFile(BytesIO(archive_bytes), "r") as archive:
            infos = archive.infolist()
            if tuple(info.filename for info in infos) != FILES:
                return False
            if any(info.is_dir() or info.file_size <= 0 or info.file_size > 12_000 for info in infos):
                return False
            files = {info.filename: archive.read(info) for info in infos}
        manifest = json.loads(files["manifest.json"].decode("utf-8"))
        if manifest.get("schemaVersion") != 1 or manifest.get("algorithm") != "sha256":
            return False
        if set(manifest.get("files", {})) != set(FILES[:-1]):
            return False
        if not all(
            manifest["files"][name] == {"sha256": sha256(files[name]), "size": len(files[name])}
            for name in FILES[:-1]
        ):
            return False
        qa = json.loads(files["qa-results.json"].decode("utf-8"))
        return qa.get("passed") is True and qa.get("mode") == "static-validation"
    except (BadZipFile, OSError, ValueError, UnicodeDecodeError, TypeError, KeyError, AttributeError):
        return False


def build(db: sqlite3.Connection, job_id: object) -> dict:
    if lookup(db, job_id) is None:
        return {"ok": False, "reason": "job-not-found"}
    db.execute("BEGIN IMMEDIATE")
    try:
        row = lookup(db, job_id)
        if row["status"] != "approved":
            db.execute("ROLLBACK")
            return {"ok": False, "reason": "approval-required"}
        files = generate(row["request"], row["kind"])
        qa = check_artifacts(files, row["request"])
        if not qa["passed"]:
            db.execute("ROLLBACK")
            return {"ok": False, "reason": "qa-failed"}
        files["qa-results.json"] = json.dumps(qa, indent=2).encode("utf-8")
        files["manifest.json"] = json.dumps(manifest_for(files), indent=2).encode("utf-8")
        buffer = BytesIO()
        with ZipFile(buffer, "w", ZIP_DEFLATED) as archive:
            for name in FILES:
                archive.writestr(name, files[name])
        if not verify_artifact(buffer.getvalue()):
            db.execute("ROLLBACK")
            return {"ok": False, "reason": "artifact-integrity-failed"}
        db.execute(
            "UPDATE factory_jobs SET status='built', artifact=?, qa_json=? WHERE id=?",
            (buffer.getvalue(), json.dumps(qa), job_id),
        )
        emit(db, job_id, "generation", "Built fixed static template entirely in memory.")
        emit(db, job_id, "qa", "Static checks passed. No generated code was executed.")
        emit(db, job_id, "artifact", "Downloadable ZIP saved in isolated local SQLite.")
        db.execute("COMMIT")
    except Exception:
        if db.in_transaction:
            db.execute("ROLLBACK")
        raise
    return {"ok": True, "job": serialize(db, lookup(db, job_id))}


def artifact(db: sqlite3.Connection, job_id: object) -> dict:
    row = lookup(db, job_id)
    if row is None or row["status"] != "built" or row["artifact"] is None:
        return {"ok": False, "reason": "artifact-not-found"}
    if not verify_artifact(row["artifact"]):
        return {"ok": False, "reason": "artifact-integrity-failed"}
    return {"ok": True, "filename": "nexus-factory-" + row["id"][:8] + ".zip",
            "base64": base64.b64encode(row["artifact"]).decode("ascii")}


def execute(command: object, db_path: Path) -> dict:
    if not isinstance(command, dict):
        return {"ok": False, "reason": "invalid-request"}
    action = command.get("action")
    if action not in ("list", "propose", "preview", "approve", "build", "artifact"):
        return {"ok": False, "reason": "unsupported-action"}
    with connect(db_path) as db:
        if action == "list":
            ids = db.execute("SELECT id FROM factory_jobs ORDER BY rowid DESC LIMIT 20").fetchall()
            return {"ok": True, "jobs": [serialize(db, lookup(db, row["id"])) for row in ids]}
        if action == "propose":
            return propose(db, command.get("request"), command.get("kind"))
        if action == "preview":
            return inspect_proposed_files(db, command.get("id"))
        if action == "approve":
            return approve(db, command.get("id"), command.get("confirmed"))
        if action == "build":
            return build(db, command.get("id"))
        return artifact(db, command.get("id"))


def main() -> int:
    try:
        raw = sys.stdin.buffer.read(4097)
        if len(raw) > 4096:
            raise ValueError("request-too-large")
        command = json.loads(raw.decode("utf-8"))
        db_path = Path(os.environ.get("NEXUS_FACTORY_DB", str(DEFAULT_DB)))
        sys.stdout.write(json.dumps(execute(command, db_path), ensure_ascii=False))
        return 0
    except (ValueError, UnicodeDecodeError, json.JSONDecodeError):
        sys.stdout.write(json.dumps({"ok": False, "reason": "invalid-request"}))
        return 0
    except (sqlite3.Error, OSError):
        sys.stderr.write("Nexus Factory SQLite operation failed.\n")
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
