-- Flash One Wave 1: payment ingest trust boundary and one-payment-per-attempt.
-- F-PAY-001: provider confirmation is not a public RPC and not ingest_key possession.
-- F-PAY-002: at most one canonical Payment per non-null payment_attempt_id.

-- ---------------------------------------------------------------------------
-- F-PAY-002 uniqueness (NULLs remain allowed for manual payments)
-- PostgreSQL UNIQUE treats NULLs as distinct, so manual payments with
-- payment_attempt_id IS NULL may coexist. Non-null attempt ids are unique.
-- ---------------------------------------------------------------------------
alter table public.payments
  add constraint payments_payment_attempt_id_key unique (payment_attempt_id);

-- ---------------------------------------------------------------------------
-- Finalize: lock attempt, reuse existing payment, unique-safe insert
-- ---------------------------------------------------------------------------
create or replace function public.finalize_confirmed_payment(p_event_id uuid)
returns public.payments
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  event public.payment_provider_events;
  attempt public.payment_attempts;
  request public.payment_requests;
  invoice public.invoices;
  created public.payments;
  due bigint;
  allocate_amount bigint;
  existing public.payments;
begin
  select * into event from public.payment_provider_events where id = p_event_id for update;
  if event.id is null then raise exception 'provider event not found'; end if;
  if event.processing_status = 'processed' and event.payment_id is not null then
    select * into existing from public.payments where id = event.payment_id;
    return existing;
  end if;

  select * into attempt from public.payment_attempts where id = event.attempt_id for update;
  if attempt.id is null then raise exception 'payment attempt not found'; end if;

  select * into existing
  from public.payments
  where payment_attempt_id = attempt.id
  for update;
  if existing.id is not null then
    update public.payment_attempts
      set payment_id = coalesce(payment_id, existing.id),
          status = case
            when existing.review_required then 'review_required'
            else 'succeeded'
          end,
          completed_at = coalesce(completed_at, now())
      where id = attempt.id;
    update public.payment_requests
      set status = 'completed', completed_at = coalesce(completed_at, now())
      where id = attempt.payment_request_id and status = 'active'
        and existing.review_required is not true;
    update public.payment_provider_events
      set processing_status = 'processed',
          payment_id = existing.id,
          verified_at = coalesce(verified_at, now())
      where id = event.id;
    if existing.review_required is not true then
      perform public.internal_apply_store_order_paid(attempt.payment_request_id);
    end if;
    return existing;
  end if;

  select * into request from public.payment_requests where id = attempt.payment_request_id for update;
  if request.invoice_id is not null then
    select * into invoice from public.invoices where id = request.invoice_id for update;
  end if;

  if event.currency is distinct from attempt.currency or event.amount_minor is distinct from attempt.amount_minor then
    begin
      insert into public.payments (
        individual_user_id, organization_id, guest_email, guest_name,
        currency, amount_minor, status, source_type, provider, provider_reference,
        received_at, payment_request_id, payment_attempt_id, review_required
      ) values (
        request.individual_user_id, request.organization_id, request.guest_email, request.guest_name,
        coalesce(event.currency, attempt.currency), coalesce(event.amount_minor, attempt.amount_minor),
        'succeeded', attempt.provider, attempt.provider, event.provider_reference, now(), request.id, attempt.id, true
      )
      returning * into created;
    exception when unique_violation then
      select * into created from public.payments where payment_attempt_id = attempt.id;
      return created;
    end;
    perform public.post_financial_ledger_entry('payment_received', created.currency, created.amount_minor, 'in', created.id, null, null, created.public_id);
    perform public.internal_issue_receipt(created.id);
    insert into public.reconciliation_items (source_type, external_reference, currency, amount_minor, status, notes, matched_payment_id)
    values (case when attempt.provider = 'development_test' then 'development_test' else 'provider_event' end, event.external_event_id, created.currency, created.amount_minor, 'unmatched', 'Provider amount or currency did not match the attempt. Recorded for review. Not treated as the expected payment.', created.id);
    update public.payment_attempts set status = 'review_required', payment_id = created.id, review_reason = 'Provider amount or currency did not match the attempt.', completed_at = now() where id = attempt.id;
    update public.payment_provider_events set processing_status = 'mismatch', payment_id = created.id, verified_at = coalesce(verified_at, now()) where id = event.id;
    perform public.internal_enqueue_domain_event(
      'payment.confirmed',
      'payment',
      created.id,
      jsonb_build_object('public_id', created.public_id, 'review_required', true)
    );
    select * into created from public.payments where id = created.id;
    return created;
  end if;

  begin
    insert into public.payments (
      individual_user_id, organization_id, guest_email, guest_name,
      currency, amount_minor, status, source_type, provider, provider_reference,
      received_at, payment_request_id, payment_attempt_id, review_required
    ) values (
      request.individual_user_id, request.organization_id, request.guest_email, request.guest_name,
      attempt.currency, attempt.amount_minor, 'succeeded', attempt.provider, attempt.provider, event.provider_reference, now(), request.id, attempt.id, false
    )
    returning * into created;
  exception when unique_violation then
    select * into created from public.payments where payment_attempt_id = attempt.id;
    update public.payment_provider_events
      set processing_status = 'processed', payment_id = created.id, verified_at = coalesce(verified_at, now())
      where id = event.id;
    if created.review_required is not true then
      perform public.internal_apply_store_order_paid(attempt.payment_request_id);
    end if;
    return created;
  end;

  perform public.post_financial_ledger_entry('payment_received', created.currency, created.amount_minor, 'in', created.id, null, null, created.public_id);
  perform public.internal_issue_receipt(created.id);
  if request.invoice_id is not null and invoice.id is not null then
    due := invoice.total_minor - public.invoice_allocated_minor(invoice.id);
    if due > 0 and created.currency = invoice.currency then
      allocate_amount := least(created.amount_minor, due);
      begin
        perform public.internal_allocate_payment(created.id, invoice.id, allocate_amount, null);
      exception when others then
        update public.payments set review_required = true where id = created.id;
      end;
    elsif due <= 0 then
      update public.payments set review_required = true where id = created.id;
    end if;
  end if;
  update public.payment_attempts set status = 'succeeded', payment_id = created.id, completed_at = now() where id = attempt.id;
  update public.payment_requests set status = 'completed', completed_at = now() where id = request.id and status = 'active';
  update public.payment_provider_events set processing_status = 'processed', payment_id = created.id, verified_at = coalesce(verified_at, now()) where id = event.id;
  insert into public.reconciliation_items (source_type, external_reference, currency, amount_minor, status, notes, matched_payment_id, reconciled_at)
  values (case when attempt.provider = 'development_test' then 'development_test' else 'provider_event' end, event.external_event_id, created.currency, created.amount_minor, 'matched', 'Provider-confirmed event linked to an internal payment. Matching is not a separate sale.', created.id, now());
  perform public.internal_apply_store_order_paid(request.id);
  perform public.internal_enqueue_domain_event(
    'payment.confirmed',
    'payment',
    created.id,
    jsonb_build_object('public_id', created.public_id, 'review_required', false)
  );
  select * into created from public.payments where id = created.id;
  return created;
