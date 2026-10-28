# Hoja de continuidad — Nexus AI

Documento vivo de esta sesión, solicitado por el propietario para poder continuar en ChatGPT si se agota el crédito. No contiene secretos ni datos de repositorios privados.

## Lee esto primero — estado para ChatGPT

Último punto comprobado al retomar: `f7f285febd63f0a4b1ec410195736ea877c24743`, con [CI #466 verde](https://github.com/Dleteo/Nexus-AI/actions/runs/40686052125), rama limpia y PR #46 abierto. Ese resultado valida **ese SHA**, no modificaciones posteriores.

| Parte | Ya hecho | Qué falta |
|---|---|---|
| P0 | Guardas de cuatro APIs, CSRF, límites/cancelación del runner confiable, checks SQLite, integridad ZIP y regresiones | Revisión humana; cerrar cualquier borde reproducible nuevo sin rehacer los Labs |
| P1, preparación | Inputs/snapshots inmutables, ZIP en memoria, digest del preview, estado `not_run` en API/UI con cinco idiomas, preflight de metadata | **Runtime y aislamiento reales sin verificar**: rootless, red/credenciales ausentes, mounts, cuotas CPU/RAM/PIDs/disco, timeout/cancelación y limpieza por tarea |
| P2 y P3 | No iniciadas | Sólo después de P1: diff exacto/segunda aprobación y proveedor local opcional; nunca automatizar GitHub ni habilitar modelos por defecto |
| Cuatro Labs | Se conservan Commerce, Studio, Monitor y Factory, con demos y backends locales opcionales | Profesionalización P4 pendiente; sin pagos, multiusuario público ni servicios nuevos |

Continuación actual terminada en código: el verificador de descarga reutiliza el lector estricto de snapshots. Rechaza un ZIP que declaraba 445 bytes pero descomprimía 845, incluso cuando el CRC/manifiesto y la comparación con archivos originales parecían correctos. También bloquea nombres reservados de Windows con espacios antes de la extensión, como `CON .txt`, tanto en archivos como directorios y ZIP. No se ejecutó ni extrajo contenido.

| Commit más reciente | Qué hizo y por qué |
|---|---|
| `df383fd` | Poner este resumen «hecho / falta» al principio y actualizar los enlaces/instrucciones de continuidad |
| `a9e694e` | Cerrar el bypass de ZIP con datos ocultos reutilizando el decoder acotado existente, sin duplicar el código |
| `0a36d62` | Rechazar aliases de dispositivos Windows que el control anterior no reconocía |

Pruebas de esta continuación: **30 tests Factory** (16 backend + 14 snapshot), runner confiable, lint y TypeScript verdes; recorrido HTTP real propuesta → preview → aprobación → ZIP y suite adversaria de las cuatro APIs verdes. Lint conserva la advertencia preexistente. Se conserva historial, manifest, límites Factory 120 KB/12 KB y estado `not_run`; los ZIP legítimos stored/deflate siguen funcionando. Comentarios, extras, ZIP64, prefijos/trailers y tamaños inconsistentes se rechazan, sin migrar ni borrar artefactos. CI del commit final de documentación: comprobar Actions y el SHA registrado en la descripción del PR/respuesta final, sin reutilizar #466.

**Próximo paso real para P1:** disponer de un entorno Linux de ensayo dedicado que permita verificar rootless, cgroups delegados y la suite de aislamiento descrita. Este entorno sigue sin acreditarlo. No sustituir esa evidencia por más mocks, permisos de Docker rootful, ejecución en el host ni una bandera. No instalar/configurar infraestructura o proveedores sin autorización; P2/P3 permanecen bloqueadas. La validación de nombres Windows no demuestra aislamiento ni cancelación en Windows.

No interpretar los tests de parsing o la QA estática como tests de código generado. Ejecución sigue desactivada, sin merge/despliegue, coste obligatorio $0 y código bajo control del propietario. El detalle histórico y los comandos están más abajo.

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
- Se implementaron snapshots inmutables y ZIP de entrada **sólo en memoria** (`labs/factory/sandbox_snapshot.py`): límites, rutas seguras, nombres privados conocidos, colisiones Windows/Unicode/archivo-directorio, metadatos y descompresión real acotada. No extrae ni escribe archivos; no lee el repositorio ni ejecuta contenido.
- El preview real valida sus tres fuentes y entrega digest/tamaño/recuento del snapshot. Jobs y preview declaran explícitamente `execution={enabled:false,status:not_run,reason:isolation_not_verified}` incluso tras aprobación y QA estática verde. Las acciones `run/test/execute` siguen rechazadas, y los resultados aportados por cliente no habilitan nada.
- La UI muestra en los cinco idiomas que no hay tests de ejecución realizados; se conserva la QA estática. El preflight añade metadata de UID/cgroups/socket con lecturas acotadas y valores desconocidos ante errores, manteniendo todas las garantías `unverified` y exit 2.
- Revisión independiente corrigió alias de directorios por mayúsculas y conteo ZIP. La regresión de descompresión rechaza streams cuyo tamaño real excede lo declarado aunque el CRC del prefijo coincida.
- Pasaron localmente **27 tests Factory** (14 backend + 13 snapshot), **13 preflight**, runner confiable, lint/tipos y las **cuatro APIs reales + suite adversaria**. El navegador pasó la nueva comprobación en cinco idiomas con un job construido simulado: es una prueba de presentación, no de sandbox. Se conserva la advertencia previa de lint por import sin usar.
- P1 sigue bloqueada: faltan runtime rootless, aislamiento y límites efectivos/cancelación comprobados. No se implementa ejecución, P2, P3 ni acceso a nuevos proveedores. El digest no equivale a firma, aprobación humana ni detección de secretos arbitrarios.

| Commit de continuación | Cambio |
|---|---|
| `b8d17ae` | Registrar reanudación y CI del punto de partida |
| `4b1554b` | Validación inerte de snapshots/ZIP y 13 regresiones |
| `dbe548c` | Digest del preview y estado de ejecución fijo, sin habilitar runtime |
| `da64ba3` | Aviso en cinco idiomas y prueba de navegador |
| `0da1782` | Inventario preflight más preciso, sin afirmar aislamiento |

La CI final debe comprobarse para el commit que actualiza esta hoja/documentación;
la descripción del PR y la respuesta final registran su SHA y corrida exactos.

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

## Pruebas y evidencia de la primera entrega P0

- Pasaron localmente: instalación, lint (una advertencia preexistente por import sin usar en `CareerProcessStrip.tsx`), tipos, lógica de Labs, regresiones HTTP offline, runner confiable y limpieza Linux, 13 tests nuevos SQLite, 5 tests preflight y suites Python Commerce 5 / Studio 5 / Monitor 5 / Factory 12.
- Pasaron las **cuatro APIs reales** sobre Next en desarrollo con SQLite desechable y la suite HTTP adversaria: receptor señuelo sin conexiones, CSRF, tipos, exceso de bytes Unicode y registros intactos tras rechazos.
- Pasaron las suites de asistentes/proveedores simulados y probe sintético. **No demuestran inferencia real**.
- El primer typecheck encontró tipos generados `.next/dev` de una rama anterior; se borró sólo esa caché generada y `next typegen` + TypeScript pasaron.
- `npm run build` local no terminó: la política de red restringida bloquea Google Fonts usados por el layout existente. No se modificó el diseño ni se eludió la política de red. La compilación completa, navegador, PDFs y PostgreSQL se comprueban con CI del HEAD en GitHub.
- La CI inicial verde **no valida cambios posteriores**. Al cerrar esta hoja, consultar la pestaña Actions del PR y confirmar que el SHA de la corrida es el HEAD actual. La respuesta final de la sesión y descripción del PR registran el resultado remoto observado, si ya terminó.

No hay inferencia real, ejecución de código generado ni sandbox validado. No se hicieron merge, despliegue, migraciones reales ni lectura de repositorios privados.

## Pendiente y próximo paso

1. Revisar CI del HEAD exacto y cualquier fallo antes de aprobar el PR; mantenerlo abierto. La corrida #465 sólo valida `8f12841`, no los cambios posteriores de snapshots/UI/preflight.
2. Revisar humanamente los cambios P0 y sus límites de loopback/almacenamiento privado/Windows.
3. P1 sólo puede habilitarse tras verificar en Linux dedicado rootless, red/credenciales ausentes, mounts, cgroups CPU/RAM/PIDs/disco, salida, timeout/cancelación y limpieza con la suite adversaria descrita. Este entorno no lo acredita: **no ejecutar pruebas de código generado en el host para compensarlo**.
4. P2 diff/aprobación y P3 Ollama siguen pendientes; no conectar proveedores ni repos privados sin autorización. No rehacer los cuatro Labs.

## Para continuar en ChatGPT

> Continúa Nexus AI en `Dleteo/Nexus-AI`, rama `feat/career-portfolio-20261026`, PR #46 abierto, SIN merge ni despliegue. Lee `AGENTS.md`, `docs/CODEX_HANDOFF.md`, `docs/CODEX_NEXT_PHASE.md`, `docs/FOUR-ENGINEERING-LABS.md`, `docs/FACTORY_SANDBOX_P1.md` y esta hoja `docs/CONTINUIDAD_CODEX_2026-10-28.md`. Usa issue #47 como plan. Comprueba HEAD/estado Git y CI del mismo SHA. P0 se reforzó; P1 tiene validación de inputs inertes, digest del preview, estado not_run y preflight de metadata, pero no runtime verificado. Revisa antes lo ya entregado, sin rehacer cuatro Labs ni avanzar a P2/P3. No ejecutes código generado en Next.js ni en el host; mantén la ejecución desactivada mientras no haya aislamiento comprobado. No instalar/configurar infraestructura ni proveedores para compensarlo sin autorización. Conserva $0, propiedad del código y revisión humana. Actualiza esta hoja con pruebas, límites y siguientes pasos.
