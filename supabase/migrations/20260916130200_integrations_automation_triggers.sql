-- Phase 4 RPCs: settings, automations, AI audience, enqueue helpers.

create or replace function public.internal_safe_enqueue_and_process(
  p_event_type text,
  p_aggregate_type text,
  p_aggregate_id uuid,
  p_payload jsonb
)
returns void
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  perform public.internal_enqueue_domain_event(
    p_event_type,
    p_aggregate_type,
    p_aggregate_id,
    coalesce(p_payload, '{}'::jsonb)
  );
  begin
    perform public.process_pending_outbox();
  exception
    when others then
      null;
  end;
exception
  when others then
    null;
end;
$$;

revoke all on function public.internal_safe_enqueue_and_process(text, text, uuid, jsonb)
  from public, anon, authenticated;

create or replace function public.quote_automation_enqueue()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  if tg_op = 'INSERT' and new.status = 'sent' then
    perform public.internal_safe_enqueue_and_process(
      'quote.issued', 'quote', new.id, jsonb_build_object('public_id', new.public_id)
    );
  elsif tg_op = 'UPDATE' and new.status = 'sent' and old.status is distinct from 'sent' then
    perform public.internal_safe_enqueue_and_process(
      'quote.issued', 'quote', new.id, jsonb_build_object('public_id', new.public_id)
    );
  elsif tg_op = 'UPDATE' and new.status = 'accepted' and old.status is distinct from 'accepted' then
    perform public.internal_safe_enqueue_and_process(
      'quote.accepted', 'quote', new.id, jsonb_build_object('public_id', new.public_id)
    );
  end if;
  return new;
end;
$$;

revoke all on function public.quote_automation_enqueue() from public, anon, authenticated;

drop trigger if exists quotes_automation_enqueue on public.quotes;
create trigger quotes_automation_enqueue
  after insert or update of status on public.quotes
  for each row
  execute function public.quote_automation_enqueue();

create or replace function public.project_automation_enqueue()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  if tg_op = 'INSERT' then
    perform public.internal_safe_enqueue_and_process(
      'project.created', 'project', new.id, jsonb_build_object('public_id', new.public_id)
    );
  end if;
  return new;
end;
$$;

revoke all on function public.project_automation_enqueue() from public, anon, authenticated;

drop trigger if exists projects_automation_enqueue on public.projects;
create trigger projects_automation_enqueue
  after insert on public.projects
  for each row
  execute function public.project_automation_enqueue();

create or replace function public.assignment_automation_enqueue()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  if tg_op = 'INSERT' then
    perform public.internal_safe_enqueue_and_process(
      'project.assignment',
      'project_team_assignment',
      new.id,
      jsonb_build_object('public_id', new.public_id)
    );
  end if;
  return new;
end;
$$;

revoke all on function public.assignment_automation_enqueue() from public, anon, authenticated;

drop trigger if exists project_team_automation_enqueue on public.project_team_assignments;
create trigger project_team_automation_enqueue
  after insert on public.project_team_assignments
  for each row
  execute function public.assignment_automation_enqueue();

create or replace function public.task_assignment_automation_enqueue()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  if tg_op = 'UPDATE'
    and new.assignee_kind is not null
    and (
      old.assignee_kind is distinct from new.assignee_kind
      or old.assignee_employee_id is distinct from new.assignee_employee_id
      or old.assignee_freelancer_id is distinct from new.assignee_freelancer_id
      or old.assignee_developer_user_id is distinct from new.assignee_developer_user_id
    )
  then
    perform public.internal_safe_enqueue_and_process(
      'task.assignment', 'project_task', new.id, jsonb_build_object('public_id', new.public_id)
    );
  end if;
  return new;
end;
$$;

revoke all on function public.task_assignment_automation_enqueue() from public, anon, authenticated;

drop trigger if exists project_tasks_assignment_enqueue on public.project_tasks;
create trigger project_tasks_assignment_enqueue
  after update on public.project_tasks
  for each row
  execute function public.task_assignment_automation_enqueue();

