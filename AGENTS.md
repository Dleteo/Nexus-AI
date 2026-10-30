<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->


## Nexus AI project continuity

**Before modifying this repository, read [docs/CODEX_HANDOFF.md](docs/CODEX_HANDOFF.md).** It records the current architecture, verified CI status, unfinished work, security constraints and next tasks. Recheck GitHub state because the handoff can become outdated.

- For difficult Nexus Labs/Factory work, **read [docs/CODEX_NEXT_PHASE.md](docs/CODEX_NEXT_PHASE.md)** and follow its P0/P1 gates before introducing any executable code or external agent.
- Work on branch `feat/career-portfolio-20261026` and keep [PR #46](https://github.com/Dleteo/Nexus-AI/pull/46) open. **No merge, production deployment, production Supabase migration, spending or external service configuration without explicit owner approval.**
- Keep **Nexus Portfolio** (portfolio/CV/projects/interviews) and **Nexus Technical** (hardware/software/programming/defensive cybersecurity) functionally separate but under one Nexus AI visual identity.
- Keep provider integration swappable (Ollama local / Gemini / OpenAI) and API secrets server-only. Never imply synthetic integration tests prove live model inference.
- Maintain real, defensible portfolio data, five languages and the matching downloadable CV PDFs; do not invent employers, contact links, credentials or coding hours.
- Prefer small, readable TypeScript changes and regression tests. Run lint, typecheck, build and relevant CI; do not claim success before checking the **latest commit**.
- Never inspect or publish private repository content or use private conversation data to train a model without specific approval and a licensing/privacy review.
