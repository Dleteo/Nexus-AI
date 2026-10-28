# Nexus Engineering Labs — first executable prototypes

Visit `/labs` or `/es/labs`, `/en/labs`, `/de/labs`, `/fr/labs`, `/pt/labs`. The workspace ships four functioning **browser demos** with no mandatory paid provider.

1. **Commerce:** search and category filtering, bounded cart, stricter stock/quantity validation, stock-aware simulated checkout and a small order history; data persists in localStorage. This is not payment processing, an authenticated storefront, or a real remote inventory service.
2. **Studio:** editable hero/text/button blocks, keyboard-accessible up/down controls, deletion, local undo/redo history including completed text edits, and HTML export with entity escaping. This is not drag-and-drop or a complete website publishing platform.
3. **Monitor:** explicit browser-initiated fetch of the application's own health API. It computes client-observed success rate, average and p95 of successful latency, and displays a capped local history with a basic bar visualization. Concurrent manual probes are disabled. This is not continuous monitoring or external uptime assurance.
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

Commerce: backend persistence, scoped authentication, transactional stock reservation and order-history tests.
Studio: keyboard-accessible drag/drop, styling controls, export preview isolation and robust persisted edit-history recovery.
Monitor: server-maintained scheduled checks of carefully allowlisted targets, persistent timestamps, uptime SLO definitions and background scheduling only with the owner's approval.
Factory: isolated per-task worktrees, model-provider optionality, patch preview, bounded execution sandbox, CI integration and explicit manual approval before any write. Never execute generated code on the web server.

No original demo projects were removed; no GitHub automation permissions, deployments or paid services were enabled.

## Review gates and honest evidence

The Software Factory confirmation **only** approves a plan for subsequent **manual implementation**. No checkboxes or approval state indicate that code was generated, tests executed, PRs opened, or security validated. Exported Markdown is a local download, not a GitHub write.

The Monitor percentage and p95 are descriptive statistics over browser-initiated samples only; they are **not** historical uptime or availability SLAs. The demo never accepts arbitrary external monitoring URLs, protecting against server-side request forgery.

The Commerce inventory is browser-local and cannot protect against multiple users buying the same stock. Server-side transactions and real authentication remain future work. Editable Studio text is escaped in HTML export, but the export is static and not a hosted site.
