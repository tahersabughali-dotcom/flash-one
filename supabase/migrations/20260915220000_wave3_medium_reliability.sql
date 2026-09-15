-- Wave 3 medium: revoke direct EXECUTE on trigger-only functions.
-- Triggers keep working as table-owner internals.

alter function public.set_updated_at() security definer;
alter function public.prevent_audit_mutation() security definer;
alter function public.conversation_messages_assign_sender() security definer;

revoke all on function public.set_updated_at() from public, anon, authenticated;
revoke all on function public.prevent_audit_mutation() from public, anon, authenticated;
revoke all on function public.conversation_messages_assign_sender() from public, anon, authenticated;
revoke all on function public.conversation_messages_after_insert() from public, anon, authenticated;
revoke all on function public.conversation_messages_prevent_mutation() from public, anon, authenticated;
revoke all on function public.projects_after_insert_workspace() from public, anon, authenticated;
revoke all on function public.projects_after_status_change() from public, anon, authenticated;
revoke all on function public.work_request_submitted_enqueue() from public, anon, authenticated;
revoke all on function public.handle_new_user() from public, anon, authenticated;
revoke all on function public.financial_prevent_mutation() from public, anon, authenticated;
revoke all on function public.invoices_protect_issued() from public, anon, authenticated;
revoke all on function public.invoice_line_items_protect_issued() from public, anon, authenticated;
revoke all on function public.process_pending_outbox() from public, anon, authenticated;
