"""Nexus Commerce: local-only SQLite transactional inventory demo.

Zero third-party dependencies. Input/output is one UTF-8 JSON document on stdin/stdout.
The Next.js development-only adapter invokes this CLI; never run it as a public API.
"""
from __future__ import annotations

import json
import os
import sqlite3
import sys
from pathlib import Path

PRODUCTS = (
    ("keyboard", "Mechanical Keyboard", "Peripherals", 7900, 8),
    ("headset", "Studio Headset", "Audio", 5900, 12),
    ("monitor", "27-inch Monitor", "Displays", 24900, 5),
    ("mouse", "Precision Mouse", "Peripherals", 3900, 16),
)
ROOT = Path(__file__).resolve().parents[2]
DEFAULT_DB = ROOT / ".nexus-local" / "commerce.sqlite3"


def connect(path: Path) -> sqlite3.Connection:
    path.parent.mkdir(parents=True, exist_ok=True)
    db = sqlite3.connect(str(path), timeout=5, isolation_level=None)
    db.row_factory = sqlite3.Row
    db.execute("PRAGMA foreign_keys=ON")
    db.execute("PRAGMA busy_timeout=5000")
    db.executescript("""
        CREATE TABLE IF NOT EXISTS products (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            category TEXT NOT NULL,
            price_cents INTEGER NOT NULL CHECK(price_cents >= 0),
            stock INTEGER NOT NULL CHECK(stock >= 0)
        );
        CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            total_cents INTEGER NOT NULL CHECK(total_cents >= 0),
            created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
        );
        CREATE TABLE IF NOT EXISTS order_lines (
            order_id INTEGER NOT NULL REFERENCES orders(id),
            product_id TEXT NOT NULL REFERENCES products(id),
            quantity INTEGER NOT NULL CHECK(quantity > 0),
            unit_price_cents INTEGER NOT NULL CHECK(unit_price_cents >= 0),
            PRIMARY KEY (order_id, product_id)
        );
    """)
    db.executemany(
        "INSERT OR IGNORE INTO products(id,name,category,price_cents,stock) VALUES(?,?,?,?,?)",
        PRODUCTS,
    )
    return db


def snapshot(db: sqlite3.Connection) -> dict:
    products = [
        dict(id=r["id"], name=r["name"], category=r["category"],
             price=r["price_cents"] / 100, stock=r["stock"])
        for r in db.execute("SELECT * FROM products ORDER BY rowid")
    ]
    orders = [
        dict(id=r["id"], total=r["total_cents"] / 100, count=r["line_count"],
             createdAt=r["created_at"])
        for r in db.execute("""
            SELECT o.id, o.total_cents, o.created_at,
                   COUNT(l.product_id) AS line_count
            FROM orders o LEFT JOIN order_lines l ON l.order_id=o.id
            GROUP BY o.id ORDER BY o.id DESC LIMIT 30
        """)
    ]
    return {"ok": True, "inventory": products, "orders": orders, "mode": "local-sqlite"}


def checkout(db: sqlite3.Connection, cart: object) -> dict:
    if not isinstance(cart, dict) or not cart or len(cart) > len(PRODUCTS):
        return {"ok": False, "reason": "invalid-cart"}
    if any(not isinstance(pid, str) or type(qty) is not int or qty < 1 or qty > 100
           for pid, qty in cart.items()):
        return {"ok": False, "reason": "invalid-quantity"}

    try:
        db.execute("BEGIN IMMEDIATE")
        lines = []
        total = 0
        for product_id, quantity in cart.items():
            item = db.execute(
                "SELECT name,price_cents,stock FROM products WHERE id=?", (product_id,)
            ).fetchone()
            if item is None or item["stock"] < quantity:
                db.execute("ROLLBACK")
                return {"ok": False, "reason": "insufficient-stock"}
            total += item["price_cents"] * quantity
            lines.append((product_id, quantity, item["price_cents"]))
        cursor = db.execute("INSERT INTO orders(total_cents) VALUES (?)", (total,))
        order_id = cursor.lastrowid
        for product_id, quantity, price_cents in lines:
            update = db.execute(
                "UPDATE products SET stock=stock-? WHERE id=? AND stock>=?",
                (quantity, product_id, quantity),
            )
            if update.rowcount != 1:
                db.execute("ROLLBACK")
                return {"ok": False, "reason": "insufficient-stock"}
            db.execute(
                "INSERT INTO order_lines(order_id,product_id,quantity,unit_price_cents) VALUES(?,?,?,?)",
                (order_id, product_id, quantity, price_cents),
            )
        db.execute("COMMIT")
    except Exception:
        if db.in_transaction:
            db.execute("ROLLBACK")
        raise

    return {**snapshot(db), "orderId": order_id}


def execute(command: object, db_path: Path) -> dict:
    if not isinstance(command, dict):
        return {"ok": False, "reason": "invalid-request"}
    action = command.get("action")
    if action not in ("list", "checkout"):
        return {"ok": False, "reason": "unsupported-action"}
    with connect(db_path) as db:
        if action == "list":
            return snapshot(db)
        return checkout(db, command.get("cart"))


def main() -> int:
    try:
        raw = sys.stdin.buffer.read(4097)
        if len(raw) > 4096:
            raise ValueError("request-too-large")
        command = json.loads(raw.decode("utf-8"))
        path = Path(os.environ.get("NEXUS_COMMERCE_DB", str(DEFAULT_DB)))
        result = execute(command, path)
        sys.stdout.write(json.dumps(result, ensure_ascii=False))
        return 0
    except (ValueError, UnicodeDecodeError, json.JSONDecodeError):
        sys.stdout.write(json.dumps({"ok": False, "reason": "invalid-request"}))
        return 0
    except (sqlite3.Error, OSError):
        sys.stderr.write("Nexus Commerce SQLite operation failed.\n")
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
