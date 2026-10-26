# Nexus One — unified public experience (October 2026)

## Objective

A single public, recruiter-friendly **experience** hosted by Nexus AI, with the ability to inspect code and documents from the creator's real GitHub projects. No private repository consolidation or AI-model fabrication is implied.

## Repository inventory inspected

| Repository | GitHub visibility | Handling |
| --- | --- | --- |
| Dleteo/Nexus-AI | Public | Primary application, source of portfolio, CV, Supabase-backed workspace and AI-provider integration. |
| Dleteo/Nexus-Foundation | Private | Independent original-Transformer research; document honestly, do not bundle private files or weights. Does not power the public AI assistant. |
| Dleteo/Nexus-Preview | Private | Deployment container and archive, not a separate model to merge into client source. Public demo link is an external preview with independent uptime. |
| Dleteo/Nexus-Backup | Private | Recovery archive, contains user documents and source packages. Do not expose, copy or link backup ZIP to public web. |

The public learning projects are linked by source, not silently merged: Encriptor; hangman-game; -To-Do-App-whit-JavaScript; First-page-responsiv; Calculator-responsiv; Crazy-Dices; and portfolio-. They remain independent historical work and preserve attribution, Git history and original demos.

## Implemented on branch feat/nexus-one-unified-2026

- `/nexus-one`: original responsive one-page experience with interactive core sculpture, source-linked project explorer, certification ledger, resume access, research status, and recruiter mode.
- Public navigator can route by keywords to verified page sections. **It is not a neural LLM**. Real general AI remains under the authenticated existing `/assistant` route and its existing quotas/security checks.
- Certification counts and training hours are derived from the existing documented `data/certifications.ts` rather than fabricated statistics.
- Public project manifest `data/nexus-one.ts` references eight GitHub repositories: Nexus AI and seven learning projects.
- Private sources, backups, corpora, personal documents, model checkpoints, secrets and third-party nonredistributable characters were not copied.

## Strict boundaries

No backend inference provider is switched. Supabase policies, login, database migrations, CV PDF, prior portfolio route and source histories are unmodified. The project is not a newly trained independent AI. Preview may have a different deployed feature set and should never be called live without checking its actual status. No production release should be claimed without deployment evidence.

## Before replacing the current homepage

1. Review UX, copy and design with the owner; confirm content is truthful.
2. Install dependencies with `npm ci`, run `npm run lint`, `npx tsc --noEmit`, `npm run build`.
3. Run existing smoke and browser QA, plus the new route's checks on mobile, tablet and desktop.
4. Verify CV PDF, each certificate image, Github links, auth redirects and external preview behavior.
5. Review WCAG focus states, no-WebGL requirement (none), reduced-motion, touch controls and responsiveness.
6. Keep this PR in draft until verified. Promote the tested Nexus One route to the homepage in a separate reviewed step.

## Future integration candidates

The separate command-center draft and avatar experiment are unverified and have conflicting UI directions. Compare selectively rather than automatically merging them. The local Ollama experimental branch is unrelated to the public portfolio release; keep it isolated. Nexus Foundation remains private until an explicit privacy/license/security review.
