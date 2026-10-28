# Nexus AI — mapa del repositorio y mantenimiento

Actualizado: 2026-10-28. Documento de navegación, **no autorización para eliminar** código.

## Punto de entrada
- `README.md`: instalación local y descripción del producto.
- `AGENTS.md`: normas que debe leer cualquier agente.
- `docs/CODEX_HANDOFF.md`: traspaso funcional.
- `docs/CONTINUIDAD_CODEX_2026-10-28.md`: trabajo de seguridad P0/P1 que ya hizo Codex.
- `docs/FACTORY_SANDBOX_P1.md`: controles sin verificar; ejecución desactivada.
- `docs/AVANCE_CINCO_PROYECTOS_2026-10-28.md`: entregas de UX/casos de estudio.
- [Issue #48](https://github.com/Dleteo/Nexus-AI/issues/48): revisión de consistencia visual y limpieza del repositorio.

## Código organizado por responsabilidad
| Ruta | Responsabilidad |
| --- | --- |
| `app/[lang]/`, `app/page.tsx`, `app/resume/` | Página principal y CV en cinco idiomas |
| `app/projects/[slug]/` | Casos de estudio, incluidos ejercicios antiguos |
| `components/career/` | Portafolio editorial, contacto, preparación de entrevistas |
| `components/labs/`, `app/labs/` | UI de cuatro Labs |
| `labs/` | Backends Python locales y sus pruebas |
| `lib/labs-*.mjs` | Lógica de Labs y exportación |
| `data/` | Datos profesionales, proyectos y traducciones |
| `app/api/`, `lib/assistant-*.ts` | APIs y asistentes sujetos a permisos |
| `scripts/` | QA, pruebas de navegador, HTTP y preflight |
| `supabase/migrations/`, `tests/db/` | Migraciones y pruebas SQL sin aplicarlas a producción |
| `.github/workflows/ci.yml` | Pruebas de PR y artefactos de revisión |

## Reglas de limpieza
1. No borrar ramas, commits, issues, proyectos antiguos ni repositorios por parecer redundantes. Comparar referencias y uso antes de proponer cualquier eliminación.
2. No reimplementar P0, snapshots, ZIP ni backend de los cuatro Labs; leer la nota de continuidad.
3. Mantener los cinco idiomas, CV e identidad editorial rojo/negro en las páginas **públicas de portafolio**. Los espacios privados pueden tener sus propias superficies funcionales, pero su navegación debe ser coherente.
4. Revisar estilos globales heredados (dorado) antes de modificarlos: pueden alimentar dashboard/asistentes. No sustituirlos en masa.
5. Las páginas de ejercicios Task Tracker y Hangman siguen siendo casos históricos, no nuevos proyectos destacados. Mantener sus enlaces.
6. Antes de declarar cualquier cambio estable: comprobar lint, TypeScript, build, navegador, CV y CI **del SHA exacto**. Guardar capturas reales; no afirmar revisión visual sólo por pasar tests.

## Trabajo pendiente
- Comparación visual real 320/375/768/1440 px y navegación de todas las rutas públicas.
- Revisar espaciado, interacción y contraste de header/contacto/footer con capturas.
- Catalogar duplicados reales mediante búsqueda de imports y vínculos, antes de borrar archivos.
- P1: runtime rootless dedicado con evidencia de aislamiento; no habilitar ejecución.
- Mantener PR #46 sin merge y sin deploy. Coste obligatorio $0.
