-- Exercise direct authenticated database writes, including clients bypassing
-- the Next.js routes. All projects and users are disposable CI fixtures.
set role authenticated;
set request.jwt.claim.sub = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
do $$
declare
  v_affected integer;
begin
  if (select project_id from public.assistant_conversations
      where id='10000000-0000-4000-8000-000000000002')
     is distinct from '20000000-0000-4000-8000-000000000001'::uuid then
    raise exception 'Migration changed an existing valid project association';
  end if;

  update public.assistant_conversations
  set project_id='20000000-0000-4000-8000-000000000001'
  where id='10000000-0000-4000-8000-000000000001';
  get diagnostics v_affected = row_count;
  if v_affected <> 1 then
    raise exception 'User could not attach their own project';
  end if;

  begin
    update public.assistant_conversations
    set project_id='20000000-0000-4000-8000-000000000002'
    where id='10000000-0000-4000-8000-000000000001';
    raise exception 'User attached another owner''s project';
  exception when insufficient_privilege then null;
  end;
  if (select project_id from public.assistant_conversations
      where id='10000000-0000-4000-8000-000000000001')
     is distinct from '20000000-0000-4000-8000-000000000001'::uuid then
    raise exception 'Rejected project update changed the association';
  end if;

  update public.assistant_conversations set project_id=null
  where id='10000000-0000-4000-8000-000000000001';
  get diagnostics v_affected = row_count;
  if v_affected <> 1 or (select project_id from public.assistant_conversations
      where id='10000000-0000-4000-8000-000000000001') is not null then
    raise exception 'User could not unlink their project';
  end if;

  -- Normal updates must still work for a conversation with a valid project.
  update public.assistant_conversations set mode='debug'
  where id='10000000-0000-4000-8000-000000000002';
  get diagnostics v_affected = row_count;
  if v_affected <> 1 then
    raise exception 'Project ownership policy blocked a valid mode update';
  end if;
  update public.assistant_conversations set mode='assistant'
  where id='10000000-0000-4000-8000-000000000002';

  if (select scope from public.assistant_conversations
      where id='10000000-0000-4000-8000-000000000001') is distinct from 'portfolio'
     or (select scope from public.assistant_conversations
         where id='10000000-0000-4000-8000-000000000002') is distinct from 'technical' then
    raise exception 'Project updates changed conversation workspaces';
  end if;
end $$;
reset role;
reset request.jwt.claim.sub;

select 'PASS project ownership updates, valid associations, unlinking, and workspace preservation' as result;
