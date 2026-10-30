# Public portfolio hosting

The owner authorized public publication on 2026-10-30. The Sites project identity is tracked in `.openai/hosting.json`; reuse that ID for future publications.

- Original Next.js development: `npm run dev`.
- Original production verification: `npm run build`.
- Sites / Cloudflare Workers artifact: `npm run build:sites` (Vinext adapter).
- Local artifact preview: `npx wrangler dev --config dist/server/wrangler.json --local --ip 127.0.0.1 --port 3131`.
- Deployable archive keeps `.openai/hosting.json` at its root alongside `dist/server/` and `dist/client/`.

The public portfolio, certificates, five-language CV PDFs, project case studies and browser-local demos work without external secrets. AI inference and account services need their existing separate provider/auth configuration; publication does not configure or verify them. Local Python/SQLite backends and generated-code execution stay disabled in production.

GitHub remains the source repository. A GitHub push alone does not deploy this Sites publication: build, synchronize the exact commit to the existing Sites source repository, save and deploy its matching artifact using Sites. Never store temporary source credentials in files or Git.
