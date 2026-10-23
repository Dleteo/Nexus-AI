-- Move privileged assistant quota and exchange writes behind a server-only API key.
-- Existing authenticated callers can no longer execute the SECURITY DEFINER functions directly.
revoke execute on function public.claim_assistant_request() from public, anon, authenticated;
revoke execute on function public.save_assistant_exchange(uuid, text, text) from public, anon, authenticated;

create or replace function public.claim_assistant_request_for_user(p_user_id uuid)
returns table (allowed boolean, requests_used integer, requests_remaining integer)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_used integer;
begin
  if p_user_id is null then
    raise exception 'User id is required' using errcode = '22023';
  end if;

  insert into public.assistant_daily_usage (user_id, usage_date, request_count, updated_at)
  values (p_user_id, (timezone('utc', now()))::date, 1, now())
  on conflict (user_id, usage_date) do update
    set request_count = public.assistant_daily_usage.request_count + 1,
        updated_at = now()
    where public.assistant_daily_usage.request_count < 10
  returning request_count into v_used;

  if v_used is null then
    return query select false, 10, 0;
  else
    return query select true, v_used, greatest(0, 10 - v_used);
  end if;
end;
$$;

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

  update public.assistant_conversations
    set updated_at = now(),
        title = case
          when title = 'New conversation'
          then left(regexp_replace(v_user_content, '\s+', ' ', 'g'), 80)
          else title
        end
    where id = p_conversation_id and user_id = p_user_id;

  if not found then
    raise exception 'Conversation not found' using errcode = 'P0002';
  end if;

  insert into public.assistant_messages (conversation_id, user_id, role, content)
  values (p_conversation_id, p_user_id, 'user', v_user_content);

  insert into public.assistant_messages (conversation_id, user_id, role, content)
  values (p_conversation_id, p_user_id, 'assistant', v_assistant_content);

  return true;
end;
$$;

revoke execute on function public.claim_assistant_request_for_user(uuid) from public, anon, authenticated;
revoke execute on function public.save_assistant_exchange_for_user(uuid, uuid, text, text) from public, anon, authenticated;
grant execute on function public.claim_assistant_request_for_user(uuid) to service_role;
grant execute on function public.save_assistant_exchange_for_user(uuid, uuid, text, text) to service_role;
