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

## Continuación tras «okay sigue»

- Se retomó desde `8f12841c1be3544ad1c00abc6cce36d4d44fc701`, con árbol limpio, PR #46 abierto y [CI #465 verde](https://github.com/Dleteo/Nexus-AI/actions/runs/40683889929) comprobada de nuevo para ese SHA.
- La inspección de sólo lectura sigue sin acreditar runtime rootless ni cgroup delegado escribible por el usuario. No se instalaron herramientas ni se configuró infraestructura.
- Trabajo de esta continuación **en curso**: validar snapshots/ZIP de entrada sólo en memoria, sin extraer/escribir/ejecutar; reflejar explícitamente `execution.status=not_run` separado de QA estática; ampliar el inventario de capacidades con observaciones acotadas, sin convertirlas en garantías.
- P1 sigue bloqueada; no se implementa ejecución, P2, P3 ni acceso a nuevos proveedores. Actualizar este apartado con commits y pruebas al terminar.

## Trabajo realizado y por qué

1. **P0 HTTP:** guardas compartidas para los cuatro Labs; Host/puerto estricto, Origin POST obligatorio y exacto, bloqueo cross-site/same-site y forwarding conflictivo. Se conserva 503 en producción. Los cuerpos se leen por streaming con límite de bytes y plazo total. Monitor ya no deriva el puerto de destino de un Host arbitrario: usa el listener real de Next. Esto evita CSRF, lecturas ilimitadas y sondeo de otros puertos mediante Host falsificado.
2. **P0 Python:** runner exclusivo de cuatro backends confiables, Python aislado `-I`, entorno mínimo sin claves ni proxies, límites de entrada/salida/tiempo/concurrencia y cancelación de grupo POSIX. No es un sandbox ni acepta código de tareas. En Windows la ejecución HTTP Python falla cerrada por falta de Job Objects verificados; las demos de navegador siguen disponibles.
3. **P0 disco:** helper SQLite para los cuatro Labs que rechaza enlaces, archivos especiales/hardlinks, ancestros ajenos y escritura de terceros; crea almacenamiento nuevo con 0700/0600. Reforzada validación ZIP y comparación con plantilla reproducida: alterar contenido y manifiesto ya no pasa. ZIP legado sin manifiesto devuelve 422 sin borrar historial; regenerar exige nueva propuesta/aprobación.
4. **P1:** diseño verificable y preflight offline, siempre `enabled=false`, `not_run`, exit 2. El Docker observado no acredita rootless; no se lanzaron contenedores ni cargas no confiables. **P1 no está aceptada** y no se avanza a P2/P3.
5. **Continuidad:** esta hoja, auditoría detallada, diseño P1 y nuevas regresiones integradas en CI. Coste obligatorio $0; no nuevos proveedores, modelos, permisos ni infraestructura.

Detalles y límites: [auditoría P0](LABS_SECURITY_P0_2026-10-28.md) y [diseño P1](FACTORY_SANDBOX_P1.md). Las comprobaciones de filesystem no eliminan carreras con procesos del mismo UID; archivos antiguos 0644 pueden seguir siendo legibles por otros. Host no prueba peer local: `npm run dev` ahora usa 127.0.0.1 por defecto, sin proxy/túnel.

## Commits pequeños de esta sesión

| Commit | Cambio |
|---|---|
| `980ec5b` | Hoja de continuidad inicial, para conservar el contexto desde el principio |
| `5f4735a` | SQLite seguro y ZIP Factory íntegro, con regresiones |
| `ca68a41` | Runner Python confiable acotado y entorno sin credenciales |
| `29ea01e` | Cuatro APIs: autoridad local, CSRF, streaming y puerto Monitor fijo |
| `b657d37` | Diseño P1 y preflight que no habilita ejecución |

El commit que incorpora la actualización final de esta hoja integra también las nuevas comprobaciones de CI y el enlace desde el handoff. Consultar `git log -8 --oneline` para sus SHA completos.

## Pruebas y evidencia

- Pasaron localmente: instalación, lint (una advertencia preexistente por import sin usar en `CareerProcessStrip.tsx`), tipos, lógica de Labs, regresiones HTTP offline, runner confiable y limpieza Linux, 13 tests nuevos SQLite, 5 tests preflight y suites Python Commerce 5 / Studio 5 / Monitor 5 / Factory 12.
- Pasaron las **cuatro APIs reales** sobre Next en desarrollo con SQLite desechable y la suite HTTP adversaria: receptor señuelo sin conexiones, CSRF, tipos, exceso de bytes Unicode y registros intactos tras rechazos.
- Pasaron las suites de asistentes/proveedores simulados y probe sintético. **No demuestran inferencia real**.
- El primer typecheck encontró tipos generados `.next/dev` de una rama anterior; se borró sólo esa caché generada y `next typegen` + TypeScript pasaron.
- `npm run build` local no terminó: la política de red restringida bloquea Google Fonts usados por el layout existente. No se modificó el diseño ni se eludió la política de red. La compilación completa, navegador, PDFs y PostgreSQL se comprueban con CI del HEAD en GitHub.
- La CI inicial verde **no valida cambios posteriores**. Al cerrar esta hoja, consultar la pestaña Actions del PR y confirmar que el SHA de la corrida es el HEAD actual. La respuesta final de la sesión y descripción del PR registran el resultado remoto observado, si ya terminó.

No hay inferencia real, ejecución de código generado ni sandbox validado. No se hicieron merge, despliegue, migraciones reales ni lectura de repositorios privados.

## Pendiente y próximo paso

1. Revisar CI del HEAD exacto y cualquier fallo antes de aprobar el PR; mantenerlo abierto.
2. Revisar humanamente los cambios P0 y sus límites de loopback/almacenamiento privado/Windows.
3. P1 sólo puede habilitarse tras verificar en Linux dedicado rootless, red/credenciales ausentes, mounts, cgroups CPU/RAM/PIDs/disco, salida, timeout/cancelación y limpieza con la suite adversaria descrita. Este entorno no lo acredita: **no ejecutar pruebas de código generado en el host para compensarlo**.
4. P2 diff/aprobación y P3 Ollama siguen pendientes; no conectar proveedores ni repos privados sin autorización. No rehacer los cuatro Labs.

## Para continuar en ChatGPT

> Continúa Nexus AI en `Dleteo/Nexus-AI`, rama `feat/career-portfolio-20261026`, PR #46 abierto, SIN merge ni despliegue. Lee `AGENTS.md`, `docs/CODEX_HANDOFF.md`, `docs/CODEX_NEXT_PHASE.md`, `docs/FOUR-ENGINEERING-LABS.md` y esta hoja `docs/CONTINUIDAD_CODEX_2026-10-28.md`. Usa issue #47 como plan. Comprueba HEAD/estado Git y CI del mismo SHA. Revisa primero qué cambios ya están hechos y cuáles siguen en curso; no reconstruyas los cuatro Labs. Completa P0 antes de activar P1. No ejecutes código generado en Next.js ni en el host; si el sandbox real no tiene aislamiento comprobado, déjalo desactivado. Conserva $0, propiedad del código y revisión humana. Actualiza esta hoja con cada entrega y explica claramente pruebas y límites.
