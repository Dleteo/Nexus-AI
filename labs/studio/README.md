# Nexus Studio — editor versionado con SQLite local

Este módulo complementa el editor visual de Nexus AI con un **backend real de documentos versionados**, sin dependencias externas ni servicios de pago.

## Funciones verificables

- Editor de bloques `hero`, `text` y `button`, vista previa React y exportación HTML escapada.
- Guardado voluntario en SQLite y snapshots inmutables por revisión.
- **Concurrencia optimista:** el cliente envía `expectedRevision`; una versión desactualizada devuelve HTTP 409 en lugar de sobrescribir datos.
- Restauración de una revisión anterior como una **nueva** revisión, conservando el historial.
- Validación estricta de IDs únicos, tipos permitidos, máximo 30 bloques y 500 caracteres por bloque.
- Modo normal con borrador en `localStorage`; no se requiere Python para utilizarlo.

## Configuración local opcional

Instala Node.js, dependencias con `npm ci` y Python 3 (incluye SQLite). En `.env.local` escribe:

```ini
NEXUS_LABS_STUDIO_SQLITE=1
```

Ejecuta `npm run dev`, abre `http://localhost:3000/labs?lab=studio` y selecciona **Use local SQLite**. Después usa **Save revision**, el selector de versiones y **Restore as new revision**.

Se crea un archivo bajo `.nexus-local/studio.sqlite3`, ignorado por Git. Puedes cambiarlo mediante `NEXUS_STUDIO_DB` a un archivo local aparte. Los borradores del navegador y los documentos SQLite están separados; cambiar de modo carga el contenido del destino y no fusiona automáticamente.

**Seguridad:** el endpoint `/api/labs/studio` solo está activo con `NODE_ENV=development`, con la variable habilitada y solicitudes a `localhost` o `127.0.0.1`. En builds de producción devuelve HTTP 503. No hay autenticación multiusuario, publicación remota ni sincronización en nube. No expongas este backend a Internet.

## Pruebas

```sh
python -m unittest discover -s labs/studio -p "test_*.py" -v
```

Las pruebas cubren lectura/escritura persistente, entradas malformadas, concurrencia y restauración. GitHub Actions también arranca un servidor Next.js de desarrollo con una base temporal y verifica API HTTP, respuesta 409, validación y bloqueo de origen.

## Trabajo futuro

Agregar cuentas/autorización, guardado automático con recuperación ante fallos, historial ilimitado paginado, estilos configurables, arrastrar y soltar accesible, colaboración en tiempo real y publicación segura. La versión actual es un **MVP local**, no una plataforma de despliegue de sitios.
