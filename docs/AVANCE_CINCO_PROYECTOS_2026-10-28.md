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

## Próxima prioridad técnica

Verificar el CI del SHA final; realizar revisión humana del diseño en los cinco idiomas; cuando exista entorno Linux de prueba dedicado, validar efectivamente el aislamiento P1 según `docs/FACTORY_SANDBOX_P1.md`. P2 (diferencias revisables) y P3 (IA local opcional) continúan sin iniciarse.
