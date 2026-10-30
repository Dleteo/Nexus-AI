-- Assertions deliberately fail CI if the migration breaks old data, permissions,
-- workspace immutability, or privileged exchange storage.
do $$
begin
  if (select scope from public.assistant_conversations where id='10000000-0000-4000-8000-000000000001') <> 'portfolio' then
    raise exception 'Portfolio legacy scope did not migrate';
  end if;
  if (select scope from public.assistant_conversations where id='10000000-0000-4000-8000-000000000002') <> 'technical' then
    raise exception 'Legacy technical chat was not preserved';
  end if;
  if (select count(*) from public.assistant_messages) <> 1 then
    raise exception 'Migration lost messages';
  end if;
  if exists (
    select 1 from pg_class
    where oid in (
      'public.assistant_conversations'::regclass,
      'public.assistant_messages'::regclass,
      'public.assistant_daily_usage'::regclass
    ) and not relrowsecurity
  ) then
    raise exception 'RLS is disabled';
  end if;
  if has_function_privilege('authenticated','public.save_assistant_exchange_for_user(uuid,uuid,text,text)','EXECUTE')
     or has_function_privilege('anon','public.save_assistant_exchange_for_user(uuid,uuid,text,text)','EXECUTE')
     or not has_function_privilege('service_role','public.save_assistant_exchange_for_user(uuid,uuid,text,text)','EXECUTE') then
    raise exception 'Privileged RPC grants are unsafe';
  end if;
  if has_function_privilege('authenticated','public.claim_assistant_request_for_user(uuid)','EXECUTE')
     or has_function_privilege('anon','public.claim_assistant_request_for_user(uuid)','EXECUTE')
     or not has_function_privilege('service_role','public.claim_assistant_request_for_user(uuid)','EXECUTE') then
    raise exception 'Privileged quota RPC grants are unsafe';
  end if;
  if has_function_privilege('authenticated','public.claim_assistant_request()','EXECUTE')
     or has_function_privilege('anon','public.claim_assistant_request()','EXECUTE')
     or has_function_privilege('authenticated','public.save_assistant_exchange(uuid,text,text)','EXECUTE')
     or has_function_privilege('anon','public.save_assistant_exchange(uuid,text,text)','EXECUTE') then
    raise exception 'Legacy privileged RPCs are still publicly callable';
  end if;
end $$;

-- A second owner's message makes a missing message SELECT policy observable.
insert into public.assistant_messages(conversation_id,user_id,role,content)
values (
  '10000000-0000-4000-8000-000000000003',
  'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
  'user',
  'Second synthetic user private message'
);

set role authenticated;
set request.jwt.claim.sub = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
do $$
declare
  v_affected integer;
begin
  if (select count(*) from public.assistant_conversations) <> 2 then
    raise exception 'RLS did not isolate a signed-in user';
  end if;
  if (select count(*) from public.assistant_messages) <> 1
     or exists (
       select 1 from public.assistant_messages
       where user_id='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'
     ) then
    raise exception 'RLS exposed another user''s messages';
  end if;

  update public.assistant_conversations set title='Unauthorized title'
  where id='10000000-0000-4000-8000-000000000003';
  get diagnostics v_affected = row_count;
  if v_affected <> 0 then
    raise exception 'User updated another owner''s conversation';
  end if;
  delete from public.assistant_conversations
  where id='10000000-0000-4000-8000-000000000003';
  get diagnostics v_affected = row_count;
  if v_affected <> 0 then
    raise exception 'User deleted another owner''s conversation';
  end if;
  delete from public.assistant_messages
  where conversation_id='10000000-0000-4000-8000-000000000003';
  get diagnostics v_affected = row_count;
  if v_affected <> 0 then
    raise exception 'User deleted another owner''s messages';
  end if;

  -- This conversation has no messages yet, so a failed owner reassignment
  -- must come from RLS WITH CHECK rather than the composite message FK.
  begin
    update public.assistant_conversations
      set user_id='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'
      where id='10000000-0000-4000-8000-000000000001';
    raise exception 'User reassigned conversation ownership';
  exception when insufficient_privilege then null;
  end;
  begin
    update public.assistant_conversations
      set scope='technical' where id='10000000-0000-4000-8000-000000000001';
    raise exception 'User was able to change the assistant scope';
  exception when sqlstate '22023' then null;
  end;
end $$;
reset role;
reset request.jwt.claim.sub;

-- Quota claims must persist exactly ten increments and deny the eleventh.
-- This verifies the function boundary in one session; CI does not simulate
-- concurrent clients here.
set role service_role;
do $$
declare
  v_claim record;
  v_attempt integer;
begin
  for v_attempt in 1..10 loop
    select * into strict v_claim from public.claim_assistant_request_for_user(
      'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
    );
    if v_claim.allowed is distinct from true
       or v_claim.requests_used is distinct from v_attempt
       or v_claim.requests_remaining is distinct from 10-v_attempt then
      raise exception 'Quota claim % returned incorrect usage', v_attempt;
    end if;
  end loop;
  select * into strict v_claim from public.claim_assistant_request_for_user(
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
  );
  if v_claim.allowed is distinct from false
     or v_claim.requests_used is distinct from 10
     or v_claim.requests_remaining is distinct from 0 then
    raise exception 'Eleventh quota claim was not denied correctly';
  end if;
  if (select count(*) from public.assistant_daily_usage) <> 1
     or (select request_count from public.assistant_daily_usage
         where user_id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
           and usage_date=(timezone('utc',now()))::date) is distinct from 10 then
    raise exception 'Quota denial changed persisted usage';
  end if;
end $$;
reset role;

-- A server-side exchange must preserve scope and assign the first message's title.
set role service_role;
select public.save_assistant_exchange_for_user(
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  '10000000-0000-4000-8000-000000000001',
  'Improve my project case studies',
  'Here are recommendations'
);
do $$
begin
  begin
    perform public.save_assistant_exchange_for_user(
      'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
      '10000000-0000-4000-8000-000000000001',
      'Unauthorized user message',
      'Unauthorized answer'
    );
    raise exception 'Server allowed a cross-owner exchange';
  exception when sqlstate 'P0002' then null;
  end;
end $$;
reset role;

do $$
begin
  if (select scope from public.assistant_conversations where id='10000000-0000-4000-8000-000000000001') <> 'portfolio' then
    raise exception 'Server exchange altered scope';
  end if;
  if (select title from public.assistant_conversations where id='10000000-0000-4000-8000-000000000001') <> 'Nexus Portfolio · Improve my project case studies' then
    raise exception 'Portfolio conversation title was not preserved';
  end if;
  if (select count(*) from public.assistant_messages where conversation_id='10000000-0000-4000-8000-000000000001') <> 2 then
    raise exception 'Server exchange did not save two messages';
  end if;
  if (select count(*) from public.assistant_messages where conversation_id='10000000-0000-4000-8000-000000000002') <> 1 then
    raise exception 'Legacy messages were lost';
  end if;
  if (select title from public.assistant_conversations where id='10000000-0000-4000-8000-000000000003')
     is distinct from 'Nexus Technical · New conversation'
     or (select count(*) from public.assistant_messages
         where conversation_id='10000000-0000-4000-8000-000000000003') <> 1 then
    raise exception 'Cross-owner attempts changed another user''s history';
  end if;
end $$;
select 'PASS isolated workspace migration, RLS, immutability, RPC ownership, and quota boundary' as result;
