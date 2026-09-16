-- F-MIG-001 reconciliation: restore domain/payment triggers omitted from
-- consolidated local platform_completion while present on Development via
-- historical MCP chunk migrations (platform_completion_domain_triggers /
-- payment_finalize_store_outbox_hooks).
--
-- Idempotent. Does not mutate business/financial row data.
-- Safe on Development (objects already exist) and required for clean replay.

create or replace function public.outbox_after_insert_process()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  begin
    perform public.process_pending_outbox();
  exception when others then
    null;
  end;
  return new;
end;
$$;

revoke all on function public.outbox_after_insert_process() from public, anon, authenticated;

create or replace function public.payment_request_completed_store_hook()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  if new.status = 'completed' and old.status is distinct from 'completed' then
    perform public.internal_apply_store_order_paid(new.id);
  end if;
  return new;
end;
$$;

revoke all on function public.payment_request_completed_store_hook() from public, anon, authenticated;

create or replace function public.payment_succeeded_enqueue()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  if new.status = 'succeeded' then
    perform public.internal_enqueue_domain_event(
      'payment.confirmed',
      'payment',
      new.id,
      jsonb_build_object(
        'public_id', new.public_id,
        'review_required', new.review_required
      )
    );
  end if;
  return new;
end;
$$;

revoke all on function public.payment_succeeded_enqueue() from public, anon, authenticated;

drop trigger if exists domain_outbox_events_process on public.domain_outbox_events;
create trigger domain_outbox_events_process
  after insert on public.domain_outbox_events
  for each row
  execute function public.outbox_after_insert_process();

drop trigger if exists payment_requests_store_paid on public.payment_requests;
create trigger payment_requests_store_paid
  after update of status on public.payment_requests
  for each row
  execute function public.payment_request_completed_store_hook();

drop trigger if exists payments_enqueue_confirmed on public.payments;
create trigger payments_enqueue_confirmed
  after insert on public.payments
  for each row
  execute function public.payment_succeeded_enqueue();
