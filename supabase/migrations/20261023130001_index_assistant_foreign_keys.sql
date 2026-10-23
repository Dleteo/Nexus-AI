create index if not exists assistant_conversations_project_id_idx
  on public.assistant_conversations (project_id)
  where project_id is not null;

create index if not exists assistant_messages_conversation_owner_idx
  on public.assistant_messages (conversation_id, user_id);

create index if not exists assistant_messages_user_id_idx
  on public.assistant_messages (user_id);
