# Traspaso para Codex — Nexus AI

> **Diseño del 29/10/2026:** portada canónica, retrato de mayor resolución con fondo transparente y cinco proyectos con presentación e identidad propias. Las demos individuales tienen navegación compacta y conservan sus controles. Ver [DISENO_CINCO_PROYECTOS_2026-10-29.md](DISENO_CINCO_PROYECTOS_2026-10-29.md) para alcance y validación. El PR #46 continúa abierto; esta entrega no publica ni habilita ejecución de Factory. Consultar la CI del HEAD actual.

> **Actualización del 28/10/2026:** los cinco proyectos destacados (Workspace, Commerce, Studio, Monitor y Factory) ya cuentan con casos de estudio accesibles desde el portafolio, en cinco idiomas, y una guía de entrevista centrada en esos proyectos. Ver [AVANCE_CINCO_PROYECTOS_2026-10-28.md](AVANCE_CINCO_PROYECTOS_2026-10-28.md). Son mejoras de evidencia y UX; no habilitan ejecución P1 ni IA autónoma. Consultar CI del HEAD actual.

**Fecha de referencia:** 28 de octubre de 2026.
**Repositorio:** `Dleteo/Nexus-AI`
**Rama de trabajo:** `feat/career-portfolio-20261026`
**Pull request:** [#46](https://github.com/Dleteo/Nexus-AI/pull/46) hacia `main`.
**Último punto comprobado al retomar esta continuación:** [CI #466 verde](https://github.com/Dleteo/Nexus-AI/actions/runs/40686052125) en `f7f285febd63f0a4b1ec410195736ea877c24743`. Consulta siempre el SHA actual del PR y su CI; esta referencia no valida cambios posteriores. La [hoja de continuidad](CONTINUIDAD_CODEX_2026-10-28.md) separa lo entregado, lo que está en curso y lo pendiente.


## PRIORIDAD ACTUAL PARA CODEX (28 OCT 2026)

**Continuación P0/P1 del 28 de octubre:** leer [la hoja de continuidad en español](CONTINUIDAD_CODEX_2026-10-28.md), [auditoría P0](LABS_SECURITY_P0_2026-10-28.md) y [diseño P1](FACTORY_SANDBOX_P1.md). Se han reforzado las cuatro APIs, el runner confiable, SQLite y ZIP, con nuevas regresiones. La ejecución de código generado sigue desactivada; el sandbox P1 no está verificado. Comprobar CI del HEAD actual antes de revisión; no reutilizar el verde inicial ni reconstruir lo ya entregado.

**Preparación P1 posterior:** ya existen snapshots/ZIP inertes validados en memoria, digest del preview de tres fuentes y estado `execution.not_run` en API/UI (cinco idiomas), separado de QA estática. El preflight observa metadata de cgroups/UID/socket sin acreditar aislamiento. La suite Factory incluye las nuevas regresiones automáticamente. No volver a implementar estas piezas ni interpretar sus tests como sandbox operativo; runtime y pruebas de aislamiento reales siguen pendientes, igual que P2/P3.

**Última corrección:** Monitor persiste también respuestas HTTP malformadas, truncadas, desconectadas o con status inválido como checks fallidos, alimentando historial/alertas. Hay regresión real con receptor loopback efímero; no se añade escaneo ni servicio. La [nota para ChatGPT](CONTINUIDAD_CODEX_2026-10-28.md) contiene commits, pruebas y los bloqueos pendientes; se cerró el alcance cuando el propietario indicó 10% de uso restante.

**Leer primero [docs/CODEX_NEXT_PHASE.md](CODEX_NEXT_PHASE.md).** Es el traspaso actualizado para el trabajo más difícil: auditoría de seguridad P0, sandbox real P1, generación de diffs/PR con aprobación humana P2, agentes Ollama opcionales P3 y profesionalización de los cuatro Labs P4. No reconstruir lo ya implementado.

Los cuatro Labs ya tienen backend SQLite local opcional, API Next.js y pruebas; Factory también tiene preview de archivos, manifiesto SHA-256 y verificación de ZIP al descargar. **No hay agente autónomo, ejecución de código generado ni autorización para tocar producción**. El CI del SHA actual debe comprobarse al comenzar.

## Encargo

Continúa el desarrollo de **Nexus AI** como producto profesional y portafolio para puestos de desarrollador junior. Da prioridad a **seguridad, funcionamiento real, rendimiento, accesibilidad y mantenimiento**. El usuario eligió un aspecto **oscuro, sobrio y tecnológico, con azul como acento**, evitando diseños recargados o de videojuegos.

**Trabaja sobre la rama y PR anteriores. No hagas merge, despliegue, compras, cambios de privacidad de los repositorios, conexiones con servicios externos ni migraciones a producción sin autorización explícita.** Haz commits pequeños y comprensibles, describe qué comprobaste y deja el PR disponible para revisión humana. No afirmes que algo pasó las pruebas hasta consultar sus resultados.

## Arquitectura que hay que conservar

- **Un solo producto e identidad visual**, **dos asistentes diferenciados**:
  - **Nexus Portfolio:** ayuda con CV, casos de estudio, proyectos, entrevistas y mejoras al portafolio. Por ahora **solo asesora**: no tiene permiso para escribir en GitHub, ejecutar código, fusionar PR ni publicar.
  - **Nexus Technical:** consultas de hardware, software, programación y ciberseguridad **defensiva**; puede solicitar fuentes recientes de 2026 cuando el proveedor las admita. No debe fingir navegación, ejecución de programas o confirmación de vulnerabilidades.
- Proveedores intercambiables mediante `AI_PROVIDER`, `AI_PORTFOLIO_PROVIDER` y `AI_TECHNICAL_PROVIDER`: Ollama **local** (sin coste por petición al proveedor, pero requiere equipo/energía y no ofrece búsqueda web incorporada), Gemini u OpenAI (costes, cuotas y términos propios). Nunca exponer API keys al cliente, logs o repositorio.
- Next.js 16, React 19, TypeScript, Tailwind 4, Supabase Auth/Postgres/RLS. **Lee primero las instrucciones originales de Next.js incluidas en `AGENTS.md`.**
- Las conversaciones se separan mediante `assistant_conversations.scope` (`portfolio` o `technical`), que la migración vuelve inmutable. Las conversaciones antiguas deben conservarse.
- El portafolio incluye español, inglés, alemán, francés y portugués, con **CV PDF acorde con el idioma**; preservar esos enlaces y los datos profesionales reales.

## Estado verificado y límites

**Verificado en CI de la rama:** lint, tipos, build de producción, migraciones SQL sobre PostgreSQL desechable, pruebas HTTP, cinco CV, responsive/browser QA y prueba de integración de las rutas reales de Next.js contra **Supabase/Ollama simulados**.

**NO está verificado ni hecho:** generación real con Ollama/Gemini/OpenAI, pertinencia de respuestas sobre incidentes actuales de 2026, despliegue público, aplicación de la nueva migración a Supabase de producción. En una revisión anterior se observó desactivada la protección de contraseñas filtradas en Supabase Auth; vuelve a comprobarlo antes de lanzar.

**Privacidad y propiedad:** el código del repositorio es del titular, no el modelo externo. `Dleteo/Nexus-Foundation` es un repositorio privado de investigación, **no** la implementación actual del motor conversacional. No leer ni publicar código privado, ni usar conversaciones/respuestas de terceros para entrenar modelos sin consentimiento y una revisión de licencias/condiciones.

## Siguiente orden de trabajo (por prioridad)

**Actualización de auditoría del 27 de octubre:** ver [hallazgos, correcciones y pruebas](assistant-audit-2026-10-27.md). Se han añadido regresiones de API, navegador y RLS, y la migración local `20261027122157_enforce_assistant_project_ownership.sql` para impedir asociaciones a proyectos ajenos. **No se ha aplicado a producción.** El historial recupera los últimos 100 mensajes, con desempate de pregunta/respuesta, y hasta 50 conversaciones por ámbito. La UI bloquea cambios de hilo durante operaciones pendientes. Los overrides de Supabase de servidor tienen prioridad sobre `NEXT_PUBLIC_*` para aislar las pruebas. Revisar CI del último commit; permanecen pendientes la inferencia real autorizada, el ensayo de migraciones y la idempotencia entre pestañas/reintentos inciertos.

1. **Auditoría funcional/seguridad del chat.** Revisar `app/api/assistant/chat/route.ts`, `lib/ai-runtime.ts`, `lib/assistant-expertise.ts`, `lib/assistant-sources.ts`, las rutas de conversaciones y `components/assistant/AssistantApp.tsx`. Comprobar separación de ámbito/usuario, manejo de errores y timeouts, mensajes duplicados o perdidos, persistencia, límites de uso, respuestas largas, accesibilidad y estados de carga. Corregir con código claro y pruebas.
2. **Pruebas de inferencia real, solo con autorización/configuración de ensayo.** El script `scripts/check-provider.mjs` solo verifica conectividad/configuración; `scripts/assistant_integration_qa.mjs` utiliza modelos simulados. No declarar `inferenceVerified=true` sin una petición y respuesta auténticas. Preparar un conjunto pequeño de consultas de hardware, software, ciberseguridad defensiva y programación, con criterios de exactitud y fuentes oficiales para asuntos recientes; etiquetar lo no verificable.
3. **Migración de base de datos de forma segura.** `supabase/migrations/20261027040000_assistant_workspace_scope.sql` está versionada y probada con `tests/db/*`, pero **no aplicada a producción**. Evaluar en un entorno de ensayo independiente, respaldar/inspeccionar datos, verificar RLS, grants, RPC y rollback antes de solicitar autorización para ejecutar fuera de CI.
4. **Experiencia de usuario.** Mantener separados y fáciles de reconocer ambos asistentes en móvil/desktop, navegación con teclado y lector de pantalla, selección de idioma y descarga correcta del CV. No inventar correo, redes sociales, experiencia o estadísticas; hay **94 horas de formación documentadas**, NO 94 horas de programación.
5. **Solo después de lo anterior:** plantear una integración GitHub con mínimo privilegio para que Nexus Portfolio pueda **leer** archivos seleccionados; cualquier escritura requeriría propuesta en rama, vista previa, confirmación explícita, pruebas y revisión. Nada de despliegues automáticos ni ejecución de código del repositorio sin aislamiento.

## Mapa del código

- `app/api/assistant/chat/route.ts` — API de chat y proveedores.
- `app/api/assistant/status/route.ts` — solo estado de configuración; **no verifica inferencia real**.
- `app/api/assistant/conversations/**` — historial persistente y ámbito.
- `components/assistant/AssistantApp.tsx` y `AssistantWorkspacePicker.tsx` — interfaz.
- `lib/ai-runtime.ts`, `lib/assistant-scopes.ts`, `lib/assistant-expertise.ts`, `lib/assistant-sources.ts` — selección/seguridad de IA.
- `data/profile.ts`, `data/certifications.ts`, `data/site-languages.ts`, `data/case-studies.ts` — datos y enlaces públicos, traducciones y proyectos.
- `supabase/migrations/` — migraciones; `tests/db/` — pruebas de aislamiento/RLS.
- `scripts/assistant_unit_qa.mjs`, `scripts/assistant_integration_qa.mjs`, `scripts/browser_qa.py`, `scripts/workspace_qa.py`, `scripts/pdf_qa.py` — pruebas existentes.
- `.github/workflows/ci.yml` y `docs/deployment.md` — CI y despliegue.

## Comprobaciones mínimas y criterio de entrega

```bash
npm ci
npm run lint
npx tsc --noEmit
npm run build
node scripts/assistant_unit_qa.mjs
```

Las pruebas con Supabase/PostgreSQL simulado, CV y navegador se ejecutan en GitHub Actions según `.github/workflows/ci.yml`. Para cambios relevantes, añadir tests de regresión, esperar CI **del último commit**, y reportar fallos no resueltos sin ocultarlos.

**Definición de terminado para cada cambio:** código simple y tipado, tests pertinentes, sin secretos, sin fuga de datos entre ámbitos, aspecto profesional, compatibilidad móvil y con los cinco idiomas cuando aplique, resultado de CI revisado, y PR abierto para que el dueño decida.

---

**Nota al usuario:** este archivo es el contexto de continuidad para Codex; **no inicia automáticamente un agente ni autoriza despliegues**. Abre Codex sobre `Dleteo/Nexus-AI`, selecciona la rama indicada y pídele que lea `AGENTS.md` y este documento antes de proponer o aplicar cambios.