end;
$$;

revoke all on function public.finalize_confirmed_payment(uuid) from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- create_payment_attempt: do not return ingest_key
-- ---------------------------------------------------------------------------
create or replace function public.create_payment_attempt(
  p_request_public_id text,
  p_provider text,
  p_amount_minor bigint,
  p_guest_name text,
  p_guest_email text
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public, extensions
as $$
declare
  request public.payment_requests;
  provider public.payment_providers;
  invoice public.invoices;
  amount bigint;
  ingest_raw text;
  created public.payment_attempts;
  recent integer;
begin
  select * into request from public.payment_requests where public_id = p_request_public_id for update;
  if request.id is null then raise exception 'payment request not found'; end if;
  if request.expires_at is not null and request.expires_at <= now() then
    update public.payment_requests set status = 'expired' where id = request.id and status = 'active';
    raise exception 'payment request expired';
  end if;
  if request.status <> 'active' then raise exception 'payment request is not active'; end if;
  select * into provider from public.payment_providers where code = p_provider;
  if provider.code is null then raise exception 'provider not found'; end if;
  if provider.eligibility = 'business_only' and request.organization_id is null then
    raise exception 'this payment method is for business customers only';
  end if;
  if provider.operational_state <> 'enabled' then raise exception 'payment method unavailable'; end if;
  if coalesce((provider.capabilities->>'checkout')::boolean, false) is not true then raise exception 'payment method unavailable'; end if;
  if provider.code = 'development_test' and public.payment_runtime_environment() is distinct from 'development' then
    raise exception 'payment method unavailable';
  end if;
  if not (request.currency = any (provider.supported_currencies)) then raise exception 'unsupported currency'; end if;
  if request.amount_mode = 'fixed' then amount := request.requested_amount_minor;
  else
    amount := p_amount_minor;
    if amount is null or amount < request.min_amount_minor or amount > request.max_amount_minor then raise exception 'invalid payment amount'; end if;
  end if;
  if amount is null or amount <= 0 then raise exception 'invalid payment amount'; end if;
  if request.invoice_id is not null then
    select * into invoice from public.invoices where id = request.invoice_id for update;
    if invoice.status not in ('issued', 'partially_paid') then raise exception 'invoice is not payable'; end if;
    if request.currency is distinct from invoice.currency then raise exception 'currency mismatch'; end if;
    if amount > (invoice.total_minor - invoice.amount_paid_minor) then raise exception 'cannot request more than invoice amount due'; end if;
  end if;
  select count(*) into recent from public.payment_attempts where payment_request_id = request.id and created_at > now() - interval '1 hour';
  if recent >= 20 then raise exception 'payment could not be started'; end if;
  if request.guest_email is not null and request.individual_user_id is null and request.organization_id is null then
    if nullif(btrim(p_guest_email), '') is null then raise exception 'guest email is required'; end if;
  end if;
  ingest_raw := encode(gen_random_bytes(32), 'hex');
  insert into public.payment_attempts (payment_request_id, provider, currency, amount_minor, status, ingest_key_hash)
  values (request.id, provider.code, request.currency, amount, 'pending', public.sha256_hex(ingest_raw))
  returning * into created;
  return jsonb_build_object(
    'public_id', created.public_id,
    'status', created.status,
    'provider', created.provider,
    'currency', created.currency,
    'amount_minor', created.amount_minor
  );
end;
$$;

revoke all on function public.create_payment_attempt(text, text, bigint, text, text) from public;
grant execute on function public.create_payment_attempt(text, text, bigint, text, text) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Legacy ingest_provider_event: keep body for owner-only emergency use, revoke API
-- ---------------------------------------------------------------------------
revoke all on function public.ingest_provider_event(text, text, text, text, text, bigint, text, text)
  from public, anon, authenticated, service_role;

revoke all on function public.finalize_confirmed_payment(uuid)
  from public, anon, authenticated, service_role;

-- ---------------------------------------------------------------------------
-- Trusted ingest: attempt public id + service_role only. No ingest_key authority.
-- ---------------------------------------------------------------------------
create or replace function public.ingest_verified_provider_event(
  p_attempt_public_id text,
  p_provider text,
  p_external_event_id text,
  p_event_type text,
  p_outcome text,
  p_amount_minor bigint,
  p_currency text,
  p_provider_reference text
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  attempt public.payment_attempts;
  existing public.payment_provider_events;
  event public.payment_provider_events;
  payment public.payments;
begin
  if nullif(btrim(p_attempt_public_id), '') is null then raise exception 'payment attempt not found'; end if;
  if nullif(btrim(p_external_event_id), '') is null then raise exception 'provider event not found'; end if;
  select * into attempt from public.payment_attempts where public_id = p_attempt_public_id for update;
  if attempt.id is null then raise exception 'payment attempt not found'; end if;
  if attempt.provider is distinct from p_provider then raise exception 'payment method unavailable'; end if;
  if p_provider = 'development_test' and public.payment_runtime_environment() is distinct from 'development' then
    raise exception 'payment method unavailable';
  end if;
  select * into existing from public.payment_provider_events where provider = p_provider and external_event_id = p_external_event_id;
  if existing.id is not null then
    if existing.payment_id is not null then
      select * into payment from public.payments where id = existing.payment_id;
      return jsonb_build_object('duplicate', true, 'processing_status', existing.processing_status, 'payment_public_id', payment.public_id, 'attempt_public_id', attempt.public_id, 'attempt_status', attempt.status);
    end if;
    if existing.processing_status in ('processed', 'mismatch') then
      return jsonb_build_object('duplicate', true, 'processing_status', existing.processing_status, 'attempt_public_id', attempt.public_id, 'attempt_status', attempt.status);
    end if;
    event := existing;
  else
    insert into public.payment_provider_events (provider, external_event_id, event_type, processing_status, attempt_id, currency, amount_minor, provider_reference, safe_metadata, verified_at)
    values (p_provider, p_external_event_id, p_event_type, 'received', attempt.id, p_currency, p_amount_minor, p_provider_reference, jsonb_build_object('outcome', p_outcome), now())
    returning * into event;
  end if;
  if p_outcome = 'failed' then
    update public.payment_attempts set status = 'failed', completed_at = now() where id = attempt.id and status in ('created', 'pending', 'redirected', 'processing');
    update public.payment_provider_events set processing_status = 'ignored', error_state = 'provider_reported_failure' where id = event.id;
    return jsonb_build_object('attempt_public_id', attempt.public_id, 'attempt_status', 'failed');
  end if;
  if p_outcome = 'cancelled' then
    update public.payment_attempts set status = 'cancelled', completed_at = now() where id = attempt.id and status in ('created', 'pending', 'redirected', 'processing');
    update public.payment_provider_events set processing_status = 'ignored', error_state = 'provider_reported_cancellation' where id = event.id;
    return jsonb_build_object('attempt_public_id', attempt.public_id, 'attempt_status', 'cancelled');
  end if;
  if p_outcome <> 'succeeded' then raise exception 'unsupported provider outcome'; end if;
  payment := public.finalize_confirmed_payment(event.id);
  select * into attempt from public.payment_attempts where id = attempt.id;
  return jsonb_build_object('attempt_public_id', attempt.public_id, 'attempt_status', attempt.status, 'payment_public_id', payment.public_id, 'review_required', payment.review_required);
end;
$$;

revoke all on function public.ingest_verified_provider_event(text, text, text, text, text, bigint, text, text)
  from public, anon, authenticated;
grant execute on function public.ingest_verified_provider_event(text, text, text, text, text, bigint, text, text)
  to service_role;

-- ---------------------------------------------------------------------------
-- Development-only trusted confirmation. Amount comes from the attempt, not caller.
-- ---------------------------------------------------------------------------
create or replace function public.confirm_development_test_payment(p_attempt_public_id text)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  attempt public.payment_attempts;
begin
  if public.payment_runtime_environment() is distinct from 'development' then
    raise exception 'payment method unavailable';
  end if;
  select * into attempt from public.payment_attempts where public_id = p_attempt_public_id for update;
  if attempt.id is null then raise exception 'payment attempt not found'; end if;
  if attempt.provider is distinct from 'development_test' then
    raise exception 'payment method unavailable';
  end if;
  return public.ingest_verified_provider_event(
    attempt.public_id,
    'development_test',
    'development-confirm:' || attempt.public_id,
    'development.confirmed',
    'succeeded',
    attempt.amount_minor,
    attempt.currency,
    'development-confirm:' || attempt.public_id
  );
end;
$$;

revoke all on function public.confirm_development_test_payment(text)
  from public, anon, authenticated;
grant execute on function public.confirm_development_test_payment(text)
  to service_role;
