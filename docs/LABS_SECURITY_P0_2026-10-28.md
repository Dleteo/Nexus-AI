# Auditoría P0 de los cuatro Labs

Plan: [issue #47](https://github.com/Dleteo/Nexus-AI/issues/47). Trabajo sobre la rama del PR #46, sin merge ni despliegue. Se conservan las cuatro demos y su modo navegador. No se habilitan servicios ni costes.

## Amenazas y correcciones

| Superficie | Hallazgo | Control incorporado |
|---|---|---|
| Autoridad HTTP | Commerce/Studio separaban Host por `:`, admitiendo formatos ambiguos; los cuatro servicios tenían comprobaciones distintas | Host exacto `localhost` o `127.0.0.1`, puerto válido igual al `PORT` del listener Next; rechazo de forwarding conflictivo |
| CSRF | Origin era opcional en POST; Commerce no exigía JSON; otros sólo rechazaban `cross-site` | Origin exacto obligatorio en POST, JSON estricto, bloqueo de `cross-site` y `same-site`; GET también rechaza origen ajeno |
| Cuerpos | `request.text()` leía el cuerpo completo antes de medirlo; Monitor no lo limitaba | Lectura streaming de bytes UTF-8, límites 2 KiB/20 kB/4 KiB según API, timeout total 5 s, cancelación y rechazo de compresión |
| Monitor | El puerto de destino se derivaba de Host enviado por el cliente | El puerto sale de `process.env.PORT`, fijado por el servidor Next estándar al escuchar; Host con otro puerto se rechaza antes del probe |
| Lanzador | Cuatro `execFile` heredaban el entorno completo y cancelaban sólo el proceso directo | Runner compartido, sólo scripts fijos del repositorio, Python `-I -X utf8`, entorno mínimo y sin claves/proxies, cancelación del grupo POSIX |
| Saturación | Lanzamiento por petición sin límite común | Máximo 8 runners simultáneos por proceso Next, entrada 20 kB, salida combinada stdout/stderr 256 KiB y plazo 5 s (Monitor 6,5 s) |
| Disco | SQLite seguía enlaces en DB, directorios y auxiliares | Comprobaciones de ancestros/propietario, DB y `-wal/-shm/-journal`; rechazo de enlaces, reparse points, hardlinks y archivos especiales; creación de directorios 0700/DB 0600 |
| ZIP | Metadatos de enlace/archivo especial y manifiestos ambiguos no se descartaban; contenido+manifiesto podían reemplazarse juntos | Allowlist exacta ordenada, tipos regulares, stored/deflate, flags admitidos, CRC, tamaños y JSON sin claves duplicadas; comparación con archivos reproducidos del job |
| Legado | ZIP sin manifiesto no puede acreditar el contrato actual | Rechazo con `artifact-integrity-failed`/422, sin borrar historial ni migración silenciosa; nueva propuesta y aprobación para generar otro ZIP |

Las cuatro rutas conservan HTTP 503 en producción, incluso con las banderas locales activas. Las respuestas no exponen stderr, rutas de disco ni credenciales. Los errores de validación no modifican los registros. No se extrae ningún ZIP ni se ejecutan sus archivos.

**Monitor, protocolo HTTP:** `http.client.HTTPException` (status malformado, chunked truncado o desconexión) y status fuera de 100–599 ahora generan muestras fallidas `connection-error`, en lugar de abortar sin historial ni alerta. La prueba usa cuatro respuestas defectuosas desde un receptor efímero en 127.0.0.1, comprueba persistencia/alerta crítica y cierre de socket. Se conservan destino fijo, límites de lectura y timeout; no hay destinos externos ni daemon.

**Revisión posterior del ZIP:** se reprodujo un BLOB que declaraba 445 bytes pero descomprimía 845. `ZipFile.read` devolvía sólo el prefijo declarado, de modo que CRC/manifiesto y comparación contra el contenido esperado podían pasar ignorando los bytes ocultos. La descarga ahora reutiliza `snapshot_from_zip`, con descompresión real acotada, EOF, ausencia de datos sobrantes y CRC. Se mantienen los límites Factory de 120 KB/12 KB y la allowlist ordenada; se rechazan comentarios/extras/ZIP64 y prefijos/trailers sin modificar el generador ni borrar historial. Otra regresión bloquea aliases reservados de Windows con espacios antes de la extensión, tanto en snapshots directos como ZIP. Esto refuerza la validación de datos; P1 continúa sin runtime verificado.

## Uso local y compatibilidad

`npm run dev` ahora escucha por defecto en `127.0.0.1`. No sobrescribirlo con `0.0.0.0`, publicar puertos, crear túneles ni poner este servidor detrás de un proxy. **Host/Origin no autentican al peer de red.** Un cliente local puede construir esos headers; otro proceso del mismo usuario está fuera de esta frontera de confianza. No hay cuentas ni autorización multiusuario en estos backends.

Los guards dependen del servidor estándar de Next.js 16, que establece `process.env.PORT` al abrir el listener (`next/dist/server/lib/start-server.js`). Sin puerto válido, las APIs devuelven 503. Un servidor personalizado/proxy no ha sido validado. El Monitor sólo contacta `127.0.0.1:<puerto-del-listener>/api/labs/health`, sin redirecciones ni URL libre. La regresión HTTP usa un receptor señuelo en otro puerto y comprueba que Host falsificado no lo contacta.

Los clientes CLI locales deben enviar `Content-Type: application/json` y `Origin: http://127.0.0.1:<puerto>` (o la autoridad `localhost` exacta usada). El navegador envía Origin por sí mismo. Los scripts de integración se han actualizado; no hay cambio del contrato de los datos de las cuatro demos.

El runner sólo ejecuta backends confiables del propio repositorio y rechaza enlaces en el script y helper SQLite. **No es un sandbox.** Mata el grupo POSIX de esos backends al terminar, agotar el plazo/salida o cancelar; no contiene un programa hostil que cambie de sesión. Las pruebas de limpieza de procesos usan Linux `/proc`; no acreditan otros sistemas. En Windows nativo, la ejecución Python por HTTP queda desactivada hasta verificar Job Objects/limpieza completa. Las cuatro demos de navegador siguen disponibles. No se modifican los datos SQLite existentes para compensarlo.

`NEXUS_*_DB` sigue seleccionando archivos locales desde configuración del operador, nunca desde HTTP. Los ancestros POSIX deben pertenecer a root o al usuario actual y no admitir escritura de terceros salvo raíces sticky como `/tmp`; el directorio inmediato y los archivos deben pertenecer al usuario y no permitir escritura ajena. Los permisos de archivos existentes se conservan: un DB 0644/directorio 0755 **puede ser legible por otros usuarios**. Para datos sensibles, el operador debe usar un directorio privado 0700 y archivo 0600. No se comprueban ACLs Windows, ni se elimina TOCTOU ante procesos del mismo UID; mantener el almacenamiento bajo control exclusivo. No se ha aplicado migración a datos reales.

El manifiesto SHA-256 no es firma ni atestación. Reproducir la plantilla detecta sustitución de un BLOB/manifiesto, pero un atacante que modifica a la vez el código o el job en DB controla esta aplicación confiable. Los cambios futuros de plantilla pueden invalidar ZIP antiguos, exigiendo una nueva revisión/aprobación.

## Evidencia reproducible

```sh
npm ci
npm run lint
npx tsc --noEmit
node scripts/labs_http_unit_qa.mjs
node scripts/labs_runner_qa.mjs
node scripts/labs_unit_qa.mjs
python3 -m unittest discover -s labs -p 'test_sqlite_storage.py' -v
python3 -m unittest discover -s labs/commerce -p 'test_*.py' -v
python3 -m unittest discover -s labs/studio -p 'test_*.py' -v
python3 -m unittest discover -s labs/monitor -p 'test_*.py' -v
python3 -m unittest discover -s labs/factory -p 'test_*.py' -v
npm run build
```

CI ejecuta también los cuatro scripts HTTP funcionales y `scripts/labs_http_security_qa.mjs` sobre un solo servidor Next de desarrollo con bases desechables; después comprueba asistentes simulados, producción/503, cinco CV y navegador. La configuración está en `.github/workflows/ci.yml`. Consultar el resultado del **SHA actual**, no reutilizar un verde anterior.

Las pruebas del runner ejecutan únicamente un fixture confiable versionado que produce salida, espera o crea un hijo acotado para comprobar cancelación. No ejecutan código generado y no validan P1. El preflight y diseño P1, con ejecución bloqueada, están en [FACTORY_SANDBOX_P1.md](FACTORY_SANDBOX_P1.md). No hay inferencia real ni agentes autónomos.
