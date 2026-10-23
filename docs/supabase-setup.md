# Supabase setup

Nexus AI uses Supabase Auth and its PostgreSQL REST API. The app uses the public publishable API key with each user's access token and row-level security; it does not need a secret/service-role key. Never expose or commit a Supabase secret key.

## 1. Project and environment variables

Project URL: https://hyrvilrthpyyrtcgthzq.supabase.co

In **Project Settings → API Keys**, copy the project's publishable key. Create a local .env.local file next to package.json:

    NEXT_PUBLIC_SUPABASE_URL=https://hyrvilrthpyyrtcgthzq.supabase.co
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_REPLACE_WITH_YOUR_PROJECT_KEY

Use .env.example as the template and replace the placeholder with the publishable key from your dashboard. The key starts with sb_publishable_. It is designed for application use; never substitute a secret/service-role key. The app also supports the legacy NEXT_PUBLIC_SUPABASE_ANON_KEY variable for compatibility. Restart Next.js after changing environment variables.

## 2. Configure email authentication

In Supabase **Authentication → URL Configuration**, set Site URL to http://localhost:3000 for local development, then add http://localhost:3000/** to the allowed redirect URLs. Add `http://localhost:3000/reset-password` explicitly if you prefer exact redirect entries. Set `NEXT_PUBLIC_SITE_URL=http://localhost:3000` in `.env.local`; in production, set it to the exact HTTPS origin of the deployed app and add that origin and its `/reset-password` URL to Supabase allowed redirect URLs. When the application is deployed, add its exact production origin and callback URLs as well; do not use a made-up deployment domain.

In **Authentication → Providers → Email**, choose whether email confirmation is required. If enabled, users must confirm their address before signing in. Configure SMTP for reliable production email delivery.

## 3. Create the projects table and security policies

The projects table and its row-level security policies are managed by the migration at supabase/migrations/20261023000000_create_projects.sql. It has been applied to the connected Supabase project. The policies restrict reads, inserts, updates, and deletes to rows owned by the authenticated user. Keep RLS enabled.

## 4. Run and validate locally

    npm ci
    npm run lint
    npx tsc --noEmit
    npm run build
    npm run dev

Open http://localhost:3000/register, create a test account, confirm the email if required, and sign in. Then verify:
1. /dashboard redirects to sign-in when logged out.
2. A project can be created, survives a page refresh, and can be deleted.
3. Signing out protects the dashboard again.
4. A second test account cannot see or delete the first account's projects.

Without the local environment variables, the public portfolio and production build still work, but account APIs report a configuration error.

## Security notes

- Session tokens are in a server-set HTTP-only, SameSite=Lax cookie; JavaScript cannot read them. Production must use HTTPS so the Secure cookie flag is enabled.
- Never commit .env.local, passwords, access tokens, or a Supabase secret/service-role key.
- Configure email confirmation, password rules, SMTP, allowed origins, and rate limits before production use.
