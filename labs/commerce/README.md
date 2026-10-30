# Nexus Commerce — local SQLite backend

This is a standalone, standard-library Python backend with **real durable local persistence** and atomic inventory changes.

- `backend.py` reads a JSON command from stdin and writes JSON to stdout.
- SQLite is stored in `.nexus-local/commerce.sqlite3`, excluded from Git.
- Prices are computed in integer cents and cannot be supplied by the buyer.
- Checkout uses `BEGIN IMMEDIATE`, validates each line, and commits stock changes and order lines together.
- No external dependency, cloud account, subscription, or payment provider.

## Run tests

From the repository root:

```sh
python -m unittest discover -s labs/commerce -p "test_*.py" -v
```

## Run directly

```sh
echo '{"action":"list"}' | python labs/commerce/backend.py
echo '{"action":"checkout","cart":{"keyboard":1}}' | python labs/commerce/backend.py
```

## Use it with the Nexus UI

Create a local `.env.local` containing `NEXUS_LABS_SQLITE=1`.

Start `npm run dev` and visit `http://localhost:3000/labs?lab=commerce`. Select **Use local SQLite**. The Next.js `/api/labs/commerce` route runs Python locally. Set `NEXUS_COMMERCE_DB` to use a disposable file instead.

The adapter rejects non-loopback hosts and is **disabled when NODE_ENV=production**. This demo has no accounts or tenant isolation, so never expose it to the internet. The original browser-only demo works without Python and remains available in deployed previews. Switching modes clears the cart.

## Next steps

Add authenticated accounts, per-user authorization, idempotent order keys, structured API validation and rate limits before considering a publicly accessible backend. No real payments are processed.
