# Nexus AI

Nexus AI is a portfolio project built with Next.js, React, TypeScript, Tailwind CSS, Supabase, and a server-side AI provider. It demonstrates a practical web application with authentication, user-owned data, an AI assistant, and documented security boundaries.

## Implemented features

- Responsive portfolio landing page with reusable, typed UI components.
- Certificate and training section with credential-type filters, verification links where available, and a transparent distinction between course completions and attendance certificates.
- Email/password registration and sign-in, sign-out, and email-based password recovery.
- Server-managed HTTP-only session cookie and a protected dashboard.
- User-owned project creation, editing, archiving, restoration, and deletion, backed by Supabase Postgres and row-level security.
- AI Assistant with modes for Copilot, planning, debugging, learning, and interview practice.
- Persistent assistant conversations, message history, and a per-user daily request limit.
- Two workspaces: **Nexus Portfolio** (advice and draft improvements; no autonomous deployment) and **Nexus Technical** (hardware, software, programming, defensive security).\n- Explicit model backends: local Ollama, Gemini, or OpenAI. API keys remain server-side; local Ollama runs only on server loopback.\n- Optional web-grounded research for hosted providers; local Ollama has no built-in live web search.
- GitHub Actions CI for ESLint, TypeScript, and production builds.

## Tech stack

- Next.js App Router and React
- TypeScript and Tailwind CSS
- Supabase Auth and PostgreSQL
- Server-side Gemini or OpenAI API integration
- ESLint and GitHub Actions

## Local setup

Requirements: Node.js 22 or later and npm.

1. Install dependencies:

   ```bash
   npm ci
   ```

2. Copy `.env.example` to `.env.local`. In PowerShell, use:

   ```powershell
   Copy-Item .env.example .env.local
   ```

3. Fill in the environment variables in `.env.local`:

   - `NEXT_PUBLIC_SUPABASE_URL`: your Supabase project URL.
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: the project's publishable key.
   - `NEXT_PUBLIC_SITE_URL`: `http://localhost:3000` for local development.
   - `SUPABASE_SECRET_KEY`: a Supabase secret key used only by server-side assistant endpoints. Never prefix it with `NEXT_PUBLIC_`.
   - `AI_PROVIDER=gemini` and `GEMINI_API_KEY` for Gemini. `GEMINI_MODEL` defaults to `gemini-3.5-flash-lite`.
   - To use OpenAI instead, set `AI_PROVIDER=openai` and provide `OPENAI_API_KEY`; choose `OPENAI_MODEL` as appropriate.

4. Configure Supabase Auth Site URL and allowed redirect URLs, email confirmation, and password recovery as described in [docs/supabase-setup.md](docs/supabase-setup.md).

5. Start the development server:

   ```bash
   npm run dev
   ```

6. Open `http://localhost:3000`.

The current Supabase project used during development has its schema and RLS policies configured. If you connect a different Supabase project, apply the tracked SQL migrations in timestamp order and update the environment variables.

## Deployment

For the production release process, environment variables, Supabase Auth redirect configuration, preview/production separation, smoke tests, and security checklist, follow the [production deployment guide](docs/deployment.md). Keep production credentials out of GitHub and do not treat local CI success as proof that the live deployment has been verified.

## Main routes

| Route | Purpose |
| --- | --- |
| `/` | Public portfolio, projects, and certificates |
| `/register` | Create an account |
| `/login` | Sign in |
| `/forgot-password` | Request a recovery email |
| `/reset-password` | Set a new password from a recovery link |
| `/dashboard` | Manage personal projects |
| `/assistant` | AI assistant and conversation history |

## Validate changes

Run all three checks before opening a pull request:

```bash
npm run lint
npx tsc --noEmit
npm run build
```

GitHub Actions runs the same checks for pull requests and pushes to `main`.

## Security notes

- Never commit `.env.local`, passwords, access tokens, or secret/service-role keys.
- Publishable keys may use the `NEXT_PUBLIC_` prefix. Supabase secret keys and AI provider API keys must remain server-only.
- Assistant conversations and project records use user-scoped access controls; keep row-level security enabled.
- The assistant enforces a per-user daily request limit. Keep provider keys and credentials out of prompts, source control, and client-side code.
- Email recovery redirects must match the URLs allowed in Supabase Auth settings.
- Production deployment and production-domain configuration are separate steps; this repository's local setup does not mean the app has been deployed.

