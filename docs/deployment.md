# Production deployment (Vercel + Supabase)

This guide prepares Nexus AI for a public production deployment. The repository is not considered deployed until a Vercel deployment URL is available and the production smoke tests below pass.

Official references: [Deploy a Next.js app on Vercel](https://vercel.com/docs/frameworks/nextjs), [Vercel environment variables](https://vercel.com/docs/environment-variables), and [Supabase Auth redirect URLs](https://supabase.com/docs/guides/auth/redirect-urls).

## 1. Import the repository into Vercel

1. Sign in to [Vercel](https://vercel.com/) and choose **Add New → Project**.
2. Import `Dleteo/Nexus-AI` from GitHub and select `main` as the production branch.
3. Confirm Vercel detects **Next.js**. Keep the standard build command (`npm run build`) and output settings unless Vercel reports a concrete build error.
4. Use Node.js 22 or a newer supported LTS version.
5. Before launching publicly, add the environment variables in the next section, then deploy.

No real secrets belong in the repository, GitHub Actions logs, or client-side variables.

## 2. Configure Vercel environment variables

In **Project → Settings → Environment Variables**, add these values for the **Production** environment:

| Variable | Value |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | The HTTPS URL of the Supabase project used for production |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | The Supabase publishable key for that project |
| `NEXT_PUBLIC_SITE_URL` | The stable production origin, e.g. `https://your-project.vercel.app` (no path or trailing slash) |
| `SUPABASE_SECRET_KEY` | A Supabase secret key for server-side privileged assistant RPCs |
| `AI_PROVIDER` | `gemini` |
| `GEMINI_API_KEY` | The secret key from Google AI Studio |
| `GEMINI_MODEL` | `gemini-3.5-flash-lite` (or a model verified as available for the key) |

Only if intentionally using OpenAI instead of Gemini, set `AI_PROVIDER=openai` and configure `OPENAI_API_KEY`; `OPENAI_MODEL` is optional and defaults in the application. Do not set a real provider key to a variable prefixed with `NEXT_PUBLIC_`.

**Keep Production and Preview isolated.** A Vercel Preview deployment should use a separate test Supabase project with its own publishable key and secret key, plus its own AI-provider key or a deliberately disabled AI feature. Do not expose production database secret keys or production AI credentials to arbitrary pull-request previews. Apply the tracked SQL migrations to the test project in timestamp order before testing the assistant.

Vercel uses environment variables according to the environment selected for each deployment. After changing variables, trigger a new deployment so the build and runtime receive the updated values.

## 3. Configure Supabase Auth for the deployed domain

In **Supabase Dashboard → Authentication → URL Configuration**:

1. Set **Site URL** to the stable production origin (for example, `https://your-project.vercel.app`).
2. Add the exact production recovery redirect URL to **Redirect URLs**: `https://your-project.vercel.app/reset-password`.
3. Keep `http://localhost:3000/**` for local development. Add preview redirect URLs only if password recovery is intentionally tested on previews; use the documented Vercel preview pattern only for preview deployments, not as a replacement for the production URL.
4. After choosing a custom domain or changing the Vercel project domain, update `NEXT_PUBLIC_SITE_URL`, the Supabase Site URL, and allowed redirects to match, then redeploy.

The production URL must use HTTPS. Configure email confirmation, reliable email delivery/SMTP, password policies, and rate limits before inviting public users. Never share password recovery URLs or tokens.

Reference: [Supabase Auth redirect URLs](https://supabase.com/docs/guides/auth/redirect-urls).

## 4. Production smoke test

Use a test account you control and check each item on the deployed HTTPS URL:

- [ ] The public home page and certificate images load; navigation works on desktop and mobile.
- [ ] Register a test account and confirm the email if confirmation is enabled.
- [ ] Sign in, refresh, and verify the session remains active.
- [ ] Sign out and verify private routes no longer show account data.
- [ ] Request password recovery; open the email on the deployed domain; set a new password and sign in with it.
- [ ] Create, edit, archive, restore, and delete a test project; refresh and verify changes persist.
- [ ] Use the AI assistant in its available modes; confirm the answer is saved in conversation history.
- [ ] Confirm one user's test account cannot view or modify another user's records.
- [ ] Inspect Vercel runtime logs and Supabase Auth / database logs for errors. Do not copy secrets or recovery tokens into tickets or logs.

## 5. Common deployment failures

- **Account services not configured / 503:** verify the Supabase URL and publishable key exist in the deployment environment, then redeploy.
- **Password recovery fails to start:** confirm `NEXT_PUBLIC_SITE_URL` is the exact HTTPS production origin and the `/reset-password` URL is allowed in Supabase.
- **Assistant configuration error / 503:** verify `AI_PROVIDER=gemini`, `GEMINI_API_KEY`, `GEMINI_MODEL`, and `SUPABASE_SECRET_KEY` are configured in the correct environment. Keep the two secret keys server-side.
- **Build succeeds but a server route fails:** inspect the Vercel Function logs for that deployment and check Supabase/provider logs. Never paste raw secrets into an issue.
- **AI requests time out:** review the assistant route and Vercel Function duration/runtime logs; do not disable authentication or quota controls as a workaround.

## Security checklist

- Keep `.env.local` out of Git; `.gitignore` excludes environment files.
- Treat `NEXT_PUBLIC_*` variables as browser-visible. The Supabase publishable key is designed for client use; Supabase secret keys and AI-provider keys are not.
- Keep row-level security enabled for user-owned project and assistant data.
- Use separate Preview credentials and databases rather than pointing untrusted previews at production.
- Re-run the repository checks before merging changes:

  ```bash
  npm ci
  npm audit --audit-level=high
  npm run lint
  npx tsc --noEmit
  npm run build
  ```

Do not describe the app as production-ready until the deployment is live, the smoke tests pass, and production auth redirects and secrets have been verified.
