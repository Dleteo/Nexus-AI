create table if not exists public.assistant_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid null references public.projects(id) on delete set null,
  title text not null default 'New conversation' check (char_length(title) between 1 and 120),
  mode text not null default 'assistant' check (mode in ('assistant', 'plan', 'debug', 'explain', 'interview')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint assistant_conversations_id_user_unique unique (id, user_id)
);
create table if not exists public.assistant_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null check (char_length(content) between 1 and 30000),
  created_at timestamptz not null default now(),
  constraint assistant_messages_conversation_owner_fkey foreign key (conversation_id, user_id)
    references public.assistant_conversations(id, user_id) on delete cascade
);
create index if not exists assistant_conversations_user_updated_idx on public.assistant_conversations (user_id, updated_at desc);
create index if not exists assistant_messages_conversation_created_idx on public.assistant_messages (conversation_id, created_at asc);
alter table public.assistant_conversations enable row level security;
alter table public.assistant_messages enable row level security;
drop policy if exists "Users can read their own assistant conversations" on public.assistant_conversations;
create policy "Users can read their own assistant conversations" on public.assistant_conversations for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists "Users can create their own assistant conversations" on public.assistant_conversations;
create policy "Users can create their own assistant conversations" on public.assistant_conversations for insert to authenticated with check ((select auth.uid()) = user_id and (project_id is null or exists (select 1 from public.projects p where p.id = project_id and p.user_id = (select auth.uid())));
drop policy if exists "Users can update their own assistant conversations" on public.assistant_conversations;
create policy "Users can update their own assistant conversations" on public.assistant_conversations for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists "Users can delete their own assistant conversations" on public.assistant_conversations;
create policy "Users can delete their own assistant conversations" on public.assistant_conversations for delete to authenticated using ((select auth.uid()) = user_id);
drop policy if exists "Users can read their own assistant messages" on public.assistant_messages;
create policy "Users can read their own assistant messages" on public.assistant_messages for select to authenticated using ((select auth.uid()) = user_id and exists (select 1 from public.assistant_conversations c where c.id = conversation_id and c.user_id = (select auth.uid())));
drop policy if exists "Users can create their own assistant messages" on public.assistant_messages;
drop policy if exists "Users can create their own user messages" on public.assistant_messages;
create policy "Users can create their own user messages" on public.assistant_messages for insert to authenticated with check ((select auth.uid()) = user_id and role = 'user' and exists (select 1 from public.assistant_conversations c where c.id = conversation_id and c.user_id = (select auth.uid())));
drop policy if exists "Users can delete their own assistant messages" on public.assistant_messages;
create policy "Users can delete their own assistant messages" on public.assistant_messages for delete to authenticated using ((select auth.uid()) = user_id and exists (select 1 from public.assistant_conversations c where c.id = conversation_id and c.user_id = (select auth.uid())));
grant select, insert, update, delete on public.assistant_conversations to authenticated;
grant select, insert, delete on public.assistant_messages to authenticated;
create table if not exists public.assistant_daily_usage (
  user_id uuid not null references auth.users(id) on delete cascade,
  usage_date date not null default (timezone('utc', now()))::date,
  request_count integer not null default 0 check (request_count between 0 and 10),
  updated_at timestamptz not null default now(),
  primary key (user_id, usage_date)
);
alter table public.assistant_daily_usage enable row level security;
drop policy if exists "Users can read their own assistant usage" on public.assistant_daily_usage;
create policy "Users can read their own assistant usage" on public.assistant_daily_usage for select to authenticated using ((select auth.uid()) = user_id);
revoke insert, update, delete on public.assistant_daily_usage from anon, authenticated;
grant select on public.assistant_daily_usage to authenticated;
create or replace function public.claim_assistant_request()
returns table (allowed boolean, requests_used integer, requests_remaining integer)
language plpgsql security definer set search_path = ''
as $$
declare v_user_id uuid := auth.uid(); v_used integer;
begin
  if v_user_id is null then raise exception 'Authentication required' using errcode = '28000'; end if;
  insert into public.assistant_daily_usage (user_id, usage_date, request_count, updated_at)
  values (v_user_id, (timezone('utc', now()))::date, 1, now())
  on conflict (user_id, usage_date) do update set request_count = public.assistant_daily_usage.request_count + 1, updated_at = now()
  where public.assistant_daily_usage.request_count < 10
  returning request_count into v_used;
  if v_used is null then return query select false, 10, 0;
  else return query select true, v_used, greatest(0, 10 - v_used); end if;
end;
$$;
revoke execute on function public.claim_assistant_request() from public;
revoke execute on function public.claim_assistant_request() from anon;
grant execute on function public.claim_assistant_request() to authenticated;
create or replace function public.save_assistant_exchange(p_conversation_id uuid, p_user_content text, p_assistant_content text)
returns boolean language plpgsql security definer set search_path = ''
as $$
declare v_user_id uuid := auth.uid(); v_user_content text := trim(p_user_content); v_assistant_content text := trim(p_assistant_content);
begin
  if v_user_id is null then raise exception 'Authentication required' using errcode = '28000'; end if;
  if char_length(v_user_content) not between 1 and 4000 then raise exception 'User message length is invalid' using errcode = '22023'; end if;
  if char_length(v_assistant_content) not between 1 and 20000 then raise exception 'Assistant response length is invalid' using errcode = '22023'; end if;
  update public.assistant_conversations set updated_at = now(), title = case when title = 'New conversation' then left(regexp_replace(v_user_content, '\\s+', ' ', 'g'), 80) else title end where id = p_conversation_id and user_id = v_user_id;
  if not found then raise exception 'Conversation not found' using errcode = 'P0002'; end if;
  insert into public.assistant_messages (conversation_id, user_id, role, content) values (p_conversation_id, v_user_id, 'user', v_user_content);
  insert into public.assistant_messages (conversation_id, user_id, role, content) values (p_conversation_id, v_user_id, 'assistant', v_assistant_content);
  return true;
end;
$$;
revoke execute on function public.save_assistant_exchange(uuid, text, text) from public;
revoke execute on function public.save_assistant_exchange(uuid, text, text) from anon;
grant execute on function public.save_assistant_exchange(uuid, text, text) to authenticated;
