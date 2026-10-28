# Nexus Engineering Labs — first executable prototypes

Visit `/labs` or `/es/labs`, `/en/labs`, `/de/labs`, `/fr/labs`, `/pt/labs`. The workspace ships four functioning **browser demos** with no mandatory paid provider.

1. **Commerce:** catalog, bounded cart, stock-validated checkout, order count; data persists in localStorage. This is not payment processing, an authenticated storefront, or a real remote inventory service.
2. **Studio:** editable hero/text/button blocks, reordering, deletion, HTML export with HTML entity escaping. This is not drag-and-drop or a complete website publishing platform.
3. **Monitor:** explicit browser-initiated fetch of the application's own health API. It computes response-time statistics and stores a capped local history. This is not continuous monitoring or external uptime assurance.
4. **Software Factory:** deterministic requirement/acceptance checklist, human review status, and local task history. It **does not** invoke models, edit repositories, run tests, or independently generate production code. It is a foundation for a future sandboxed workflow, not autonomous AI.

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
Studio: keyboard-accessible drag/drop, history/undo, layout styles and sandboxed export preview.
Monitor: rate-limited backend probes of allowlisted targets, persistent timestamps, uptime SLO definitions and background scheduling only with the owner's approval.
Factory: isolated per-task worktrees, model-provider optionality, patch preview, bounded execution sandbox, CI integration and explicit manual approval before any write. Never execute generated code on the web server.

No original demo projects were removed; no GitHub automation permissions, deployments or paid services were enabled.
