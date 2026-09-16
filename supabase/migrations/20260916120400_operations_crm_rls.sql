-- Phase 3 RLS, grants, and private document storage.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'operational-documents',
  'operational-documents',
  false,
  20971520,
  array[
    'application/pdf',
    'image/png',
    'image/jpeg',
    'image/webp',
    'text/plain',
    'text/csv',
    'application/zip',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]
)
on conflict (id) do nothing;

create policy operational_documents_storage_select
  on storage.objects
  for select
  to authenticated
  using (bucket_id = 'operational-documents' and public.is_platform_admin());

create policy operational_documents_storage_insert
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'operational-documents' and public.is_platform_admin());

alter table public.employees enable row level security;
alter table public.employees force row level security;
alter table public.freelancers enable row level security;
alter table public.freelancers force row level security;
alter table public.partner_companies enable row level security;
alter table public.partner_companies force row level security;
alter table public.suppliers enable row level security;
alter table public.suppliers force row level security;
alter table public.contacts enable row level security;
alter table public.contacts force row level security;
alter table public.procurement_purchases enable row level security;
alter table public.procurement_purchases force row level security;
alter table public.expenses enable row level security;
alter table public.expenses force row level security;
alter table public.payouts enable row level security;
alter table public.payouts force row level security;
alter table public.referrals enable row level security;
alter table public.referrals force row level security;
alter table public.commissions enable row level security;
alter table public.commissions force row level security;
alter table public.project_team_assignments enable row level security;
alter table public.project_team_assignments force row level security;
alter table public.operational_tasks enable row level security;
alter table public.operational_tasks force row level security;
alter table public.operational_documents enable row level security;
alter table public.operational_documents force row level security;
alter table public.operational_communications enable row level security;
alter table public.operational_communications force row level security;
alter table public.support_cases enable row level security;
alter table public.support_cases force row level security;
alter table public.support_case_events enable row level security;
alter table public.support_case_events force row level security;
alter table public.internal_notes enable row level security;
alter table public.internal_notes force row level security;
alter table public.operational_activity enable row level security;
alter table public.operational_activity force row level security;

revoke all on table public.employees from public, anon, authenticated;
revoke all on table public.freelancers from public, anon, authenticated;
revoke all on table public.partner_companies from public, anon, authenticated;
revoke all on table public.suppliers from public, anon, authenticated;
revoke all on table public.contacts from public, anon, authenticated;
revoke all on table public.procurement_purchases from public, anon, authenticated;
revoke all on table public.expenses from public, anon, authenticated;
revoke all on table public.payouts from public, anon, authenticated;
revoke all on table public.referrals from public, anon, authenticated;
revoke all on table public.commissions from public, anon, authenticated;
revoke all on table public.project_team_assignments from public, anon, authenticated;
revoke all on table public.operational_tasks from public, anon, authenticated;
revoke all on table public.operational_documents from public, anon, authenticated;
revoke all on table public.operational_communications from public, anon, authenticated;
revoke all on table public.support_cases from public, anon, authenticated;
revoke all on table public.support_case_events from public, anon, authenticated;
revoke all on table public.internal_notes from public, anon, authenticated;
revoke all on table public.operational_activity from public, anon, authenticated;

grant select on table public.employees to authenticated;
grant select on table public.freelancers to authenticated;
grant select on table public.partner_companies to authenticated;
grant select on table public.suppliers to authenticated;
grant select on table public.contacts to authenticated;
grant select on table public.procurement_purchases to authenticated;
grant select on table public.expenses to authenticated;
grant select on table public.payouts to authenticated;
grant select on table public.referrals to authenticated;
grant select on table public.commissions to authenticated;
grant select on table public.project_team_assignments to authenticated;
grant select on table public.operational_tasks to authenticated;
grant select on table public.operational_documents to authenticated;
grant select on table public.operational_communications to authenticated;
grant select on table public.support_cases to authenticated;
grant select on table public.support_case_events to authenticated;
grant select on table public.internal_notes to authenticated;
grant select on table public.operational_activity to authenticated;

create policy employees_select_admin on public.employees for select to authenticated using (public.is_platform_admin());
create policy freelancers_select_admin on public.freelancers for select to authenticated using (public.is_platform_admin());
create policy partners_select_admin on public.partner_companies for select to authenticated using (public.is_platform_admin());
create policy suppliers_select_admin on public.suppliers for select to authenticated using (public.is_platform_admin());
create policy contacts_select_admin on public.contacts for select to authenticated using (public.is_platform_admin());
create policy procurement_select_admin on public.procurement_purchases for select to authenticated using (public.is_platform_admin());
create policy expenses_select_admin on public.expenses for select to authenticated using (public.is_platform_admin());
create policy payouts_select_admin on public.payouts for select to authenticated using (public.is_platform_admin());
create policy referrals_select_admin on public.referrals for select to authenticated using (public.is_platform_admin());
create policy commissions_select_admin on public.commissions for select to authenticated using (public.is_platform_admin());
create policy operational_tasks_select_admin on public.operational_tasks for select to authenticated using (public.is_platform_admin());
create policy operational_documents_select_admin on public.operational_documents for select to authenticated using (public.is_platform_admin());
create policy operational_communications_select_admin on public.operational_communications for select to authenticated using (public.is_platform_admin());
create policy internal_notes_select_admin on public.internal_notes for select to authenticated using (public.is_platform_admin());
create policy operational_activity_select_admin on public.operational_activity for select to authenticated using (public.is_platform_admin());

create policy project_team_select_related
  on public.project_team_assignments
  for select
  to authenticated
  using (
    public.is_platform_admin()
    or (member_kind = 'developer' and developer_user_id = (select auth.uid()))
  );

create policy support_cases_select_related
  on public.support_cases
  for select
  to authenticated
  using (public.can_access_support_case(id));

create policy support_case_events_select_related
  on public.support_case_events
  for select
  to authenticated
  using (public.can_access_support_case(case_id) and public.is_platform_admin());
