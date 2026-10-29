# Nexus Factory — design and safety contract

Status: original, local-first software-factory prototype in the Nexus AI portfolio. No cloud agent orchestration or general-purpose generated-code execution.

## Design goal

Convert a user work request into a **reviewable engineering brief**, a human-controlled approval, a fixed-template static artifact and evidence of static checks. Every claim in the UI must be backed by a corresponding action or result.

This design combines *principles* from three materials reviewed in October 2026. We **did not** install or execute the uploaded source projects, copy their orchestration scripts, register paid services, import hundreds of third-party skills or enable merges. The code in `lib/nexus-factory-engine.mjs` and `components/labs/NexusFactoryIntake.tsx` is an original, bounded implementation.

### Sources and license

| Source | What it teaches | Decision for Nexus Factory |
| --- | --- | --- |
| [Warp Factories](https://docs.warp.dev/factories/) | Work-item identity; foreman, triage, spec, implementation, review; human checkpoints; definition-as-code | Implement documented roles, stage-gated lifecycle and human review as local deterministic planning, **not** hosted Warp agents |
| User-supplied `super-board-main.zip` (MIT, © 2026 Eric Tech) | Board → builder → QA → independent review; acceptance criteria, test-gap evidence, guardrails and merge gates | Adopt reviewable milestones and explicit evidence disclosure; **never install auto-merge hooks** |
| User-supplied `rsc-harness-main.zip` (MIT, © 2026 Eric Risco) | Project knowledge, skill selection, plan-before-write, tools whose connections are proved, progressive adoption | Add curated skills as **recommendations**, a downloadable spec and clear source provenance; **do not install its CLI, hooks or 269-skill catalog** |

Both uploaded packages are MIT licensed. Links: [super-board](https://github.com/EricTechPro/super-board) and [rsc-harness](https://github.com/ericrisco/rsc-harness). No upstream package source has been embedded, so no fork or vendored dependency is necessary. Review each upstream project and its license before any future vendoring.

Warp Factories is a commercial cloud workflow with usage and permissions requirements; this portfolio project **does not use Warp**, does not assume free cloud inference and does not claim to outperform its infrastructure.

## Current capabilities

**All users (browser mode)**

1. Enter a 10–500-character feature, bug or refactor request.
2. See a deterministic, original triage based on text and task type: role stations, recommended quality procedures, acceptance criteria and optional higher-risk boundaries (credentials, authentication, payments, deployment). It is heuristic, not a security scanner or AI model.
3. Inspect a recommended, role-based workflow. A role tab describes a possible task, **not an autonomous agent or an executed step**.
4. Download the human-review brief as Markdown.
5. Create the existing deterministic planning prototype, manually approve it and export an issue draft. No repository write occurs.

**Local SQLite mode (only when enabled and supported)**

1. Propose a fixed-template static-page job in SQLite.
2. Inspect its source snapshot, including file hashes.
3. Explicitly approve a proposed job only after preview.
4. Build its static HTML/CSS/readme ZIP using the existing bounded local Python backend.
5. View actual static QA results and activity events, then download the ZIP only when marked ready.

The existing Python backend remains the single authority for job state, fixed templates, snapshot validation, approval and packaging. Frontend intelligence cannot bypass backend approvals.

## Workflow states and invariants

| Stage | Actual state | Human checkpoint |
| --- | --- | --- |
| Intake / triage | Draft only; no files written | Review scope |
| Specification | Deterministic advisory checklist | Accept or revise |
| Approval | Explicit checkbox and backend guard | Required before local build |
| Build | Only fixed, controlled static template in local mode | Never execute input commands |
| QA | Structural/static checks against bounded files | Report true pass/fail; no runtime claims |
| Handoff | Read-only source, audit and ZIP | Human decides any subsequent repository actions |

### Safety invariants

- No hosted AI API, paid usage, autonomous agent process, prompt-to-code execution, arbitrary shell command, PR creation, automated merge or deployment.
- A UI label such as “Builder” is a role placeholder, **not** proof that an agent has run.
- Risk flags are keyword triage only; they are **not** a completed security review.
- Static QA does not equal runtime testing or production readiness.
- A SHA-256 file digest detects changes but is not signer identity, supply-chain proof or an external security audit.
- Approval is enforced by the existing local backend for persisted jobs; the new exported brief does **not** grant permissions.
- All new source files use existing React/Next.js modules and Node.js core only. No extra runtime dependencies, installers or secret-bearing integrations.

## Code map

- `lib/nexus-factory-engine.mjs`: deterministic request classification, risks, role and skill routing, acceptance list, Markdown.
- `components/labs/NexusFactoryIntake.tsx`: inspectable five-language specification desk, role tabs and download.
- `components/labs/FactoryWorkflowBoard.tsx`: actual pipeline counts (SQLite) or unknowns (browser mode).
- `components/labs/LabsWorkspace.tsx`: existing controlled planning, previews, approvals and downloads, now integrated.
- `components/labs/factory-premium.css`: scoped control-room interface; unaffected Commerce, Studio and Monitor.
- `labs/factory/backend.py`, `labs/factory/sandbox_snapshot.py`: existing local backend and boundaries.
- `scripts/nexus_factory_qa.mjs`: tests for deterministic and high-risk behavior; wired into CI.
- `scripts/browser_qa.py`: keyboard, responsive layout, old URL compatibility and interaction checks.

## Future work, not included

- Persistent, user-scoped intake briefs with signed audit event sequence and structured acceptance records.
- Real work queues, dependencies, concurrent workers and explicit stage retries.
- Verified isolated execution in a deny-by-default runtime before allowing any generated program to run.
- An opt-in, locally hosted model with resource caps and monitored output, clearly distinct from deterministic rules.
- GitHub issue/PR integrations scoped by user permission and human-only merge controls.
- Benchmarks from reproducible tasks; no unsourced quality or autonomy scores.

**Product rule:** A polished cockpit without corresponding backend data must say “draft,” “not run” or “unavailable,” never report fictional activity.
