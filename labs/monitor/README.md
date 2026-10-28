# Nexus Monitor — seguimiento local y alertas SQLite

Monitor local de **Nexus AI**, con código Python estándar y sin dependencias externas.

## Qué hace de verdad

- El navegador puede seguir haciendo consultas manuales a `/api/labs/health` sin base de datos.
- En modo opcional de desarrollo local, Next.js invoca `labs/monitor/backend.py` para comprobar **desde el servidor** `http://127.0.0.1:<puerto>/api/labs/health`.
- El destino está **fijado en el código**. La API no acepta nombres de dominio, rutas, URLs ni direcciones IP introducidas por usuarios.
- Cada medición guarda en SQLite fecha/hora, resultado, código HTTP, latencia y una nota corta.
- Conserva 300 registros como máximo; muestra los últimos 100 en el panel.
- Alertas visibles: `warning` si falla la última prueba o tarda 500 ms o más, `critical` tras tres fallos consecutivos y `healthy` cuando la prueba más reciente funciona sin lentitud.
- Incluye tasa de éxito observada y latencia p95 calculadas sobre las últimas 100 mediciones.

**Importante:** las alertas se calculan únicamente cuando el usuario realiza una medición manual. No hay tareas en segundo plano, notificaciones push, correos, escaneo externo, SLA de disponibilidad ni comprobaciones automáticas.

## Uso local

Instala Python 3, Node.js y las dependencias del repositorio. En `.env.local`:

```ini
NEXUS_LABS_MONITOR_SQLITE=1
```

Ejecuta `npm run dev`, abre `http://localhost:3000/labs?lab=monitor` y pulsa **Use local SQLite**. Después ejecuta **Run health check**. El historial se guarda en `.nexus-local/monitor.sqlite3`, ignorado por Git. Puedes cambiar el archivo con `NEXUS_MONITOR_DB`.

La API `/api/labs/monitor` se habilita solo en desarrollo, con una dirección Host de loopback y la variable anterior. **En producción responde HTTP 503**. Es una demo sin cuentas; nunca la expongas públicamente.

## Pruebas

```sh
python -m unittest discover -s labs/monitor -p "test_*.py" -v
```

GitHub Actions ejecuta esa batería y una prueba HTTP real con Next.js, usando bases SQLite temporales. Comprueba el rechazo de peticiones desde otro origen y el bloqueo de la API en producción.

## Próximas mejoras

Servicios de prueba explícitamente permitidos, programación local acotada, autenticación, persistencia de incidentes, historial paginado, alertas configurables y métricas de ventanas temporales. Cualquier endpoint externo requerirá una política de destinos y defensas contra SSRF.
