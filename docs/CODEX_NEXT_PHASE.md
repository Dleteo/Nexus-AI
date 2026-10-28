# Codex — siguiente fase difícil de Nexus AI

**Actualizado:** 28 de octubre de 2026  
**Repositorio:** Dleteo/Nexus-AI  
**Rama OBLIGATORIA:** `feat/career-portfolio-20261026`  
**PR:** https://github.com/Dleteo/Nexus-AI/pull/46 (mantener abierto)

Lee en este orden: `AGENTS.md`, `docs/CODEX_HANDOFF.md`, este archivo y `docs/FOUR-ENGINEERING-LABS.md`. **No hagas merge, deploy, compras, cambios de visibilidad, conexiones a proveedores, migraciones a Supabase de producción ni leas repositorios privados sin permiso expreso del dueño**. Costo obligatorio $0. Los dos asistentes Nexus Portfolio y Nexus Technical deben mantenerse separados pero con la misma identidad visual.

**Estado de continuidad:** P0 ya tiene controles y regresiones adicionales; P1 ya tiene validación de snapshots/ZIP inertes, digest del preview y estado `not_run` en API/UI/preflight. No reconstruir esas piezas. **El runtime aislado sigue sin verificarse y P1 no está aceptada; P2/P3 siguen bloqueadas.** Leer el resumen actual de [la nota para ChatGPT](CONTINUIDAD_CODEX_2026-10-28.md) y el [diseño P1](FACTORY_SANDBOX_P1.md) antes de ampliar capacidades.

## Inventario que YA funciona — no rehacer

| Laboratorio | Implementado | Pendiente (no fingir) |
|---|---|---|
| Commerce | Catálogo, carrito, compras simuladas con stock y transacciones atómicas SQLite, API localhost, pruebas de concurrencia | Autenticación, usuarios reales, pagos, autorización y backend público |
| Studio | Editor de bloques, undo/redo, HTML estático, revisiones SQLite, conflicto optimista 409, restauración histórica | Drag & drop, publicación, multiusuario y sandbox de HTML |
| Monitor | Health checks manuales a URL fija 127.0.0.1, SQLite, p95 y alertas visuales | Daemon 24/7, SLA, escaneo externo seguro y avisos |
| Software Factory | Plan de tarea → aprobación humana → plantilla fija HTML/CSS → 6 checks de QA estático → ZIP SQLite | **NO es agente IA**: sin inferencia, ejecución de código ajeno, Git, worktrees ni PR |

**Nueva preparación entregada:** `labs/factory/backend.py` implementa vista previa de código sin escribir ni ejecutar, huellas SHA-256 para los archivos, `manifest.json` para el ZIP y comprobación de integridad al descargar. `app/api/labs/factory/route.ts` expone `GET ?preview=<job_id>` en localhost y protege descarga. `components/labs/LabsWorkspace.tsx` muestra HTML/CSS/README y hashes, y deshabilita la aprobación de UI hasta cargar el preview. `labs/factory/test_backend.py` añade pruebas contra ZIP modificado y preview no destructivo; `scripts/factory_http_qa.mjs` cubre el recorrido HTTP. Una comprobación estática no prueba funcionamiento de código ejecutable. **SHA-256 no es firma digital ni garantiza autoría.** Los ZIPs creados antes del manifiesto pueden requerir migración o rechazo explícito.

**CI:** `.github/workflows/ci.yml` prueba lint, TypeScript, PostgreSQL local temporal, asistentes con simuladores, cuatro servicios SQLite, sus APIs HTTP con Next de desarrollo, build, smoke de producción, cinco CV PDF y navegador responsive. Verifica siempre SHA del PR actual y la corrida específica de ese SHA; no recicles resultados verdes viejos.

## Prioridad P0 — auditoría y controles antes de hacer la fábrica más poderosa

1. Revisa estado de PR/branch y ejecuta la suite. Lee las guías de Next.js 16 de `node_modules/next/dist/docs/` tal como exige `AGENTS.md`.
2. Audita las cuatro APIs locales y el lanzador Python: validación de Host/Origin, Host falsificado, procesos huérfanos, límites de cuerpo y salida, rutas, symlinks, archivos SQLite, timeouts y comportamiento en Windows. **Filtrar Host no equivale a impedir conexiones de red cuando Next escucha en 0.0.0.0 o tras un proxy.** Para trabajo avanzado, refuerza el aislamiento real, no lo presupongas.
3. Conserva bloqueo HTTP 503 para APIs Factory/Commerce/Studio/Monitor en producción; pruebas adversarias para POST cross-site, ZIP paths y accesos a disco. Revisa migración/compatibilidad para ZIP legado sin manifiesto.
4. Anota amenazas, límites y evidencia. Ningún test sintético demuestra inferencia de IA real.

**Aceptación:** cuatro APIs protegidas, tampering rechazado, tests reproduciéndose offline, PR aún abierto y CI verde exactamente en el último commit.

## Prioridad P1 — el desafío difícil: ejecución real en sandbox

**No está implementado. NO ejecutes código generado en el servidor de Next.js ni directamente mediante subprocess en el host.**

Diseña y verifica primero un entorno por tarea, efímero y aislado (p. ej. rootless OCI) con:
- Sin red, sin credenciales, uid sin privilegios, filesystem de solo lectura salvo directorio temporal permitido.
- Límites efectivos de CPU, RAM, disco, procesos, tiempo y tamaño de salida; cancelación de árbol de procesos.
- Cero acceso al repo original, archivos personales, tokens GitHub o sockets del host.
- Rechazo de `..`, symlinks y ZIP slip; rutas de workspace controladas; comandos/tests pre-aprobados.
- Estados veraces: `not_run`, `passed`, `failed`, `timed_out`, `cancelled`; logs acotados y descargables.
- Pruebas adversarias inofensivas: red, escape de directorio, loop infinito, salida masiva, symlink, multiproceso.

