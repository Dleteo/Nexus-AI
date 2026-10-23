# Supabase setup

Nexus AI uses Supabase Auth and PostgreSQL. User-owned project and conversation reads are scoped to the signed-in user. Row-level security (RLS) must remain enabled. The AI Assistant's server-side endpoints also use a **server-only Supabase secret key** for two privileged database functions that enforce request limits and save an exchange atomically. Never expose this key to browser code or commit it.

## 1. Environment variables

Project used during development: `https://hyrvilrthpyyrtcgthzq.supabase.co`.

In **Project Settings → API Keys**, copy the project's publishable key. Create `.env.local` in the project root (next to `package.json`) using `.env.example` as the template. The relevant variables are:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_REPLACE_WITH_YOUR_PROJECT_KEY
NEXT_PUBLIC_SITE_URL=http://localhost:3000
SUPABASE_SECRET_KEY=
AI_PROVIDER=gemini
GEMINI_API_KEY=
GEMINI_MODEL=gemini-3.5-flash-lite
```

- The publishable key starts with `sb_publishable_` and is intended for app use.
- `SUPABASE_SECRET_KEY` starts with `sb_secret_` and is for server-only code. Do not use a secret/service-role key as a publishable key; never name it `NEXT_PUBLIC_...`.
- Gemini is the default AI provider. Keep `GEMINI_API_KEY` server-side. To use OpenAI instead, set `AI_PROVIDER=openai` and supply `OPENAI_API_KEY`.
- Restart Next.js after changing environment variables.

## 2. Configure email authentication and redirects

In **Authentication → URL Configuration**:

- For local development, set **Site URL** to `http://localhost:3000`.
- Add `http://localhost:3000/**` to the allowed redirect URLs. You can add `http://localhost:3000/reset-password` explicitly instead of relying on a wildcard.
- Keep `NEXT_PUBLIC_SITE_URL=http://localhost:3000` in local `.env.local`. For production, use the exact HTTPS origin of the deployed app, then add that origin and its `/reset-password` URL to the allowed redirects.

In **Authentication → Providers → Email**, configure whether confirmation is required. If email confirmation is enabled, users need to confirm the address before signing in. Configure reliable SMTP/email delivery before production. Recovery should be tested with an account you control; don't share recovery links or tokens.

Official guide: [Supabase Auth redirect URLs](https://supabase.com/docs/guides/auth/redirect-urls).

## 3. Database schema and migrations

The repository tracks SQL migrations under `supabase/migrations/`:

- `20261023000000_create_projects.sql` — user-owned project data and RLS.
- `20261023130000_assistant_copilot_foundation.sql` — assistant conversations, messages, quota tracking, and privileged exchange storage.
- `20261023130001_index_assistant_foreign_keys.sql` — indexes for assistant table relationships.
- `20261023130002_lock_down_assistant_privileged_rpcs.sql` — restricts direct execution of privileged assistant RPCs and grants them to the server role.

These migrations have been applied to the connected development project. For a different project, apply them in timestamp order, confirm that every migration succeeds, and re-run the Supabase Security Advisor. Do not run destructive SQL to reset a project containing data you need to keep.

## 4. Verify account and assistant flows

From the project root, run:

```bash
npm ci
npm run lint
npx tsc --noEmit
npm run build
npm run dev
```

Then verify the following:

1. `/dashboard` redirects to sign-in when you're logged out.
2. Register with a test account, confirm the email if required, then sign in.
3. Request a password recovery email from `/forgot-password`, open the link, set a new password, and sign in with it.
4. Create and edit a project, refresh the page to confirm it persists, then archive and delete a test project.
5. Open `/assistant`, send a test prompt, and verify the conversation remains in history after reloading.
6. If available, test with a second test account to confirm it cannot see or alter another account's records.

## Security notes

- Session tokens use a server-set HTTP-only, SameSite=Lax cookie. Production requires HTTPS so the cookie's `Secure` flag is active.
- Never commit `.env.local`, passwords, access tokens, or Supabase secret/service-role keys.
- The AI provider API key and Supabase secret key must remain server-side.
- Keep RLS enabled and review the Supabase Security Advisor after changes to policies, tables, or functions.
- Set appropriate production redirect URLs, email confirmation, SMTP, password policies, and rate limits before public launch.
