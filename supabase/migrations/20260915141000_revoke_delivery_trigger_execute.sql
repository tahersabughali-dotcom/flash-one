-- Revoke direct execute on delivery trigger functions.
-- Triggers keep working as table-owner internals. PostgREST must not expose them.

revoke all on function public.conversation_messages_assign_sender() from public, anon, authenticated;
revoke all on function public.conversation_messages_prevent_mutation() from public, anon, authenticated;
revoke all on function public.conversation_messages_after_insert() from public, anon, authenticated;
revoke all on function public.projects_after_insert_workspace() from public, anon, authenticated;
revoke all on function public.projects_after_status_change() from public, anon, authenticated;

-- Customer message INSERT fires these triggers. Anon stays revoked.
grant execute on function public.conversation_messages_assign_sender() to authenticated;
grant execute on function public.conversation_messages_after_insert() to authenticated;

-- Nested deliverable RLS already hid unauthorized rows. Make the file-link
-- policy explicit so draft/cross-project links cannot rely on subquery quirks.

drop policy if exists deliverable_files_select_related on public.deliverable_files;

create policy deliverable_files_select_related
  on public.deliverable_files
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.deliverables as deliverable
      where deliverable.id = deliverable_files.deliverable_id
        and public.can_access_project(deliverable.project_id)
        and (
          public.is_platform_admin()
          or deliverable.status <> 'draft'
        )
    )
  );
