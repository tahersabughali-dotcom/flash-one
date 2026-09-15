-- Wave 3 medium: outbox retry semantics. Public EXECUTE remains revoked.

create or replace function public.process_pending_outbox()
returns integer
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  event public.domain_outbox_events;
  rule public.automation_rules;
  processed integer := 0;
  existing public.automation_runs;
  rule_failed boolean;
  next_attempt integer;
begin
  for event in
    select * from public.domain_outbox_events
    where processing_status = 'pending'
    order by occurred_at
    for update skip locked
  loop
    update public.domain_outbox_events
    set attempt_count = least(attempt_count + 1, 3)
    where id = event.id
    returning attempt_count into next_attempt;

    rule_failed := false;

    for rule in
      select * from public.automation_rules
      where enabled
        and event_type = event.event_type
        and (
          action_type <> 'development_fail'
          or public.payment_runtime_environment() = 'development'
        )
    loop
      existing := null;
      select * into existing
      from public.automation_runs
      where rule_id = rule.id and event_id = event.id;

      if existing.id is not null and existing.status = 'succeeded' then
        continue;
      end if;

      begin
        perform public.internal_execute_automation_action(rule, event);
        if existing.id is not null then
          update public.automation_runs
          set status = 'succeeded',
              error_summary = null,
              finished_at = now()
          where id = existing.id;
        else
          insert into public.automation_runs (rule_id, event_id, status, finished_at)
          values (rule.id, event.id, 'succeeded', now());
        end if;
      exception when others then
        rule_failed := true;
        if existing.id is not null then
          update public.automation_runs
          set status = 'failed',
              error_summary = left(sqlerrm, 200),
              finished_at = now()
          where id = existing.id;
        else
          insert into public.automation_runs (rule_id, event_id, status, error_summary, finished_at)
          values (rule.id, event.id, 'failed', left(sqlerrm, 200), now());
        end if;
        update public.domain_outbox_events
        set last_error = left(sqlerrm, 200)
        where id = event.id;
      end;
    end loop;

    if rule_failed then
      if next_attempt >= 3 then
        update public.domain_outbox_events
        set processing_status = 'failed',
            processed_at = now()
        where id = event.id;
      else
        update public.domain_outbox_events
        set processing_status = 'pending'
        where id = event.id;
      end if;
    else
      update public.domain_outbox_events
      set processing_status = 'processed',
          processed_at = now(),
          last_error = null
      where id = event.id;
    end if;

    processed := processed + 1;
  end loop;
  return processed;
end;
$$;

revoke all on function public.process_pending_outbox() from public, anon, authenticated;
