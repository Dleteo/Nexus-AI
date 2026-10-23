# Supabase setup

Nexus AI uses Supabase Auth and its PostgreSQL REST API. The app uses only the public/anon key with each user's access token and row-level security; it does not need a service-role key. Never expose or commit a service-role key.

## 1. Create a Supabase project

Create a project at https://supabase.com/dashboard. In **Project Settings → API**, copy the project URL and the public/anon key. Set these values locally in .env.local and in the hosting provider's environment variables:

    NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
    NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY

Use .env.example as the template. Restart the Next.js server after changing environment variables.

## 2. Configure email authentication

In **Authentication → URL Configuration**, set the Site URL to your actual local or production origin and add only the redirect URLs you use. In **Authentication → Providers → Email**, choose whether email confirmation is required. If it is enabled, users must confirm their address before signing in. Configure SMTP for reliable production email delivery.

## 3. Create the projects table and security policies

Open **SQL Editor → New query** in your Supabase project. Copy the complete SQL from [the projects migration](../supabase/migrations/20261023000000_create_projects.sql), paste it into the editor, and run it.

The migration creates the projects table, its index, and row-level security (RLS) policies. The policies restrict every read, insert, update, and delete to rows owned by the authenticated user. Keep RLS enabled; do not replace the user-scoped access token with a service-role key.

## 4. Configure the app and validate locally

    npm ci
    npm run lint
    npx tsc --noEmit
    npm run build
    npm run dev

Open http://localhost:3000/register, create a test account, confirm the email if required, and sign in. Then verify:
1. /dashboard redirects to sign-in when you are logged out.
2. You can create a project, refresh the page, and see the saved project.
3. You can delete a project and it disappears from the list.
4. Sign out, then verify the dashboard is protected again.
5. Create a second test account and confirm it cannot see the first account's projects.

Without Supabase environment variables, the public portfolio and production build still work, but account APIs report that configuration is missing and user/project features cannot run.

## Security notes

- Session tokens are in a server-set HTTP-only, SameSite=Lax cookie; JavaScript cannot read them. Production must use HTTPS so the Secure cookie flag is enabled.
- Keep credentials out of Git. Never commit .env.local, passwords, access tokens, or a Supabase service-role key.
- Configure email confirmation, password rules, SMTP, allowed origins, and rate limits before production use.