**Aceptación:** aislamiento comprobado por pruebas reproducibles. Si no puedes verificarlo en el entorno, deja la ejecución **desactivada** y entrega diseño documentado sin fingir que es segura. Para Windows indica límites auténticos; no extrapoles garantías Linux.

## Prioridad P2 — cambios revisables antes de PR

Una vez P1 sea segura: trabajo en directorio temporal por tarea, diff legible, validación de archivos, ejecución de tests allowlisted dentro del sandbox, resumen de riesgos, vista previa del parche y **segunda aprobación humana sobre ese diff exacto**. Nunca modificar main, hacer push/merge/deploy por defecto.

Integración GitHub opcional solo con consentimiento y scopes mínimos; ausencia de conexión debe permitir exportar patch/ZIP offline. Idempotencia de eventos y cancelación completa. Rechazar cambios ocultos, rutas externas o binarios enormes.

**Aceptación:** no se escribe fuera del área autorizada, el dueño ve el diff y pruebas antes de decidir, un rechazo no altera ramas ni servicios.

## Prioridad P3 — agentes locales opcionales, honestidad de métricas

Con P1/P2 listos, permitir **Ollama local opt-in**, sin descarga automática de modelos ni APIs pagas obligatorias. El modo determinista debe seguir funcionando a $0 sin IA. Separar planner/coder/tester/reviewer mediante interfaz y máquina de estados; timeout, output bounds, cancelación, privacidad, validación de parches y logs; ningún modelo puede eludir la aprobación del dueño. Indicar claramente `provider=mock|local-verified|unavailable`: no llamar "IA que programa sola" a una plantilla fija.

**Aceptación:** prueba de inferencia real sólo si dueño habilita modelo local, estado verificable y fallback sin LLM. No almacenar prompts personales sin autorización.

## Prioridad P4 — profesionalizar los otros Labs

- Commerce: autenticación y roles, idempotencia de orden, control de inventario transaccional bajo concurrencia entre usuarios, seguridad de API, sin pagos reales por defecto.
- Studio: drag/drop accesible con teclado; estilos, preview HTML aislado, conflictos/revisiones colaborativas, tests de XSS y UX.
- Monitor: cron local **opt-in**, lista segura de destinos/SSRF, incidentes, ventanas de disponibilidad y notificaciones opcionales sin proveedores pagos. Nunca llamar "uptime 24/7" a sondeos manuales.
- Portafolio: casos de estudio completos (problema, arquitectura, alternativas, seguridad, limitaciones, tests), enlaces de demos/código y UX profesional en 5 idiomas. No inventar experiencia, credenciales ni horas; **94 h documentadas = formación, NO programación**.

## Mapa de archivos

- `components/labs/LabsWorkspace.tsx` — cuatro interfaces.
- `lib/labs-core.mjs` + `lib/labs-core.d.mts` — lógica JS tipada.
- `labs/{commerce,studio,monitor,factory}/backend.py` y `test_backend.py`.
- `app/api/labs/{commerce,studio,monitor,factory}/route.ts`.
- `scripts/{commerce,studio,monitor,factory}_http_qa.mjs`.
- `scripts/browser_qa.py`, `scripts/smoke.mjs`, `.github/workflows/ci.yml`.
- `docs/CODEX_HANDOFF.md` — estado previo de asistentes/migraciones y límites.
- `docs/FOUR-ENGINEERING-LABS.md` — alcance real de cada proyecto.
- `labs/factory/README.md` — cómo activar Factory en localhost.

## Comandos de verificación

```bash
npm ci
npm run lint
npx tsc --noEmit
node scripts/labs_unit_qa.mjs
python -m unittest discover -s labs/commerce -p "test_*.py" -v
python -m unittest discover -s labs/studio -p "test_*.py" -v
python -m unittest discover -s labs/monitor -p "test_*.py" -v
python -m unittest discover -s labs/factory -p "test_*.py" -v
npm run build
```

La integración HTTP y las pruebas Playwright/PDF se ejecutan con el CI de GitHub; no hay que escribir en producción.

## Definición de terminado

1. Commits pequeños en la rama existente; PR #46 abierto.
2. Seguridad, accesibilidad y pruebas de regresión antes de ampliar capacidades.
3. Distinguir claramente QA estática, test real, simulación e inferencia confirmada.
4. No activar proveedores ni acceso a internet sin autorización.
5. Al reportar: SHA, CI del **mismo** SHA, riesgos pendientes y qué permiso se necesitaría.
6. El usuario debe poder explicar el código y demostrarlo; no prometer empleo garantizado.

## Prompt listo para Codex

> Continúa Dleteo/Nexus-AI en feat/career-portfolio-20261026, PR #46, SIN merge ni despliegue. Lee AGENTS.md, docs/CODEX_HANDOFF.md, docs/CODEX_NEXT_PHASE.md y docs/FOUR-ENGINEERING-LABS.md. Verifica HEAD y CI. Conserva los cuatro Labs y la propiedad/costo $0. Empieza por la auditoría P0 y el diseño/pruebas de aislamiento P1. No ejecutes código del usuario en el servidor ni declares IA autónoma. Avanza con cambios pequeños y pruebas, deja el PR abierto para aprobación humana.
