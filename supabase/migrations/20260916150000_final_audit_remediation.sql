-- Final audit remediation: authorize financial allocation helper RPCs.
-- invoice_allocated_minor / payment_allocated_minor were SECURITY DEFINER
-- and executable by authenticated without ownership checks (RLS bypass oracle).

create or replace function public.invoice_allocated_minor(p_invoice_id uuid)
returns bigint
language plpgsql
stable
security definer
set search_path = pg_catalog, public
as $$
begin
  if p_invoice_id is null then
    return 0;
  end if;
  if not public.can_access_invoice(p_invoice_id) then
    raise exception 'not authorized';
  end if;
  return coalesce((
    select sum(amount_minor)
    from public.payment_allocations
    where invoice_id = p_invoice_id
  ), 0);
end;
$$;

revoke all on function public.invoice_allocated_minor(uuid) from public, anon;
grant execute on function public.invoice_allocated_minor(uuid) to authenticated;

create or replace function public.payment_allocated_minor(p_payment_id uuid)
returns bigint
language plpgsql
stable
security definer
set search_path = pg_catalog, public
as $$
begin
  if p_payment_id is null then
    return 0;
  end if;
  if not public.can_access_payment(p_payment_id) then
    raise exception 'not authorized';
  end if;
  return coalesce((
    select sum(amount_minor)
    from public.payment_allocations
    where payment_id = p_payment_id
  ), 0);
end;
$$;

revoke all on function public.payment_allocated_minor(uuid) from public, anon;
grant execute on function public.payment_allocated_minor(uuid) to authenticated;

-- Ensure Phase 5 malware / customer case / refund visibility foundations exist
-- (idempotent; may already be applied under a differently versioned remote name).

alter table public.project_files
  add column if not exists malware_scan_status text not null default 'unavailable';

alter table public.project_files
  drop constraint if exists project_files_malware_scan_status_check;

alter table public.project_files
  add constraint project_files_malware_scan_status_check
    check (malware_scan_status in ('not_scanned', 'pending', 'clean', 'rejected', 'unavailable'));

alter table public.operational_documents
  add column if not exists malware_scan_status text not null default 'unavailable';

alter table public.operational_documents
  drop constraint if exists operational_documents_malware_scan_status_check;

alter table public.operational_documents
  add constraint operational_documents_malware_scan_status_check
    check (malware_scan_status in ('not_scanned', 'pending', 'clean', 'rejected', 'unavailable'));

drop policy if exists refunds_select_customer on public.refunds;
create policy refunds_select_customer
  on public.refunds for select to authenticated
  using (public.can_access_payment(payment_id));

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