create or replace function public.deliverable_automation_enqueue()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  if tg_op = 'UPDATE' and new.status = 'submitted' and old.status is distinct from 'submitted' then
    perform public.internal_safe_enqueue_and_process(
      'deliverable.submitted', 'deliverable', new.id, jsonb_build_object('public_id', new.public_id)
    );
  end if;
  return new;
end;
$$;

revoke all on function public.deliverable_automation_enqueue() from public, anon, authenticated;

drop trigger if exists deliverables_automation_enqueue on public.deliverables;
create trigger deliverables_automation_enqueue
  after update of status on public.deliverables
  for each row
  execute function public.deliverable_automation_enqueue();

create or replace function public.invoice_automation_enqueue()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  if new.status = 'issued' and (tg_op = 'INSERT' or old.status is distinct from 'issued') then
    perform public.internal_safe_enqueue_and_process(
      'invoice.issued', 'invoice', new.id, jsonb_build_object('public_id', new.public_id)
    );
  end if;
  return new;
end;
$$;

revoke all on function public.invoice_automation_enqueue() from public, anon, authenticated;

drop trigger if exists invoices_automation_enqueue on public.invoices;
create trigger invoices_automation_enqueue
  after insert or update of status on public.invoices
  for each row
  execute function public.invoice_automation_enqueue();

create or replace function public.payment_recorded_automation_enqueue()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  if new.status = 'succeeded' and (tg_op = 'INSERT' or old.status is distinct from 'succeeded') then
    perform public.internal_safe_enqueue_and_process(
      'payment.recorded', 'payment', new.id, jsonb_build_object('public_id', new.public_id)
    );
  end if;
  return new;
end;
$$;

revoke all on function public.payment_recorded_automation_enqueue() from public, anon, authenticated;

drop trigger if exists payments_recorded_automation_enqueue on public.payments;
create trigger payments_recorded_automation_enqueue
  after insert or update of status on public.payments
  for each row
  execute function public.payment_recorded_automation_enqueue();

create or replace function public.refund_automation_enqueue()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  if tg_op = 'UPDATE' and old.status is distinct from new.status then
    perform public.internal_safe_enqueue_and_process(
      'refund.status', 'refund', new.id, jsonb_build_object('public_id', new.public_id, 'status', new.status)
    );
  end if;
  return new;
end;
$$;

revoke all on function public.refund_automation_enqueue() from public, anon, authenticated;

drop trigger if exists refunds_automation_enqueue on public.refunds;
create trigger refunds_automation_enqueue
  after update of status on public.refunds
  for each row
  execute function public.refund_automation_enqueue();

create or replace function public.case_automation_enqueue()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  if tg_op = 'INSERT' then
    perform public.internal_safe_enqueue_and_process(
      'case.created', 'support_case', new.id, jsonb_build_object('public_id', new.public_id)
    );
  elsif tg_op = 'UPDATE' and (
    old.status is distinct from new.status
    or old.priority is distinct from new.priority
  ) then
    perform public.internal_safe_enqueue_and_process(
      'case.updated', 'support_case', new.id, jsonb_build_object('public_id', new.public_id)
    );
  end if;
  return new;
end;
$$;

revoke all on function public.case_automation_enqueue() from public, anon, authenticated;

drop trigger if exists support_cases_automation_enqueue on public.support_cases;
create trigger support_cases_automation_enqueue
  after insert or update on public.support_cases
  for each row
  execute function public.case_automation_enqueue();

create or replace function public.payout_approved_automation_enqueue()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  if new.status = 'approved' and (tg_op = 'INSERT' or old.status is distinct from 'approved') then
    perform public.internal_safe_enqueue_and_process(
      'payout.approved', 'payout', new.id, jsonb_build_object('public_id', new.public_id)
    );
  end if;
  return new;
end;
$$;

revoke all on function public.payout_approved_automation_enqueue() from public, anon, authenticated;

drop trigger if exists payouts_approved_automation_enqueue on public.payouts;
create trigger payouts_approved_automation_enqueue
  after insert or update of status on public.payouts
  for each row
  execute function public.payout_approved_automation_enqueue();
