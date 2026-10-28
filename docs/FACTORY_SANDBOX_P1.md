# Factory P1 — diseño de aislamiento y ejecución desactivada

Fecha: 28 de octubre de 2026. Plan: [issue #47](https://github.com/Dleteo/Nexus-AI/issues/47).

**La ejecución de código generado sigue desactivada. P1 no está aceptada.**
La Factory conserva su plantilla HTML/CSS, preview, aprobación, ZIP y QA estática.
No se ha añadido un runner de código, endpoint de ejecución, proveedor ni coste.
La QA estática existente no equivale al estado `passed` de un test ejecutado.

## Evidencia del entorno de esta revisión

Inspección local de sólo lectura, sin lanzar contenedores ni cargas adversarias:

| Observación | Resultado | Lo que permite concluir |
|---|---|---|
| Sistema / usuario del proceso | Linux / UID 1000 | El proceso de inspección no es root; no prueba el UID de otro runtime |
| Comandos disponibles | Docker, runc y bwrap; sin Podman, newuidmap ni newgidmap | Presencia de herramientas, sin garantía de aislamiento |
| cgroups | v2 presente; raíz del montaje no escribible para el usuario | No se verificó delegación ni aplicación efectiva de límites |
| Docker local, socket explícito | `SecurityOptions`: `seccomp` y `cgroupns`; sin `rootless` | Este daemon no acredita el requisito de runtime rootless |
| Pruebas de cargas no confiables | **No ejecutadas** | Ninguna garantía P1 comprobada |

La consulta de Docker se hizo únicamente con `info`, seleccionando
`unix:///var/run/docker.sock` y sin selectores remotos; no se modificó el daemon.
No instalar ni habilitar herramientas a partir de este documento. El límite es
la falta de evidencia de aislamiento completo, no sólo la ausencia de Podman.
Docker rootful, un UID no root dentro de un contenedor, bwrap por sí solo o
`subprocess` con timeout no satisfacen este diseño.

Inventario reproducible sin red, daemon, lectura de secretos ni subprocess:

```sh
python3 scripts/sandbox_preflight.py
# Salida JSON: enabled=false, status=not_run; código de salida 2 (bloqueado).
python3 -m unittest discover -s scripts -p 'test_sandbox_preflight.py' -v
```

El inventario permanece bloqueado incluso si encuentra todas las herramientas.
No ejecuta la suite adversaria, no acredita rootless y no permite habilitación
por bandera o variable de entorno. Sus tests verifican esta negativa, no un
sandbox. `--help` muestra ayuda y no evalúa disponibilidad.

## Frontera propuesta para una futura implementación

Next.js sólo entregaría un snapshot validado y una solicitud declarativa a un
worker local separado, con cuenta y área de datos dedicadas. Next, sus runners
Python actuales y el host nunca ejecutarían el código de la tarea. El worker no
tendría credenciales de GitHub, Supabase o proveedores, acceso al repositorio
original ni autoridad para hacer push, merge o deploy. No compartir usuarios,
directorio HOME, sockets ni descriptores abiertos con la aplicación.

Cada tarea tendría un contenedor OCI **rootless** nuevo en Linux, dentro de una
máquina de ensayo dedicada sin datos personales. Un contenedor comparte kernel:
no se presenta como protección frente a vulnerabilidades del kernel ni como
servicio público multiusuario. Para código hostil se requiere una frontera más
fuerte, por ejemplo una VM desechable sin integración con el host.

El worker debe comprobar y rechazar cualquier ejecución si falta una garantía:

| Control | Requisito verificable de la implementación futura |
|---|---|
| Runtime | Endpoint local rootless seleccionado explícitamente; sin fallback rootful ni daemon expuesto al contenedor |
| Red | Namespace nuevo sin interfaces externas, sin DNS ni proxy, sin host networking o puertos; sin sockets Unix del host |
| Identidad | UID/GID sin privilegios, user namespace, capabilities vacías, `no-new-privileges`, seccomp y política LSM cuando esté disponible |
| Imagen | Imagen local inmutable por digest y revisada; sin pull, instalación de dependencias, builds o hooks durante la tarea |
| Entorno | Lista mínima de variables creada desde cero; sin env heredado, proxies, certificados de sesión, claves ni montajes de configuración |
| Disco | Rootfs e input de sólo lectura; únicamente tmpfs de trabajo de 64 MiB, sin swap, `nosuid,nodev`; no otros volúmenes, devices o sockets |
| Recursos | cgroups v2 delegados: 1 CPU, 512 MiB RAM, swap 0, 32 PIDs; tmpfs y tamaño de archivos acotados; concurrencia máxima 1 inicialmente |
| Tiempo | 15 s de reloj y presupuesto CPU; supervisión fuera del contenedor; cancelar el cgroup completo, esperar desaparición de todos sus procesos y eliminarlo |
| Salida | Máximo combinado 256 KiB stdout/stderr; lectura continua con límite, sin almacenar salida ilimitada en el runtime; matar la tarea al excederlo |
| Comandos | ID de test → argv fija del worker/imagen, sin shell ni argumentos libres; nunca ejecutar `package.json` scripts, Makefile, hooks o configuración de test aportada por la tarea |
| Datos | Snapshot copiado, no bind mount del repo; excluir `.git`, `.env`, credenciales y datos personales; máximo 100 archivos, 1 MiB por archivo y 8 MiB total |

Son límites propuestos, **no mediciones aplicadas**. CPU, RAM, swap, PIDs y tmpfs
se deben comprobar en el cgroup/montaje real: un runtime que acepte una bandera
pero ignore el límite debe abortar antes de recibir una tarea. `noexec` puede
usarse donde corresponda, pero no impide que un intérprete lea código.

Antes de materializar cualquier snapshot, validar nombres relativos POSIX y
rechazar rutas absolutas, `..`, `.` ambiguo, NUL, backslash, prefijos Windows,
nombres duplicados y colisiones por normalización. Rechazar symlinks, hardlinks,
devices y archivos especiales; comprobar tipo y tamaño real, no sólo extensión.
Si entra un ZIP, no usar extracción genérica: limitar tamaño comprimido y
descomprimido, número de entradas y ratio; rechazar entradas cifradas, extras y
tipos no permitidos. Crear archivos con exclusión y sin seguir enlaces dentro
de un directorio nuevo privado, sin procesos de tarea activos durante la copia.

La aprobación vincularía el digest del snapshot, imagen y comando exactos.
Cualquier cambio invalida la aprobación. Sólo arrancar después de la validación
del worker, sin confiar en hashes, estados o aprobaciones que declare el código
de la tarea. No confundir el manifiesto SHA-256 de ZIP con una firma o garantía
de seguridad. La segunda aprobación del diff y GitHub pertenecen a P2 y siguen
pendientes.

## Estados y registros futuros

`not_run` indica que no se inició una carga, por falta de aprobación, validación
o aislamiento. `passed` exige salida 0 y resultado del test allowlisted;
`failed` incluye salida no cero, OOM o límites de recursos/salida alcanzados;
`timed_out` exige vencimiento del reloj; `cancelled` exige cancelación solicitada.
La transición final se publica únicamente después de confirmar que no quedan
procesos ni contenedores de la tarea. Ante pérdida del worker, conservar estado
pendiente de reconciliación y bloquear nuevas ejecuciones, sin inventar éxito.

Los registros, todavía no implementados, serían texto inerte acotado,
descargable y escapado en la UI, con motivo de fin, truncamiento y digest de
entrada/imagen/comando. Sin ANSI/HTML activo, prompts personales ni secretos.
Sólo copiar artefactos de una lista fija después de detener la tarea, con los
mismos controles de rutas/tamaño, y destruir el workspace. Una tarea no puede
escribir su propio resultado verificado ni reutilizar un workspace anterior.

## Suite adversaria pendiente: condición para habilitar P1

Estas pruebas deben vivir y ejecutarse **dentro del aislamiento ya comprobado**,
con supervisión externa y fixtures inofensivos. No hay script que las lance en
el host. Para cada prueba guardar runtime/versión, digest de imagen, configuración
efectiva, salida acotada, estado final y prueba de limpieza; repetir en el SHA
que se vaya a revisar.

| Prueba futura | Evidencia requerida |
|---|---|
| Red | Fallan TCP/UDP/DNS hacia un receptor de ensayo controlado, loopback del host y metadata; no se envían datos externos |
| Acceso a disco/credenciales | Canarios sintéticos fuera del snapshot y sockets de host inaccesibles; rootfs/input no escribibles; env coincide con allowlist |
| ZIP slip, traversal y symlinks | Rechazo antes de crear archivos; ningún canario exterior cambia, incluidos enlaces/colisiones Windows y ZIPs expansivos |
| Bucle infinito | Se alcanza timeout y el contenedor/cgroup queda sin procesos antes del estado final |
| Salida masiva | Límite 256 KiB efectivo, memoria del worker acotada, marca de truncamiento y tarea terminada |
| Multiproceso | Fixture limitado intenta superar 32 PIDs; cgroup lo impide y cancelación elimina también descendientes |
| RAM/CPU/disco | Fixtures limitados alcanzan cada cuota; comprobar contadores del cgroup/tmpfs y respuesta controlada |
| Cancelación/reinicio | Cancelar tarea y reiniciar worker con descendiente activo; reconciliación elimina restos y no declara `passed` |
| Reutilización | Tarea siguiente no puede leer canarios de una anterior; no quedan montajes, procesos ni archivos |

No sustituir estas pruebas por mocks, inspección de flags o tests del inventario.
Hasta obtener la evidencia completa, no habilitar ejecución ni avanzar a P2/P3.

## Windows y coste

En Windows nativo no se han comprobado namespaces, cgroups ni cancelación con
Job Objects; se rechaza ejecución. WSL2 y Docker Desktop no heredan garantías de
esta revisión: deben evaluarse dentro de una VM Linux de ensayo, con montajes,
port forwarding y credenciales del host deshabilitados, y repetir toda la suite.
Un timeout de Python o `taskkill` aislado no acredita la frontera requerida.

El diseño no necesita APIs pagas, descarga de modelos ni servicio externo.
Requiere recursos locales disponibles y revisión del dueño; si no existen, la
plantilla y exportación offline continúan a coste obligatorio $0. No se ha
configurado infraestructura, leído repositorios privados ni cambiado propiedad
del código, visibilidad, producción o el PR abierto.
