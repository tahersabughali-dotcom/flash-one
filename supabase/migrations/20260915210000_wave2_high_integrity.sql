-- Flash One Wave 2: HIGH payment mismatch, AI assistant trust, conversation insert revoke.
-- F-PAY-004: mismatch is review_required, not ordinary succeeded payment.
-- F-AI-001: customers cannot author assistant messages or plant suggestions.

-- ---------------------------------------------------------------------------
-- F-PAY-004 status model
-- ---------------------------------------------------------------------------
alter table public.payments
  drop constraint if exists payments_status_check;

alter table public.payments
  add constraint payments_status_check
  check (status in (
    'pending',
    'succeeded',
    'failed',
    'cancelled',
    'refunded',
    'partially_refunded',
    'review_required'
  ));

update public.payments p
set status = 'review_required'
where p.status = 'succeeded'
  and p.review_required is true
  and exists (
    select 1
    from public.payment_provider_events e
    where e.payment_id = p.id
      and e.processing_status = 'mismatch'
  );

-- ---------------------------------------------------------------------------
-- Finalize: mismatch is evidence + review, not commercial success
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
  is_review boolean;
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
    is_review := existing.status = 'review_required' or existing.review_required is true;
    update public.payment_attempts
      set payment_id = coalesce(payment_id, existing.id),
          status = case when is_review then 'review_required' else 'succeeded' end,
          completed_at = coalesce(completed_at, now())
      where id = attempt.id;
    update public.payment_requests
      set status = 'completed', completed_at = coalesce(completed_at, now())
      where id = attempt.payment_request_id and status = 'active' and is_review is not true;
    update public.payment_provider_events
      set processing_status = case when is_review then 'mismatch' else 'processed' end,
          payment_id = existing.id,
          verified_at = coalesce(verified_at, now())
      where id = event.id;
    if is_review is not true then
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
        'review_required', attempt.provider, attempt.provider, event.provider_reference, now(), request.id, attempt.id, true
      )
      returning * into created;
    exception when unique_violation then
      select * into created from public.payments where payment_attempt_id = attempt.id;
      return created;
    end;
    insert into public.reconciliation_items (source_type, external_reference, currency, amount_minor, status, notes, matched_payment_id)
    values (
      case when attempt.provider = 'development_test' then 'development_test' else 'provider_event' end,
      event.external_event_id,
      created.currency,
      created.amount_minor,
      'unmatched',
      'Provider amount or currency did not match the attempt. Recorded for review. Not treated as the expected payment.',
      created.id
    );
    update public.payment_attempts
      set status = 'review_required',
          payment_id = created.id,
          review_reason = 'Provider amount or currency did not match the attempt.',
          completed_at = now()
      where id = attempt.id;
    update public.payment_provider_events
      set processing_status = 'mismatch',
          payment_id = created.id,
          verified_at = coalesce(verified_at, now())
      where id = event.id;
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
      set processing_status = case when created.status = 'review_required' or created.review_required then 'mismatch' else 'processed' end,
          payment_id = created.id,
          verified_at = coalesce(verified_at, now())
      where id = event.id;
    if created.status is distinct from 'review_required' and created.review_required is not true then
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

revoke all on function public.finalize_confirmed_payment(uuid)
  from public, anon, authenticated, service_role;

-- ---------------------------------------------------------------------------
-- F-AI-001: trusted assistant writer is service_role only
-- ---------------------------------------------------------------------------
revoke all on function public.insert_assistant_ai_message(text, text, jsonb)
  from public, anon, authenticated, service_role;

create or replace function public.insert_verified_assistant_ai_message(
  p_conversation_public_id text,
  p_body text,
  p_suggestion jsonb
)
returns public.ai_messages
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  conversation public.ai_conversations;
  last_role text;
  created public.ai_messages;
begin
  if nullif(btrim(p_conversation_public_id), '') is null then
    raise exception 'conversation not found';
  end if;
  if nullif(btrim(p_body), '') is null then
    raise exception 'assistant message not expected';
  end if;
  select * into conversation
  from public.ai_conversations
  where public_id = p_conversation_public_id
  for update;
  if conversation.id is null then
    raise exception 'conversation not found';
  end if;
  select role into last_role
  from public.ai_messages
  where conversation_id = conversation.id
  order by created_at desc
  limit 1;
  if last_role is distinct from 'user' then
    raise exception 'assistant message not expected';
  end if;
  insert into public.ai_messages (
    conversation_id, role, body, structured_suggestion
  ) values (
    conversation.id, 'assistant', btrim(p_body), p_suggestion
  )
  returning * into created;
  if p_suggestion is not null then
    update public.ai_conversations
    set pending_suggestion = p_suggestion
    where id = conversation.id;
  end if;
  return created;
end;
$$;

revoke all on function public.insert_verified_assistant_ai_message(text, text, jsonb)
  from public, anon, authenticated;
grant execute on function public.insert_verified_assistant_ai_message(text, text, jsonb)
  to service_role;

create or replace function public.confirm_ai_work_request_suggestion(
  p_conversation_public_id text,
  p_owner text
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  actor uuid;
  conversation public.ai_conversations;
  suggestion jsonb;
  individual_id uuid;
  organization_id uuid;
  created public.work_requests;
begin
  actor := (select auth.uid());
  if actor is null then
    raise exception 'not authenticated';
  end if;
  select * into conversation
  from public.ai_conversations
  where public_id = p_conversation_public_id
  for update;
  if conversation.id is null or conversation.user_id is distinct from actor then
    raise exception 'conversation not found';
  end if;
  if conversation.suggestion_consumed_at is not null then
    raise exception 'suggestion already used';
  end if;
  select structured_suggestion into suggestion
  from public.ai_messages
  where conversation_id = conversation.id
    and role = 'assistant'
    and structured_suggestion is not null
  order by created_at desc
  limit 1;
  if suggestion is null then
    raise exception 'no suggestion to confirm';
  end if;
  if coalesce(suggestion->>'title', '') = '' or coalesce(suggestion->>'summary', '') = '' then
    raise exception 'suggestion is incomplete';
  end if;
  if p_owner = 'individual' then
    select user_id into individual_id from public.individual_accounts where user_id = actor;
    if individual_id is null then
      raise exception 'create an individual relationship before submitting for yourself';
    end if;
  elsif p_owner like 'org:%' then
    select id into organization_id
    from public.organizations
    where public_id = substr(p_owner, 5);
    if organization_id is null or not public.is_organization_member(organization_id) then
      raise exception 'not authorized';
    end if;
  else
    raise exception 'choose who this request is for';
  end if;
  insert into public.work_requests (
    created_by_user_id, individual_user_id, organization_id,
    title, summary, details, service_category, status
  ) values (
    actor,
    individual_id,
    organization_id,
    left(suggestion->>'title', 160),
    left(suggestion->>'summary', 2000),
    nullif(left(coalesce(suggestion->>'details', ''), 8000), ''),
    case
      when suggestion->>'service_category' in (
        'software_development', 'automation_ai', 'it_consultancy',
        'technology_services', 'other'
      ) then suggestion->>'service_category'
      else 'other'
    end,
    'submitted'
  )
  returning * into created;
  update public.ai_conversations
  set suggestion_consumed_at = now()
  where id = conversation.id;
  return jsonb_build_object('work_request_public_id', created.public_id);
end;
$$;

revoke all on function public.confirm_ai_work_request_suggestion(text, text) from public, anon;
grant execute on function public.confirm_ai_work_request_suggestion(text, text) to authenticated;

revoke insert on table public.ai_conversations from authenticated;
drop policy if exists ai_conversations_insert_own on public.ai_conversations;
