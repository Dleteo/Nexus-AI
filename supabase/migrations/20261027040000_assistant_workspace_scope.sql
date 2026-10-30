-- Nexus AI: permanent, typed portfolio/technical workspace boundaries.
-- Existing "Nexus Portfolio · ..." titles are migrated without deleting conversations.
-- Apply AFTER 20261023130002_lock_down_assistant_privileged_rpcs.sql.
alter table public.assistant_conversations
  add column if not exists scope text not null default 'technical';

update public.assistant_conversations
set scope = 'portfolio'
where title like 'Nexus Portfolio · %'
  and scope = 'technical';

alter table public.assistant_conversations
  drop constraint if exists assistant_conversations_scope_check;
alter table public.assistant_conversations
  add constraint assistant_conversations_scope_check
  check (scope in ('portfolio', 'technical'));

create index if not exists assistant_conversations_owner_scope_updated_idx
  on public.assistant_conversations (user_id, scope, updated_at desc);

-- Prevent a signed-in user (or a compromised browser) from reclassifying an
-- existing conversation by manipulating PostgREST directly.
create or replace function public.prevent_assistant_scope_change()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if new.scope is distinct from old.scope then
    raise exception 'Conversation workspace is immutable' using errcode = '22023';
  end if;
  return new;
end;
$$;

drop trigger if exists assistant_scope_immutable on public.assistant_conversations;
create trigger assistant_scope_immutable
before update on public.assistant_conversations
for each row execute function public.prevent_assistant_scope_change();

-- Trigger helpers are not public RPC endpoints.
revoke all on function public.prevent_assistant_scope_change() from public, anon, authenticated, service_role;

-- The original exchange RPC only titled "New conversation". New workspaces
-- retain their prefixes when the first message is saved.
create or replace function public.save_assistant_exchange_for_user(
  p_user_id uuid,
  p_conversation_id uuid,
  p_user_content text,
  p_assistant_content text
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_content text := trim(p_user_content);
  v_assistant_content text := trim(p_assistant_content);
  v_title text;
  v_scope text;
begin
  if p_user_id is null then
    raise exception 'User id is required' using errcode = '22023';
  end if;
  if char_length(v_user_content) not between 1 and 4000 then
    raise exception 'User message length is invalid' using errcode = '22023';
  end if;
  if char_length(v_assistant_content) not between 1 and 20000 then
    raise exception 'Assistant response length is invalid' using errcode = '22023';
  end if;

  select title, scope into v_title, v_scope
  from public.assistant_conversations
  where id = p_conversation_id and user_id = p_user_id
  for update;

  if not found then
    raise exception 'Conversation not found' using errcode = 'P0002';
  end if;

  update public.assistant_conversations
  set updated_at = now(),
      title = case
        when v_title in ('New conversation', 'Nexus Technical · New conversation', 'Nexus Portfolio · New conversation')
        then left(
          case when v_scope = 'portfolio' then 'Nexus Portfolio · ' else 'Nexus Technical · ' end
          || regexp_replace(v_user_content, '\s+', ' ', 'g'), 120)
        else v_title
      end
  where id = p_conversation_id and user_id = p_user_id;

  insert into public.assistant_messages (conversation_id, user_id, role, content)
  values (p_conversation_id, p_user_id, 'user', v_user_content);
  insert into public.assistant_messages (conversation_id, user_id, role, content)
  values (p_conversation_id, p_user_id, 'assistant', v_assistant_content);

  return true;
end;
$$;

-- Privileged RPC stays server-only; public browsers cannot call it.
revoke all on function public.save_assistant_exchange_for_user(uuid,uuid,text,text)
  from public, anon, authenticated, service_role;
grant execute on function public.save_assistant_exchange_for_user(uuid,uuid,text,text)
  to service_role;

-- Existing RLS policies still restrict conversations and messages to auth.uid().
