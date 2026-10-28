"""Real SQLite transactional tests; no external services or paid APIs."""
import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest
from concurrent.futures import ThreadPoolExecutor

from backend import checkout, connect, execute, snapshot

SCRIPT = Path(__file__).with_name("backend.py")


class CommerceSQLiteTests(unittest.TestCase):
    def setUp(self):
        self.folder = tempfile.TemporaryDirectory()
        self.db_file = Path(self.folder.name) / "commerce.sqlite3"

    def tearDown(self):
        self.folder.cleanup()

    def test_seed_and_persist(self):
        self.assertEqual(len(execute({"action": "list"}, self.db_file)["inventory"]), 4)
        result = execute({"action": "checkout", "cart": {"keyboard": 2}}, self.db_file)
        self.assertTrue(result["ok"])
        self.assertEqual(result["orders"][0]["total"], 158)
        self.assertEqual(result["orders"][0]["count"], 1)
        again = execute({"action": "list"}, self.db_file)
        self.assertEqual(again["inventory"][0]["stock"], 6)
        self.assertEqual(len(again["orders"]), 1)

    def test_unknown_and_malformed_orders_do_not_mutate_stock(self):
        for cart in ({}, {"fake": 1}, {"keyboard": -1}, {"keyboard": 0},
                     {"keyboard": True}, {"keyboard": 2.1}, {"keyboard": "1"},
                     {"keyboard": 101}, {"keyboard": 1, "fake": 1}, ["keyboard"]):
            result = execute({"action": "checkout", "cart": cart}, self.db_file)
            self.assertFalse(result["ok"], cart)
            self.assertEqual(execute({"action": "list"}, self.db_file)["inventory"][0]["stock"], 8)
        self.assertEqual(execute({"action": "list"}, self.db_file)["orders"], [])

    def test_atomic_multi_product_order(self):
        self.assertTrue(execute({"action": "checkout", "cart": {"keyboard": 1, "monitor": 2}}, self.db_file)["ok"])
        failed = execute({"action": "checkout", "cart": {"keyboard": 1, "monitor": 4}}, self.db_file)
        self.assertEqual(failed["reason"], "insufficient-stock")
        result = execute({"action": "list"}, self.db_file)
        self.assertEqual(result["inventory"][0]["stock"], 7)
        self.assertEqual(result["inventory"][2]["stock"], 3)
        self.assertEqual(len(result["orders"]), 1)

    def test_concurrent_stock_checkout_only_sells_available_stock(self):
        execute({"action": "list"}, self.db_file)
        def buy():
            return execute({"action": "checkout", "cart": {"keyboard": 8}}, self.db_file)
        with ThreadPoolExecutor(max_workers=2) as pool:
            futures = [pool.submit(buy) for _ in range(2)]
            results = [future.result() for future in futures]
        self.assertEqual(sum(1 for item in results if item["ok"]), 1)
        with connect(self.db_file) as db:
            self.assertEqual(snapshot(db)["inventory"][0]["stock"], 0)
            self.assertEqual(len(snapshot(db)["orders"]), 1)

    def test_cli_stdin_json(self):
        env = {**os.environ, "NEXUS_COMMERCE_DB": str(self.db_file)}
        process = subprocess.run(
            [sys.executable, str(SCRIPT)], input='{"action":"list"}',
            capture_output=True, text=True, env=env, check=True,
        )
        self.assertEqual(len(json.loads(process.stdout)["inventory"]), 4)
        process = subprocess.run(
            [sys.executable, str(SCRIPT)], input='{"action":"checkout","cart":{"mouse":2}}',
            capture_output=True, text=True, env=env, check=True,
        )
        self.assertEqual(json.loads(process.stdout)["orders"][0]["total"], 78)


if __name__ == "__main__":
    unittest.main()
