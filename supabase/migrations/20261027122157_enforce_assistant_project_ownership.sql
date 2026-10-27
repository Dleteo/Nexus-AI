-- Match the INSERT policy when an authenticated client changes a conversation.
-- A project UUID alone is not authorization to attach another owner's project.
-- No existing conversations, messages, scopes, or privileged RPCs are changed.
alter policy "Users can update their own assistant conversations"
on public.assistant_conversations
to authenticated
using ((select auth.uid()) = user_id)
with check (
  (select auth.uid()) = user_id
  and (
    project_id is null
    or exists (
      select 1 from public.projects p
      where p.id = assistant_conversations.project_id
        and p.user_id = (select auth.uid())
    )
  )
);
