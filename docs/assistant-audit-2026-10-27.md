# Auditoría de Nexus Portfolio y Nexus Technical — 27 de octubre de 2026

Rama: `feat/career-portfolio-20261026`. PR: [#46](https://github.com/Dleteo/Nexus-AI/pull/46), abierto para revisión humana. Sin merge, despliegue, llamadas a modelos reales ni cambios en Supabase de producción.

## Correcciones y regresiones

| Problema reproducible | Corrección | Evidencia |
| --- | --- | --- |
| `message: 123` u objetos causaban 500 antes de validar | Validación del objeto JSON, texto, UUID, modo, ámbito y opciones | Integración HTTP: 400 sin cuota ni generación |
| Red/JSON inválido de base de datos producía excepciones o respuestas engañosas | Lecturas de cabeceras y cuerpo con timeout, validación de filas/mensajes y errores 502 sin detalles internos | Integración: desconexiones, filas inválidas y cuerpos que no terminan |
| Un fallo al cargar historial consumía cuota antes de llamar al modelo | Cargar y validar historial antes de reclamar cuota | Integración: el contador no cambia si falla el historial |
| Al reabrir chats largos solo aparecían los primeros 100 mensajes | Recuperar los 100 más recientes y presentarlos cronológicamente | Integración con 102 mensajes |
| Pregunta y respuesta comparten `created_at` en la transacción y podían invertirse | Desempatar por rol y después UUID al consultar en orden descendente, antes de invertir | Integración con pares de fecha idéntica; contexto exacto enviado al modelo |
| Muchas conversaciones técnicas ocultaban las Portfolio por el límite global | Hasta 50 conversaciones por ámbito y orden conjunto por actualización | Integración con 52 conversaciones técnicas y una Portfolio antigua |
| Cambiar de ámbito reabría el primer chat; respuestas tardías podían añadirse a otro hilo | Carga inicial única abortable y exclusión mutua de envío/navegación/creación/borrado/cambio de modo | Navegador con solicitudes retenidas en ambos ámbitos |
| Un error de envío sobrescribía un borrador escrito mientras esperaba | Conservar el nuevo borrador y retirar solo el mensaje optimista fallido | Navegador: respuesta 502 demorada |
| Fallar la apertura inicial dejaba inaccesible la lista ya descargada | Conservar la lista y permitir abrir otro historial | Navegador: recuperación tras fallo inicial |
| JSON malformado de respuesta o fuentes podía romper la API, incluso después de guardar | Extracción defensiva antes del guardado; rechazar texto vacío o superior a 20.000 caracteres Unicode | Unitarias para Ollama/Gemini/OpenAI; integración con respuestas inválidas/largas |
| Ollama podía seguir un redirect fuera de su endpoint local validado | Rechazar redirects; también en peticiones autenticadas a proveedores y base de datos | Integración: redirect 307 no seguido |
| Un HTTP 200 del RPC de guardado con `false` se anunciaba como éxito | Exigir resultado booleano `true`; orientar a recargar antes de reintentar un guardado incierto | Integración: RPC 503 y `false`, sin éxito aparente |
| `/status` confundía outages y JSON inválido con migración ausente | Separar `database_unavailable` de errores de tabla/columna inexistente | Unitarias simuladas; `inferenceVerified` permanece `false` |
| UPDATE directo permitía asociar una conversación propia a un proyecto ajeno | Nueva migración de policy con `USING` de propietario y `WITH CHECK` de proyecto propio o `null` | PostgreSQL 17: falla sin migración y pasa con ella |
| Variables públicas compiladas podían imponerse a los emuladores de integración | Overrides `SUPABASE_URL` y claves públicas de servidor tienen precedencia explícita | Unitarias de compatibilidad y prioridad; integración solo en loopback |

Las respuestas disponen de una región accesible `role="log"` con anuncios `polite`; las operaciones pendientes muestran estado y deshabilitan controles incompatibles.

## Validación

- `npm ci`, ESLint, TypeScript y unitarias de asistentes.
- `npm audit --audit-level=high`: cero vulnerabilidades en la revisión local.
- Integración contra el servidor Next.js compilado con Auth/PostgREST/RPC/Ollama sintéticos. Comprueba identidad verificada frente al usuario declarado en cookie, aislamiento de propietario y ámbito, límites y CRUD.
- PostgreSQL 17 desechable, sin red ni puertos publicados: migraciones, conservación de datos antiguos, RLS de conversaciones/mensajes/cuota, grants, inmutabilidad de ámbito, proyectos propios/ajenos y solicitudes 1–11.
- Comprobación local adicional con 20 claims simultáneos: 10 permitidos, 10 denegados y contador final 10. Esta prueba concurrente se ejecutó durante la auditoría; la suite SQL versionada comprueba secuencialmente el límite 10/11.
- Navegador a 375 y 1440 px: dashboard/asistentes, estados pendientes, borradores, separación y recuperación de historial.

El build local normal encontró un bloqueo de red hacia Google Fonts. Para las pruebas locales se compiló con webpack y la opción de pruebas de Next.js `NEXT_FONT_GOOGLE_MOCKED_RESPONSES`, usando fuentes ya almacenadas. Esa configuración temporal queda fuera del repositorio. El workflow mantiene el build normal y todas las comprobaciones; consultar el resultado correspondiente al **último commit** en el PR antes de aprobar.

## Límites y siguiente trabajo

- La auditoría comprueba código y entornos desechables. No certifica configuración, datos ni protección de contraseñas filtradas en producción.
- La nueva migración `20261027122157_enforce_assistant_project_ownership.sql` y la migración de ámbitos siguen pendientes de aplicación fuera de pruebas. Antes de aplicarlas, inspeccionar asociaciones previas, respaldo y rollback en ensayo. La policy no reescribe asociaciones inválidas preexistentes; puede rechazar sus actualizaciones hasta corregirlas o desvincularlas.
- Ninguna petición real a Ollama/Gemini/OpenAI: no se ha verificado inferencia, calidad de respuestas ni investigación reciente. Mantener el siguiente paso sujeto a configuración y autorización de ensayo.
- El historial muestra una ventana de 100 mensajes y 50 conversaciones por ámbito; la paginación completa queda pendiente. Los registros anteriores permanecen en la base de datos.
- La exclusión mutua evita carreras en una interfaz abierta. No proporciona idempotencia entre pestañas ni ante una respuesta HTTP perdida después del commit de base de datos. Recargar antes de reintentar un guardado incierto; una garantía más fuerte requiere identificador de petición persistente y pruebas adicionales.
- Las fuentes devueltas se muestran en la respuesta actual; todavía no se guardan como metadatos estructurados del intercambio.
