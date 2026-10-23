# Supabase setup

Nexus AI uses Supabase Auth and its PostgreSQL REST API. No service-role key is needed by this app. Never expose a Supabase service-role key in browser code or commit secrets to Git.

## 1. Create a Supabase project

Create a project at https://supabase.com/dashboard. In **Project Settings → API**, copy the project URL and the public/anon key. Configure these as environment variables locally and in your hosting provider:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

Restart the Next.js server after changing environment variables. The public/anon key is designed to be used with row-level security; do not use a service-role key.

## 2. Configure email authentication

In **Authentication → URL Configuration**, set the site URL to your development or production origin and add allowed redirect URLs as appropriate. In **Authentication → Providers → Email**, choose whether new accounts must confirm their email. If email confirmation is enabled, registration displays a confirmation notice and the user must confirm before signing in. Set up an SMTP provider for production delivery.

## 3. Create the projects table

Open the Supabase SQL Editor and run:

```sql
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 2 and 80),
  description text not null default '' check (char_length(description) <= 500),
  status text not null default 'active' check (status in ('active', 'archived')),
  created_at timestamptz not null default now()
);

create index if not exists projects_user_id_created_at_idx
  on public.projects (user_id, created_at desc);

alter table public.projects enable row level security;

drop policy if exists "Users can view their own projects" on public.projects;
create policy "Users can view their own projects"
  on public.projects for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can create their own projects" on public.projects;
create policy "Users can create their own projects"
  on public.projects for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update their own projects" on public.projects;
create policy "Users can update their own projects"
  on public.projects for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete their own projects" on public.projects;
create policy "Users can delete their own projects"
  on public.projects for delete to authenticated
  using ((select auth.uid()) = user_id);

grant select, insert, update, delete on public.projects to authenticated;
```

The row-level security policies are essential: they prevent one signed-in user from reading or changing another user's project rows.

## 4. Run and verify locally

```bash
npm ci
npm run lint
npx tsc --noEmit
npm run build
npm run dev
```

Then test:
1. Open `/register`, create an account, and confirm the email if required.
2. Sign in at `/login`; verify `/dashboard` redirects to login when signed out.
3. Create a project, refresh the page, and confirm it persists.
4. Delete the project and confirm it disappears.
5. Sign out and confirm the dashboard is protected again.
6. Create a second test account and confirm it cannot see the first account's projects.

## Security notes

- Session tokens are stored in a server-set HTTP-only, SameSite=Lax cookie; JavaScript cannot read the cookie. HTTPS is required in production so the cookie's Secure flag is active.
- Authentication calls use the public Supabase key and user-scoped access token. Row-level security must remain enabled.
- Configure Supabase's email confirmation, password policy, SMTP, allowed origins, and rate limits before production use.
- Do not commit real environment files or credentials. The app intentionally reports a configuration error when the variables are missing.
