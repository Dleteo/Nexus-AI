# Diseño y navegación — 29 de octubre de 2026

Trabajo en `feat/career-portfolio-20261026`, dentro del PR #46 existente. Los repositorios anteriores se conservan por decisión del propietario.

## Resultado

- Una sola portada: `/portfolio` redirige al portafolio actual, con español por defecto y las otras cuatro opciones de idioma. Los enlaces de navegación y formación apuntan a las secciones actuales.
- Cinco presentaciones independientes, con espacio entre ellas y enlaces directos a su caso de estudio y demo disponible. Se retiró el anuncio repetido que volvía a agrupar los cuatro Labs debajo de las tarjetas.
- Workspace usa azul y superficies de trabajo; Commerce papel/verde y catálogo; Studio violeta y lienzo; Monitor cian y consola de mediciones; Factory ámbar y flujo de revisión. Cada caso de estudio conserva hechos, evidencias, actividades y navegación al CV.
- Las portadas son esquemas de interfaz etiquetados. Las vistas de las demos siguen reflejando sus datos reales; Monitor no inventa mediciones y Factory mantiene el estado de ejecución desactivada.
- Las rutas individuales `/labs/commerce`, `/labs/studio`, `/labs/monitor` y `/labs/factory` muestran un solo proyecto. Los otros proyectos están en un selector plegable. La navegación cliente monta el proyecto correspondiente, sin retener el estado de la ruta anterior.
- El retrato usa un recorte transparente de 1536 × 1024 derivado de la imagen del portafolio original. La procedencia y la edición de fondo están documentadas en `public/portfolio/PORTRAIT.md`. La portada y el CV dejan de usar la reconstrucción pequeña; se retira la máscara anterior que producía bordes blancos. El diseño apilado de tablet evita el solapamiento con el texto.
- Las fuentes se sirven desde el proyecto, con sus licencias OFL, para compilar sin peticiones a Google Fonts. Se conservan las familias y pesos.
- El enlace de salto al contenido muestra el foco inmediatamente. Studio mantiene selección visible y botones de edición legibles.

## Validación local

- ESLint sin errores ni advertencias; TypeScript y compilación de producción.
- Pruebas HTTP: páginas, redirecciones canónicas, rutas protegidas, CV y bloqueo de backends locales en producción.
- Suite completa de navegador: portada, controles de las cuatro demos, navegación, cinco casos en cinco idiomas, contacto y cambio entre proyectos.
- Auditoría visual de overflow, foco visible, contraste de botones, reducción de movimiento y controles táctiles; capturas a 320, 375, 768 y 1440 px.
- Cinco PDF de CV válidos y localizados.
- Pruebas existentes de asistentes, lógica de Labs, exportaciones, preparación de entrevistas y análisis local.

Las capturas son evidencia de revisión de diseño, no certificación de accesibilidad. Las pruebas con modelos simulados no acreditan inferencia real. La CI remota debe comprobarse por el SHA exacto antes de aprobar el PR.

## Continuidad

El PR sigue abierto y sin despliegue. P1 mantiene el aislamiento sin verificar y la ejecución desactivada; esta tarea no implementa P2/P3, configura proveedores ni aplica migraciones de producción. La nota anterior de P0/P1 conserva su función y sus límites.
