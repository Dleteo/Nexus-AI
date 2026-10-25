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
- Gemini provider support, with optional OpenAI provider configuration; provider API keys remain server-side.
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
