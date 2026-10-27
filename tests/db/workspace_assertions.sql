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
  if (not (select relrowsecurity from pg_class where oid='public.assistant_conversations'::regclass)) then
    raise exception 'RLS is disabled';
  end if;
  if has_function_privilege('authenticated','public.save_assistant_exchange_for_user(uuid,uuid,text,text)','EXECUTE')
     or has_function_privilege('anon','public.save_assistant_exchange_for_user(uuid,uuid,text,text)','EXECUTE')
     or not has_function_privilege('service_role','public.save_assistant_exchange_for_user(uuid,uuid,text,text)','EXECUTE') then
    raise exception 'Privileged RPC grants are unsafe';
  end if;
end $$;

set role authenticated;
set request.jwt.claim.sub = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
do $$
begin
  if (select count(*) from public.assistant_conversations) <> 2 then
    raise exception 'RLS did not isolate a signed-in user';
  end if;
  begin
    update public.assistant_conversations
      set scope='technical' where id='10000000-0000-4000-8000-000000000001';
    raise exception 'User was able to change the assistant scope';
  exception when sqlstate '22023' then null;
  end;
end $$;
reset role;
reset request.jwt.claim.sub;

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
end $$;
select 'PASS isolated workspace migration, RLS, immutability, and RPC ownership' as result;