## Portfolio accuracy and case study

Nexus AI is the principal featured case study for an aspiring Junior Web Developer. The portfolio distinguishes browser skills practiced directly from React/Next.js/Supabase features implemented using AI-assisted development. See [docs/portfolio-evidence.md](docs/portfolio-evidence.md) for the evidence and future visual redesign acceptance criteria. Nexus Foundation is described separately as experimental research; the hosted assistant uses an external provider, not that unfinished model. No paid developer experience, customers, published live product or unverified credentials are claimed.


## Model independence, privacy and ownership

The GitHub repository and application source are controlled by the repository owner. The local research repository **Nexus Foundation** is separate and is not the model behind Nexus AI. An external model provider retains ownership and licensing of its **own** model and infrastructure; using its API does not confer ownership of those model weights.

**Nexus Portfolio** provides suggestions, draft text and planning only. It cannot autonomously edit the repository, merge a pull request or deploy production. Any future write-capable GitHub connector must require explicit, scoped approval and undergo review.

**Nexus Technical** handles hardware diagnostics, software, programming, and **defensive** cybersecurity. Current vulnerability claims, firmware compatibility and 2026 software releases require evidence from the relevant vendor or independent advisories. Local models can be inaccurate and cannot browse the web through the current Ollama integration.

Conversations are stored in Supabase and sent to the selected model provider for inference. When `AI_PROVIDER=ollama` is used, model inference is local to the application server; Supabase storage still follows its own separate hosting policy. Do not submit API tokens, passwords or private code to a third-party provider without appropriate authorization. Do not train Nexus Foundation on private conversations or third-party outputs without consent and a licensing review.

**Important:** the technical and portfolio workspaces are separated by labeled conversation records, not by independent database partitions or encryption keys. This is organizational separation with request validation, **not** a claim of cryptographic isolation. Protect account credentials, Supabase RLS and deployment secrets.

Read provider terms and verify model license, free-tier restrictions and quotas before deploying. No live, paid provider account is provisioned by this repository.


### Required database migration before using the updated assistants

The portfolio/technical split now uses a dedicated, immutable `scope` column, rather than inferring the workspace from the conversation title. Apply `supabase/migrations/20261027040000_assistant_workspace_scope.sql` to the correct Supabase project **before** deploying this code. The migration preserves existing records, classifying older unprefixed chats as technical and prefixed Nexus Portfolio chats as portfolio. Review the database backup and check RLS, indexes and the restricted RPC privileges in a staging database first. The code will not operate against a database missing the scope field. This change has been committed to GitHub; it has **not** been applied to your live Supabase project.


### Safe AI provider readiness checks

Authenticated users can request `GET /api/assistant/status` to see whether the two assistants have an explicit provider configured and whether the conversation table exposes the `scope` column. This endpoint **does not** make model calls, consume a paid API quota, reveal keys or assert that a model is reachable. The `inferenceVerified: false` field is deliberate.

For a live model check, configure the engine on **your own test environment** and use a separate test account, then:
1. Apply and verify the reviewed scope migration on a staging database first, never an unreviewed production migration.
2. Configure `AI_PORTFOLIO_PROVIDER` and `AI_TECHNICAL_PROVIDER`; for Ollama, run the server and model on the same host as Next.js.
3. Check the authenticated status endpoint and separately send a short prompt to each assistant. Confirm the response, timeout, storage and daily limits.
4. Check one current technical question with trusted sources; the local Ollama engine has no native web search, while Gemini/OpenAI web search requires provider support and may incur quota or charges.
5. Do not claim a passing automated/mock test proves third-party inference or factual accuracy.

The `scope` database migration is not applied by reading this repository or calling the status endpoint. Production remains unchanged until an authorized deployment.

### Optional read-only model connectivity check

After installing the selected local Ollama model, run `node scripts/check-provider.mjs` with your local environment variables exported. It checks only the local Ollama model list. For external Gemini/OpenAI providers it verifies the presence of configuration without contacting the cloud; set `NEXUS_CHECK_CLOUD=1` to explicitly enable read-only cloud model-list checks. No prompts or conversations are sent by this script and it does **not** establish that generation will succeed. No keys belong in Git or CI logs.
