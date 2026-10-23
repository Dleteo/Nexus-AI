-- Nexus AI project workspace
-- Apply in the Supabase SQL Editor before using the dashboard.

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
