# Nexus Engineering Labs — first executable prototypes

Visit `/labs` or `/es/labs`, `/en/labs`, `/de/labs`, `/fr/labs`, `/pt/labs`. The workspace ships four functioning **browser demos** with no mandatory paid provider.

1. **Commerce:** search and category filtering, bounded cart and stock-aware checkout. The browser-only demo persists in localStorage; **a separate opt-in Python/SQLite backend** supports durable local orders with atomic stock reservations and concurrency tests. It works only on loopback during Next.js development; the route is disabled in production. See [Commerce backend setup](../labs/commerce/README.md). No payments, cloud sync or authenticated buyers.
2. **Studio:** editable hero/text/button blocks, keyboard-accessible up/down controls, undo/redo, and HTML export with escaping. **Optional development-only SQLite mode** provides durable document revisions, optimistic write conflicts (HTTP 409), and history-preserving restoration; see [Studio backend](../labs/studio/README.md). Browser-only editing remains available in production. This is not real-time collaboration, drag-and-drop or a publishing platform.
3. **Monitor:** manual browser health checks, latency statistics and a visual history. **Optional development-only Python/SQLite mode** performs a real backend probe of the fixed `127.0.0.1` Nexus health endpoint, retains 300 local measurements, displays the latest 100 and evaluates in-app alerts for failed/slow checks. It does not poll continuously, send notifications or scan arbitrary hosts. See [Monitor backend](../labs/monitor/README.md).
4. **Software Factory:** browser-only requirements planning and Markdown export remain free and always available. An **optional local Python/SQLite workflow** now accepts a request, requires explicit human approval, generates a fixed static HTML/CSS starter ZIP, exposes a read-only source preview before UI approval, generates a ZIP with a SHA-256 file manifest, performs six deterministic static QA checks, verifies ZIP integrity at download, and records review/build events. It does **not** invoke an AI model, execute generated code, modify GitHub or create PRs. See [Factory backend](../labs/factory/README.md).

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
Factory: previewable patches and code diff, isolated per-task worktrees, allowlisted subprocess test sandbox, optional local-only AI provider, and an explicitly reviewed PR workflow. Never execute untrusted generated code on the web server.

No original demo projects were removed; no GitHub automation permissions, deployments or paid services were enabled.

## Review gates and honest evidence

The browser-only Software Factory confirmation **only** approves a plan for subsequent manual work. Its optional local SQLite mode has a separate approval gate before a **fixed, non-AI template build**, followed by actual deterministic *static* QA checks. A green check does not mean generated code was run, a repository modified, a PR opened or security validated. The ZIP and Markdown are local downloads, not GitHub writes.

The Monitor percentage and p95 are descriptive statistics over browser-initiated samples only; they are **not** historical uptime or availability SLAs. The demo never accepts arbitrary external monitoring URLs, protecting against server-side request forgery.

The default Commerce demo uses browser-local inventory. A separate localhost-only SQLite mode persists demo orders with a `BEGIN IMMEDIATE` transaction; it **does not** provide authenticated remote accounts, public order intake, online payments, or multi-user isolation. The production route returns HTTP 503 by design. Editable Studio text is escaped in HTML export, but the export is static and not a hosted site.

Studio SQLite versions are saved only on localhost during development. Every write requires an exact revision match, and a restore creates a new revision. It **does not** run scripts, alter GitHub files or publish pages. Both optional SQLite API endpoints are disabled in production.

The Monitor's server-side optional SQLite mode stores manual probes on disk, with local failure/latency alert states. It **never** accepts a target URL or domain, and its API returns 503 in production. Neither sample counts nor historical data demonstrate uninterrupted uptime.

Factory build artifacts are ZIP files held in local SQLite, with a fixed filename allowlist and escaped HTML input. Every stage is auditable and the endpoint is disabled in production. This is not an autonomous coding agent.

Before approval, the local Factory UI can display the exact template source (HTML/CSS/README) with per-file SHA-256 checksums. The manifest covers each generated file but is **not** a cryptographic signature, security audit or proof of code authorship. For the hard remaining engineering work, see [Codex next-phase handoff](CODEX_NEXT_PHASE.md).
