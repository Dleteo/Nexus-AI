# Hoja de continuidad — Nexus AI

Documento vivo de esta sesión, solicitado por el propietario para poder continuar en ChatGPT si se agota el crédito. No contiene secretos ni datos de repositorios privados.

## Encargo y límites

- Repositorio público `Dleteo/Nexus-AI`, rama `feat/career-portfolio-20261026`, [PR #46](https://github.com/Dleteo/Nexus-AI/pull/46) abierto; plan: [issue #47](https://github.com/Dleteo/Nexus-AI/issues/47).
- Preservar Commerce, Studio, Monitor y Software Factory, los dos asistentes y los cinco idiomas. Coste obligatorio $0 y código bajo control del propietario.
- Sin merge, despliegue, proveedores nuevos, pagos, migraciones reales ni lectura de repositorios privados. No ejecutar código generado en Next.js ni en el host.
- Leídos `AGENTS.md`, `docs/CODEX_HANDOFF.md`, `docs/CODEX_NEXT_PHASE.md` y `docs/FOUR-ENGINEERING-LABS.md` antes de modificar.

## Punto de partida comprobado

- HEAD inicial: `b129b8c9604b17249ba35e87d3af1fcc464a3414`.
- CI de **ese SHA**, comprobada en GitHub: [40681908005](https://github.com/Dleteo/Nexus-AI/actions/runs/40681908005), `success`.
- PR abierto, sin fusionar. Se recuperó la rama existente sin rehacer los Labs.
- `npm ci` completado en el entorno local de trabajo.

## Trabajo en curso (no confundir con terminado)

1. P0 HTTP: endurecer Host/Origin/CSRF, límites de lectura y cancelación de las cuatro APIs; conservar 503 en producción.
2. P0 Python: centralizar un runner exclusivo de backends confiables, acotar entrada/salida/tiempo, limpiar credenciales heredadas y cancelar procesos.
3. P0 disco: rechazar enlaces simbólicos en SQLite y sus auxiliares; reforzar validación ZIP, metadatos y compatibilidad de artefactos antiguos.
4. P1: documentar un sandbox real y preflight conservador. Este entorno carece de garantías rootless verificadas; ejecución de código generado permanece **desactivada**, estado `not_run`.

## Pruebas y commits

Pendientes de completar y registrar antes de la entrega. La CI inicial no valida cambios posteriores. No hay inferencia real ni tests de código generado ejecutados.

## Para continuar en ChatGPT

> Continúa Nexus AI en `Dleteo/Nexus-AI`, rama `feat/career-portfolio-20261026`, PR #46 abierto, SIN merge ni despliegue. Lee `AGENTS.md`, `docs/CODEX_HANDOFF.md`, `docs/CODEX_NEXT_PHASE.md`, `docs/FOUR-ENGINEERING-LABS.md` y esta hoja `docs/CONTINUIDAD_CODEX_2026-10-28.md`. Usa issue #47 como plan. Comprueba HEAD/estado Git y CI del mismo SHA. Revisa primero qué cambios ya están hechos y cuáles siguen en curso; no reconstruyas los cuatro Labs. Completa P0 antes de activar P1. No ejecutes código generado en Next.js ni en el host; si el sandbox real no tiene aislamiento comprobado, déjalo desactivado. Conserva $0, propiedad del código y revisión humana. Actualiza esta hoja con cada entrega y explica claramente pruebas y límites.
