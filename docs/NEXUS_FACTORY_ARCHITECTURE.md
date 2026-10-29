# Nexus Software Factory

## Alcance implementado

Nexus Software Factory conserva la identidad y las rutas del proyecto mostrado en el portafolio (`/labs/factory`, `/es/labs/factory` y sus otras cuatro traducciones). Integra un nuevo tablero de entregas con el clasificador existente y conserva el pipeline SQLite opcional. Los demás proyectos no se modifican.

El tablero guarda hasta 80 tareas en localStorage, permite búsqueda, copia JSON e importación validada. La importación combina tareas por ID y preserva la versión ya existente. Se guarda antes de actualizar la interfaz: una cuota agotada se comunica como fallo, sin afirmar que la tarea se guardó.

Flujo: planificación → aprobación del contenido exacto → plantilla + QA estática → revisión humana → entrega. Se puede cancelar una tarea o devolverla desde revisión a planificación. La devolución invalida la aprobación anterior. No hay avance arbitrario por arrastrar tarjetas.

La aprobación registra SHA-256 sobre JSON canónico de pares ruta/contenido ordenados. Build y exportación vuelven a calcularlo: un cambio en título, solicitud o archivos invalida la aprobación. Esto es integridad dentro de una aplicación local, no autenticación de una persona ni firma digital. Quien controla el navegador puede modificar su almacenamiento.

La entrega contiene diez archivos: HTML, CSS, `factory.definition.json`, especificación en `02-DOCS/spec.json`, memoria en `02-DOCS/memory.md`, `board.json`, README, QA, revisión y manifiesto. El ZIP usa UTF-8, CRC-32 y entradas almacenadas sin dependencias adicionales. La revisión final exige una nota de al menos diez caracteres; registra una decisión humana, no prueba una revisión de código independiente.

El objetivo de la tarea se presenta como contenido escapado en una plantilla fija. No se implementa automáticamente una funcionalidad, corrección o refactorización descrita en lenguaje natural. Estos tipos clasifican la solicitud. El análisis estático sólo comprueba estructura, rutas, ausencia de scripts, CSS local, documentos y tamaño. `execution=not_run` permanece explícito.

## Combinación de las tres referencias

- **Warp Factories**: coordinación, etapas, puntos de control y definición portable. Fuente de diseño: https://docs.warp.dev/factories y https://docs.warp.dev/factories/how-factories-work. No se copió el producto propietario ni se habilitó una conexión con Warp.
- **rsc-harness 3.6.0**: continuidad mediante memoria, especificación y selección de procedimientos. Código original del ZIP suministrado, con LICENSE MIT, en `tools/nexus-factory/upstream/rsc-harness`.
- **super-board 3.1.2**: responsabilidades separadas Build / QA / Review y devolución de hallazgos al flujo. Código original del ZIP, con LICENSE MIT, en `tools/nexus-factory/upstream/super-board`.

Los paquetes completos son material de referencia y distribución; sus instrucciones internas no sustituyen la solicitud del propietario y sus instaladores, hooks y agentes no se ejecutan automáticamente. No se afirma compatibilidad de ejecución integrada entre sus hosts. El flujo propio adapta sus prácticas y genera documentos portables. El inventario SHA-256 permite comprobar que los archivos distribuidos coinciden con los ZIP recibidos; no acredita la seguridad de ese código.

## Qué se conserva

El backend Python/SQLite, sus snapshots validados, manifiestos, endpoint localhost y bloqueo de producción permanecen intactos. Su historial es independiente del nuevo tablero del navegador; no se simula sincronización entre ambos. El clasificador previo sigue disponible para analizar solicitudes y exportar especificaciones. Ningún dato existente se migra ni se borra.

No hay inferencia, ejecución de código generado, integración GitHub, PR, merge, despliegue, pago o servicio nuevo. El sandbox P1 sigue sin acreditarse; no se sustituyen las comprobaciones de aislamiento por el tablero o los controles estáticos. Los criterios pendientes siguen en `docs/FACTORY_SANDBOX_P1.md`.

## Mapa y verificación

- `components/factory/FactoryDeliveryDesk.tsx`: tablero y controles en cinco idiomas.
- `components/factory/delivery.module.css`: identidad industrial dorada y responsive.
- `lib/factory/core.ts`: estados, validación, memoria, aprobación y exportación.
- `lib/factory/zip.ts`: ZIP portable con rutas acotadas.
- `scripts/nexus_software_factory_qa.mjs`: pruebas de transiciones, alteración de contenido, devolución, cancelación, historial, hashes y ZIP leído por Python.
- `tools/nexus-factory/verify-sources.mjs`: inventario de los dos ZIP originales.

```sh
npm run factory:test
npm run factory:sources
npm run lint
npx tsc --noEmit
npm run build
```

Los tres últimos verifican el proyecto; los dos primeros verifican el nuevo flujo y las fuentes. Ninguna de estas pruebas demuestra inferencia ni aislamiento de ejecución.


## Antecedente del clasificador conservado

# Referencia anterior: Nexus Factory — design and safety contract

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
