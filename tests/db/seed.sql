-- Controlled CI fixtures: no real users or private data.
insert into auth.users(id) values
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb');
insert into public.projects(id,user_id,name) values
  ('20000000-0000-4000-8000-000000000001','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','First synthetic project'),
  ('20000000-0000-4000-8000-000000000002','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','Second synthetic project');
insert into public.assistant_conversations (id,user_id,title,project_id)
values
  ('10000000-0000-4000-8000-000000000001','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','Nexus Portfolio · New conversation',null),
  ('10000000-0000-4000-8000-000000000002','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','A legacy technical chat','20000000-0000-4000-8000-000000000001'),
  ('10000000-0000-4000-8000-000000000003','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','Nexus Technical · New conversation','20000000-0000-4000-8000-000000000002');
insert into public.assistant_messages(conversation_id,user_id,role,content)
values ('10000000-0000-4000-8000-000000000002','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','user','My existing conversation');
