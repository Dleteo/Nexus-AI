# Nexus AI — entrega conjunta de cinco proyectos

**Fecha:** 28 de octubre de 2026 · **Rama:** `feat/career-portfolio-20261026` · **PR:** [#46](https://github.com/Dleteo/Nexus-AI/pull/46) (no fusionar).

Este avance es una entrega de documentación técnica integrada al producto y comprobaciones de navegación, **no un despliegue ni cinco nuevos backends**. Los cuatro laboratorios ya tenían servicios SQLite y pruebas; Codex había reforzado P0 y preparado entradas inertes para P1.

## Los cinco frentes en una sola entrega

| Proyecto | Nuevo caso de estudio | Evidencia y límites | Demo |
|---|---|---|---|
| Nexus AI Workspace | `/projects/nexus-ai` | Auth/RLS, rutas de servidor, asistentes con restricciones, CI. No SaaS comercial verificado. | `/assistant` (puede exigir sesión) |
| Nexus Commerce | `/projects/nexus-commerce` | Transacción SQLite, stock concurrente, pruebas Python/HTTP. Sin pagos ni backend público. | `/labs?lab=commerce` |
| Nexus Studio | `/projects/nexus-studio` | Revisiones, HTTP 409, restauración, exportación HTML. Sin publicación o colaboración real. | `/labs?lab=studio` |
| Nexus Monitor | `/projects/nexus-monitor` | Sondeos locales, fallos HTTP persistidos, p95 y alertas. No vigilancia 24/7. | `/labs?lab=monitor` |
| Nexus Software Factory | `/projects/nexus-software-factory` | Plan, revisión, plantilla fija, QA estática, ZIP y validaciones inertes. Sin ejecución ni IA autónoma. | `/labs?lab=factory` |

Los casos se muestran con contenido propio en **es, en, de, fr y pt**. Las evidencias enlazan al código de la rama del PR y el lector puede ver problema, decisiones, pruebas, aprendizaje, limitaciones y próximo paso. Los enlaces aparecen en las cinco tarjetas del portafolio y en cada demo de laboratorio. `/interview` ofrece una guía para defender los cinco proyectos sin atribuirse trabajo inexistente.

## Archivos

- `data/engineering-case-studies.ts` — contenido verificable de los cuatro laboratorios.
- `data/engineering-case-translations.ts` — traducciones manuales de los cuatro estudios.
- `data/case-studies.ts` y `data/localized-case-studies.ts` — integración con el caso Workspace ya existente.
- `components/career/EditorialPortfolio.tsx` — enlaces de casos en las cinco tarjetas.
- `components/labs/LabsWorkspace.tsx` — enlaces a evidencia técnica dentro de las demos.
- `app/projects/[slug]/page.tsx` — tema rojo/negro, breadcrumbs correctos y accesos a demos.
- `app/interview/page.tsx` — recorrido de entrevistas centrado en cinco módulos.
- `scripts/browser_qa.py` — cinco proyectos en cinco idiomas, navegación y entrevistas.

## Comprobación y restricciones

En GitHub Actions deben pasar `npm run lint`, TypeScript, build, suites de servicios, smoke y browser QA. **El verde sólo es válido si el SHA corresponde al último HEAD de la rama**; revisar la corrida después de cada commit.

**P1 sigue bloqueada:** ninguna vista de proyecto o caso de estudio implica que un sandbox seguro esté habilitado. No ejecutar código generado en Next.js ni en el host. Mantener costo obligatorio $0, repositorio bajo control del propietario, PR abierto, sin despliegues ni merge.

## Nueva entrega de interacción (28 de octubre)

Sin tocar los backends ni el sandbox de Codex se añadió una nueva capa **offline / sin APIs de pago**:

- **Commerce:** botón `Export demo orders CSV`; líneas, totales y origen con etiqueta explícita de simulación; no incluye clientes ni afirma pagos.
- **Studio:** botón `Export blocks JSON`; documento de bloques validado con texto literal, revisión SQLite solo si coincide con el estado guardado y ninguna ejecución de HTML.
- **Monitor:** botón `Export manual samples CSV`; resultados y latencias acotados, con identificador de muestras manuales (no disponibilidad continua).
- **Factory:** `Export review audit Markdown` en modo SQLite, con eventos, QA estática y advertencia permanente de ejecución `NOT RUN`.
- **Workspace y los otros cuatro:** guía de entrevista interactiva en **5 idiomas** dentro de cada caso de estudio, con revisión manual de cuatro temas y exportación de notas `.md`. Marcar un tema no ejecuta pruebas.

Archivos de implementación: `lib/labs-exports.mjs`, `lib/labs-exports.d.mts`, `lib/interview-prep.mjs`, `lib/interview-prep.d.mts`, `components/career/InterviewReviewChecklist.tsx`, y cambios en `LabsWorkspace.tsx` y las páginas de casos. Las pruebas son `scripts/labs_exports_qa.mjs`, `scripts/interview_prep_qa.mjs` y cobertura adicional en `scripts/browser_qa.py`; se incluyeron en GitHub Actions. **Comprobar el CI del commit final por SHA antes de declararlo validado.**

Estas son exportaciones de datos visibles y notas personales, no informes de auditoría independientes. No se ha habilitado ejecutar código ajeno ni instalado un modelo de IA.

## Fase funcional: cinco mejoras adicionales (28 de octubre)

Esta fase agrega interacción real sin habilitar servicios externos, pagos ni código generado ejecutable:

1. **Commerce**: botones para aumentar y disminuir las cantidades del carrito dentro del stock disponible. `setCartQuantity` rechaza cantidades fraccionarias, negativas, productos desconocidos e inventarios inconsistentes; no cambia transacciones del backend.
2. **Studio**: importar únicamente un documento JSON con formato `nexus-studio-document` v1. Antes de cambiar bloques, el usuario ve una vista previa validada y decide si reemplaza el editor. Hay límite de archivo, IDs únicos, esquema restringido y Undo. En SQLite importa como **cambios sin guardar**, no como revisión falsamente persistida.
3. **Monitor**: analizar de forma transparente el número de rachas consecutivas de fallos, racha actual, máxima y muestras lentas, calculado solamente sobre muestras manuales; **no mide disponibilidad continua**.
4. **Factory**: tablero de trabajos SQLite que permite filtrar por `proposed/approved/built` y buscar solicitudes sin mutar ni ejecutar nada. Las aprobaciones, ZIP y pruebas del backend mantienen los límites de Codex.
5. **Nexus AI Workspace / portafolio**: desafío interactivo de arquitectura en las páginas de los cinco casos de estudio, en español, inglés, alemán, francés y portugués. El ejercicio distingue capacidades reales de funciones futuras, sin fingir certificación ni prueba ejecutada.

Código puro verificable: `lib/labs-demo-tools.mjs` y `scripts/labs_demo_tools_qa.mjs`. Interfaz: `components/labs/LabsWorkspace.tsx`, `components/career/ArchitectureChallenge.tsx` y `app/projects/[slug]/page.tsx`. Regresiones de navegador ampliadas en `scripts/browser_qa.py`. El CI ejecuta tests unitarios, tipos, build, pruebas de los cuatro SQLite, las cinco traducciones y navegador.

**Seguridad**: la importación trata texto de bloques como datos; no evalúa JS ni ejecuta HTML. Factory no ejecuta código generado y el sandbox P1 sigue desactivado. Ningún control representa pagos, monitorización 24/7 o inferencia autónoma.

**Codex** debe continuar desde el HEAD y el CI verde exacto, no reimplementar estas mejoras. La tarea difícil pendiente sigue siendo el aislamiento P1, seguido de diff con segunda aprobación P2 e IA local optativa P3. No modificar `main`, servicios de producción o proveedores sin permiso.

## Fase de explicación técnica y análisis comparativo (28 de octubre)

**Entrega funcional en los cinco frentes, sin cambiar backends ni proveedores:**

- **Workspace:** en `/interview` se pueden comparar dos de los cinco proyectos, leyendo del caso de estudio las tecnologías, el problema real, una decisión de arquitectura y una limitación. Sin rankings inventados ni métricas simuladas de rendimiento.
- **Commerce:** desglose del carrito antes de confirmar: unidades, precio unitario, subtotal por línea y total calculado en centavos enteros, validando cantidades y stock. **Es una estimación del catálogo**, sin impuestos, envíos ni pagos.
- **Studio:** revisión de contenido del documento: total de bloques y palabras, bloques vacíos, jerarquía de encabezados y etiquetas de botones largas. Las reglas son heurísticas estáticas; **no constituyen certificación de accesibilidad**.
- **Monitor:** selector de últimas 5/10/30/100 o todas las muestras cargadas, con éxito observado y p95 de las solicitudes exitosas. Son **ventanas por número de sondeos manuales**, no minutos ni SLA.
- **Factory:** contadores de trabajos locales propuestos, aprobados, construidos y con QA estática aprobada, limitados a los registros cargados. Los contadores no activan ejecuciones, modelos ni PRs.

Archivos: `lib/labs-insights.mjs` + `lib/labs-insights.d.mts`, `scripts/labs_insights_qa.mjs`, `components/labs/LabsWorkspace.tsx`, `components/career/ProjectArchitectureCompare.tsx` y `app/interview/page.tsx`. CI y navegación se amplían en `.github/workflows/ci.yml` y `scripts/browser_qa.py`. Revisar el SHA exacto del PR y su CI para aceptar la entrega.

**Límites:** siguen intactos el bloqueo en producción, el modo gratuito/local, la propiedad del repositorio y el aislamiento P1 sin verificar. Ninguna métrica presentada acredita pagos, accesibilidad certificada, disponibilidad continua, inferencia de IA real o ejecución de código generado.

## Pulido de accesibilidad, móvil y navegación (28 de octubre)

**Fase de cierre visual y de usabilidad sin cambios de producción:**

- **Workspace / página principal:** el enlace de salto a contenido ahora apunta al landmark real; el menú móvil comunica \`aria-expanded\` y \`aria-controls\`, se cierra con Escape y devuelve el foco al botón. Se reforzaron los estados de foco, las áreas táctiles y la preferencia de movimiento reducido en CSS sin sustituir el retrato ni cambiar el tema editorial.
- **Commerce, Studio, Monitor y Software Factory:** la navegación entre laboratorios comunica selección con \`aria-pressed\`, vincula botones y panel activo mediante \`aria-controls\`, y permite ArrowRight/ArrowDown/ArrowLeft/ArrowUp, Home y End conservando URL compartible. Cada laboratorio tiene una **guía de tres pasos en es/en/de/fr/pt**, con limitaciones reales y sin funciones falsas.
- **CV:** textos secundarios más legibles en teléfonos, controles de idioma/regreso con áreas táctiles de 44 px y indicadores de foco de teclado. Los estilos se limitaron a \`@media screen\`, conservando el aspecto de impresión/PDF y la fotografía existente.
- **Casos de estudio:** al abrir una demo desde su caso de estudio se mantiene el idioma seleccionado; se prueban las 20 combinaciones (4 laboratorios × 5 idiomas).
- **Pruebas:** \`scripts/browser_qa.py\` verifica foco tras Escape, salto a contenido, controles de CV móvil, navegación de laboratorios con teclado, cinco guías traducidas y conservación de idioma al visitar las demos. Se mantienen las suites de TypeScript, HTTP/SQLite, CV, asistentes y visual responsive ya existentes.

**Seguridad y honestidad:** Studio/Commerce/Monitor/Factory mantienen sus capacidades y límites descritos, Factory P1 permanece desactivada, no se ejecuta código desconocido, no hay pagos, sandbox ni inferencia real nueva. No se instalaron proveedores de IA ni servicios de pago. El PR debe continuar abierto.

**Validación:** antes de reportar éxito, comprobar que la ejecución CI terminada corresponde al SHA HEAD actual de \`feat/career-portfolio-20261026\`. No reclamar una puntuación formal de accesibilidad WCAG: esta fase verifica interacciones concretas, pero no sustituye una auditoría completa con lectores de pantalla.

## Auditoría visual y accesibilidad de los cinco frentes — 28 de octubre

**Diagnóstico medible:** los CTA principales de la portada y de descarga del CV utilizaban texto blanco sobre rojo brillante (aprox. **4,1:1**, por debajo de 4,5:1 para texto normal en WCAG AA). Se cambió el texto a tono oscuro `#120a0d` conservando el fondo rojo y el diseño. Chromium comprueba el contraste de los colores renderizados.

**Nueva prueba automática:** `scripts/visual_accessibility_qa.py`, ejecutada en el CI después de las pruebas funcionales:

- Capturas a 375 px de portada, CV, Commerce, Studio, Monitor, Factory, caso de estudio y entrevistas; portada y CV también a 320 px.
- Comprobación de ausencia de scroll horizontal y foco visible para el enlace de salto al contenido.
- Contraste de los dos CTA principales calculado mediante estilos de Chromium (mínimo 4,5:1).
- Respeto de `prefers-reduced-motion` en la transición de las tarjetas.
- Acciones de CV y selectores de laboratorio con área táctil de al menos 44 px de alto.
- Capturas incluidas en `qa-screenshots/` y publicadas en el artefacto `nexus-qa-screenshots` para revisión visual posterior.

**Alcance:** auditoría automática seleccionada, **no certificación WCAG**, evaluación con lector de pantalla ni cobertura exhaustiva de colores o interacciones. No se cambió la ejecución P1, producción ni servicios externos.
## Preparación de la experiencia del reclutador — asistente de contacto

**Problema detectado:** el asistente público de contacto seguía describiendo como principales los proyectos antiguos Nexus Foundation, Task Tracker y Hangman, aunque el portafolio ya destaca Workspace, Commerce, Studio, Monitor y Factory. Además, la pregunta «Nexus Technical» podía quedar clasificada como consulta general de proyectos por contener «Nexus».

**Correcciones:**
- `components/career/PortfolioContactChat.tsx`: reemplaza las respuestas de proyectos por las cinco demostraciones presentes, en es/en/de/fr/pt, con límites concretos. Al seleccionar «Proyectos/Projects/Projekte/Projets/Projetos», muestra cinco enlaces a sus casos de estudio con el idioma conservado.
- La clasificación de Nexus Technical tiene prioridad sobre el término genérico Nexus; el asunto técnico informa que necesita inicio de sesión y motor configurado, sin inventar inferencia real.
- El tema de la respuesta se conserva como estado explícito para no confundir la traducción del botón con la detección de intenciones. El formulario de correo anuncia `aria-controls` y tiene un grupo etiquetado. No se envía correo automáticamente.
- `scripts/browser_qa.py`: pruebas sobre las cinco páginas, enlaces exactos, preguntas técnicas escritas y apertura/cierre accesible del formulario de correo.

**Límites:** respuestas por reglas sobre información del portafolio, no un LLM propio entrenado. Sin servicios externos, cambios de identidad pública ni operaciones de correo enviadas por servidor. El CI del HEAD actual debe completar todas las pruebas antes de declarar la entrega aprobada.
## Próxima prioridad técnica

Verificar el CI del SHA final; realizar revisión humana del diseño en los cinco idiomas; cuando exista entorno Linux de prueba dedicado, validar efectivamente el aislamiento P1 según `docs/FACTORY_SANDBOX_P1.md`. P2 (diferencias revisables) y P3 (IA local opcional) continúan sin iniciarse.
