# Nexus Engineering Labs — first executable prototypes

Visit `/labs` or `/es/labs`, `/en/labs`, `/de/labs`, `/fr/labs`, `/pt/labs`. The workspace ships four functioning **browser demos** with no mandatory paid provider.

1. **Commerce:** search and category filtering, bounded cart and stock-aware checkout. The browser-only demo persists in localStorage; **a separate opt-in Python/SQLite backend** supports durable local orders with atomic stock reservations and concurrency tests. It works only on loopback during Next.js development; the route is disabled in production. See [Commerce backend setup](../labs/commerce/README.md). No payments, cloud sync or authenticated buyers.
2. **Studio:** editable hero/text/button blocks, keyboard-accessible up/down controls, undo/redo, and HTML export with escaping. **Optional development-only SQLite mode** provides durable document revisions, optimistic write conflicts (HTTP 409), and history-preserving restoration; see [Studio backend](../labs/studio/README.md). Browser-only editing remains available in production. This is not real-time collaboration, drag-and-drop or a publishing platform.
3. **Monitor:** manual browser health checks, latency statistics and a visual history. **Optional development-only Python/SQLite mode** performs a real backend probe of the fixed `127.0.0.1` Nexus health endpoint, retains 300 local measurements, displays the latest 100 and evaluates in-app alerts for failed/slow checks. It does not poll continuously, send notifications or scan arbitrary hosts. See [Monitor backend](../labs/monitor/README.md).
4. **Software Factory:** deterministic requirement/acceptance checklist, explicitly confirmed human-review state, switching among saved local requests, and Markdown issue-draft export. It **does not** invoke models, edit repositories, run tests, or independently generate production code. It is a foundation for a future sandboxed workflow, not autonomous AI.

## Validation

```bash
npm ci
node scripts/labs_unit_qa.mjs
npm run lint
npx tsc --noEmit
npm run build
```

## Future increments

Commerce: authenticated remote persistence, per-user accounts, idempotent order keys, REST contract tests and production-grade authorization. The SQLite demo now provides local persistence and stock transactions, but remains explicitly dev-only.
Studio: multi-user authorization, keyboard-accessible drag/drop, styling controls, export preview isolation, robust autosave/recovery and secure hosted publishing.
Monitor: explicitly approved local scheduling, authentication, configuration for allowlisted services, paginated incident history and meaningful uptime/SLO windows. Current SQLite probes are manual and only target this app.
Factory: isolated per-task worktrees, model-provider optionality, patch preview, bounded execution sandbox, CI integration and explicit manual approval before any write. Never execute generated code on the web server.

No original demo projects were removed; no GitHub automation permissions, deployments or paid services were enabled.

## Review gates and honest evidence

The Software Factory confirmation **only** approves a plan for subsequent **manual implementation**. No checkboxes or approval state indicate that code was generated, tests executed, PRs opened, or security validated. Exported Markdown is a local download, not a GitHub write.

The Monitor percentage and p95 are descriptive statistics over browser-initiated samples only; they are **not** historical uptime or availability SLAs. The demo never accepts arbitrary external monitoring URLs, protecting against server-side request forgery.

The default Commerce demo uses browser-local inventory. A separate localhost-only SQLite mode persists demo orders with a `BEGIN IMMEDIATE` transaction; it **does not** provide authenticated remote accounts, public order intake, online payments, or multi-user isolation. The production route returns HTTP 503 by design. Editable Studio text is escaped in HTML export, but the export is static and not a hosted site.

Studio SQLite versions are saved only on localhost during development. Every write requires an exact revision match, and a restore creates a new revision. It **does not** run scripts, alter GitHub files or publish pages. Both optional SQLite API endpoints are disabled in production.

The Monitor's server-side optional SQLite mode stores manual probes on disk, with local failure/latency alert states. It **never** accepts a target URL or domain, and its API returns 503 in production. Neither sample counts nor historical data demonstrate uninterrupted uptime.
