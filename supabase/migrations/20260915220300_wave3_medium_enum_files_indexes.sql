-- Wave 3 medium: capability-safe payment read, filename hardening,
-- synthetic catalog hide, justified indexes.

create or replace function public.public_get_payment_request(p_public_id text)
returns jsonb
language plpgsql
stable
security definer
set search_path = pg_catalog, public
as $$
declare
  current public.payment_requests;
begin
  if p_public_id is null or p_public_id !~ '^PRQ-[A-F0-9]{12}$' then
    return jsonb_build_object('status', 'not_found');
  end if;
  select * into current from public.payment_requests where public_id = p_public_id;
  if current.id is null or current.status in ('cancelled', 'draft') then
    return jsonb_build_object('status', 'not_found');
  end if;
  if current.status in ('expired') or (current.expires_at is not null and current.expires_at <= now()) then
    return jsonb_build_object(
      'public_id', current.public_id,
      'status', 'expired',
      'currency', current.currency
    );
  end if;
  if current.status = 'completed' then
    return jsonb_build_object(
      'public_id', current.public_id,
      'status', 'completed',
      'currency', current.currency
    );
  end if;
  return jsonb_build_object(
    'public_id', current.public_id,
    'status', current.status,
    'currency', current.currency,
    'amount_mode', current.amount_mode,
    'requested_amount_minor', current.requested_amount_minor,
    'min_amount_minor', current.min_amount_minor,
    'max_amount_minor', current.max_amount_minor,
    'service_code', current.service_code,
    'description', current.description,
    'business_only_eligible', current.organization_id is not null,
    'guest', current.guest_email is not null
  );
end;
$$;

revoke all on function public.public_get_payment_request(text) from public;
grant execute on function public.public_get_payment_request(text) to anon, authenticated;

create or replace function public.normalize_upload_filename(p_name text)
returns text
language plpgsql
immutable
set search_path = pg_catalog, public
as $$
declare
  base text;
  cleaned text;
begin
  base := regexp_replace(coalesce(p_name, ''), '[\\/]+', '/', 'g');
  base := regexp_replace(base, '^.*/', '');
  base := trim(base);
  if position('..' in base) > 0 then
    raise exception 'unsupported filename';
  end if;
  cleaned := regexp_replace(base, '[^A-Za-z0-9._-]', '_', 'g');
  cleaned := regexp_replace(cleaned, '_+', '_', 'g');
  cleaned := left(cleaned, 120);
  if cleaned ~* '\.(exe|bat|cmd|com|scr|pif|js|mjs|html|htm|svg|php|sh|ps1|vbs|jar|dll|msi|apk|hta)(\.|$)' then
    raise exception 'unsupported filename';
  end if;
  if cleaned !~* '^[A-Za-z0-9][A-Za-z0-9._-]*\.(pdf|png|jpe?g|webp|txt|csv|zip|docx|xlsx)$' then
    raise exception 'unsupported filename';
  end if;
  return cleaned;
end;
$$;

revoke all on function public.normalize_upload_filename(text) from public, anon;
grant execute on function public.normalize_upload_filename(text) to authenticated;

update public.store_products
set status = 'archived',
    customer_visible = false
where public_id = 'PRD-D1F27F90BE17'
  and name = 'Changed after order';

create index if not exists payment_provider_events_attempt_id_idx
  on public.payment_provider_events (attempt_id);
create index if not exists payment_provider_events_payment_id_idx
  on public.payment_provider_events (payment_id);
create index if not exists payments_payment_request_id_idx
  on public.payments (payment_request_id);
create index if not exists payment_attempts_payment_id_idx
  on public.payment_attempts (payment_id);
create index if not exists payment_allocations_invoice_id_idx
  on public.payment_allocations (invoice_id);
create index if not exists financial_ledger_entries_invoice_id_idx
  on public.financial_ledger_entries (invoice_id);
create index if not exists financial_ledger_entries_payment_id_idx
  on public.financial_ledger_entries (payment_id);
create index if not exists financial_ledger_entries_receipt_id_idx
  on public.financial_ledger_entries (receipt_id);
create index if not exists store_orders_organization_id_idx
  on public.store_orders (organization_id);
create index if not exists store_orders_individual_user_id_idx
  on public.store_orders (individual_user_id);
create index if not exists store_orders_invoice_id_idx
  on public.store_orders (invoice_id);
create index if not exists payment_requests_organization_id_idx
  on public.payment_requests (organization_id);
create index if not exists payment_requests_individual_user_id_idx
  on public.payment_requests (individual_user_id);
create index if not exists projects_individual_user_id_idx
  on public.projects (individual_user_id);
create index if not exists work_requests_individual_user_id_idx
  on public.work_requests (individual_user_id);
create index if not exists automation_runs_event_id_idx
  on public.automation_runs (event_id);
create index if not exists invoices_project_id_idx
  on public.invoices (project_id);
create index if not exists store_order_items_product_id_idx
  on public.store_order_items (product_id);
create index if not exists deliverable_files_file_id_idx
  on public.deliverable_files (file_id);
create index if not exists reconciliation_items_matched_payment_id_idx
  on public.reconciliation_items (matched_payment_id);
create index if not exists notifications_recipient_created_idx
  on public.notifications (recipient_user_id, created_at desc);
create index if not exists payments_status_idx
  on public.payments (status);
