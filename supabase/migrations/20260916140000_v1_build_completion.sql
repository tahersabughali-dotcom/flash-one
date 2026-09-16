-- Phase 5: V1 build completion — notifications, audit read, malware state, refunds visibility, customer cases.
-- Forward only. Do not invent credentials or company data.

-- ---------------------------------------------------------------------------
-- Mark all notifications read
-- ---------------------------------------------------------------------------

create or replace function public.mark_all_notifications_read()
returns integer
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  actor uuid;
  updated integer;
begin
  actor := (select auth.uid());
  if actor is null then
    raise exception 'not authenticated';
  end if;
  update public.notifications
  set read_at = coalesce(read_at, now())
  where user_id = actor
    and read_at is null;
  get diagnostics updated = row_count;
  return updated;
end;
$$;

revoke all on function public.mark_all_notifications_read() from public, anon;
grant execute on function public.mark_all_notifications_read() to authenticated;

-- ---------------------------------------------------------------------------
-- Admin audit log read (table privileges remain revoked from authenticated)
-- ---------------------------------------------------------------------------

create or replace function public.admin_list_audit_events(
  p_limit integer default 50,
  p_offset integer default 0
)
returns table (
  id uuid,
  occurred_at timestamptz,
  actor_type text,
  actor_id uuid,
  action text,
  entity_type text,
  entity_id uuid,
  metadata jsonb,
  request_id uuid,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  perform public.assert_platform_admin();
  return query
  select
    e.id,
    e.occurred_at,
    e.actor_type,
    e.actor_id,
    e.action,
    e.entity_type,
    e.entity_id,
    e.metadata,
    e.request_id,
    e.created_at
  from public.audit_events e
  order by e.occurred_at desc
  limit greatest(1, least(coalesce(p_limit, 50), 100))
  offset greatest(0, coalesce(p_offset, 0));
end;
$$;

revoke all on function public.admin_list_audit_events(integer, integer) from public, anon;
grant execute on function public.admin_list_audit_events(integer, integer) to authenticated;

-- ---------------------------------------------------------------------------
-- Malware scan state foundation (never claim clean without a scanner)
-- ---------------------------------------------------------------------------

alter table public.project_files
  add column if not exists malware_scan_status text not null default 'unavailable';

alter table public.project_files
  drop constraint if exists project_files_malware_scan_status_check;

alter table public.project_files
  add constraint project_files_malware_scan_status_check
    check (malware_scan_status in ('not_scanned', 'pending', 'clean', 'rejected', 'unavailable'));

comment on column public.project_files.malware_scan_status is
  'Scanner foundation only. Without a configured scanner the value remains unavailable or not_scanned. Never falsify clean.';

alter table public.operational_documents
  add column if not exists malware_scan_status text not null default 'unavailable';

alter table public.operational_documents
  drop constraint if exists operational_documents_malware_scan_status_check;

alter table public.operational_documents
  add constraint operational_documents_malware_scan_status_check
    check (malware_scan_status in ('not_scanned', 'pending', 'clean', 'rejected', 'unavailable'));

comment on column public.operational_documents.malware_scan_status is
  'Scanner foundation only. Without a configured scanner the value remains unavailable or not_scanned. Never falsify clean.';

-- ---------------------------------------------------------------------------
-- Customer-safe refund visibility for payments they can already access
-- ---------------------------------------------------------------------------

drop policy if exists refunds_select_customer on public.refunds;
create policy refunds_select_customer
  on public.refunds for select to authenticated
  using (public.can_access_payment(payment_id));

-- ---------------------------------------------------------------------------
-- Customer support case creation (visible to customer)
-- ---------------------------------------------------------------------------

create or replace function public.customer_create_support_case(
  p_title text,
  p_description text
)
returns public.support_cases
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  actor uuid;
  created public.support_cases;
  title_text text;
begin
  actor := (select auth.uid());
  if actor is null then
    raise exception 'not authenticated';
  end if;
  title_text := left(trim(coalesce(p_title, '')), 160);
  if title_text = '' then
    raise exception 'invalid case';
  end if;
  insert into public.support_cases (
    title,
    case_type,
    priority,
    status,
    description,
    customer_visible,
    individual_user_id,
    created_by_user_id
  ) values (
    title_text,
    'general',
    'normal',
    'open',
    nullif(left(trim(coalesce(p_description, '')), 8000), ''),
    true,
    actor,
    actor
  ) returning * into created;
  insert into public.support_case_events (case_id, event_type, summary, created_by_user_id)
  values (created.id, 'created', 'Opened by customer', actor);
  return created;
end;
$$;

revoke all on function public.customer_create_support_case(text, text) from public, anon;
grant execute on function public.customer_create_support_case(text, text) to authenticated;
