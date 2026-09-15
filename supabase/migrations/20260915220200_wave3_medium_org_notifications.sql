-- Wave 3 medium: trusted outbox kick from work-request insert, and
-- organization-owner notification recipients.

create or replace function public.work_request_submitted_enqueue()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  if new.status = 'submitted' then
    perform public.internal_enqueue_domain_event(
      'work_request.submitted',
      'work_request',
      new.id,
      jsonb_build_object('public_id', new.public_id)
    );
    perform public.process_pending_outbox();
  end if;
  return new;
end;
$$;

revoke all on function public.work_request_submitted_enqueue() from public, anon, authenticated;

create or replace function public.internal_organization_owner_user_id(p_organization_id uuid)
returns uuid
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select membership.user_id
  from public.organization_memberships as membership
  where membership.organization_id = p_organization_id
    and membership.role = 'owner'
  order by membership.created_at
  limit 1;
$$;

revoke all on function public.internal_organization_owner_user_id(uuid)
  from public, anon, authenticated;

create or replace function public.internal_execute_automation_action(
  p_rule public.automation_rules,
  p_event public.domain_outbox_events
)
returns void
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  recipient uuid;
  admin_row record;
  title text;
  body text;
begin
  if p_rule.action_type = 'development_fail' then
    if public.payment_runtime_environment() is distinct from 'development' then
      raise exception 'development fail action is not available';
    end if;
    raise exception 'synthetic automation failure';
  end if;

  title := coalesce(p_rule.configuration->>'title', 'Flash One update');
  body := coalesce(p_rule.configuration->>'body', 'A platform event was recorded.');

  if p_rule.action_type = 'create_notification' then
    recipient := null;
    if p_event.aggregate_type = 'store_order' then
      select coalesce(
        individual_user_id,
        public.internal_organization_owner_user_id(organization_id)
      ) into recipient
      from public.store_orders
      where id = p_event.aggregate_id;
    elsif p_event.aggregate_type = 'work_request' then
      select coalesce(
        created_by_user_id,
        public.internal_organization_owner_user_id(organization_id)
      ) into recipient
      from public.work_requests
      where id = p_event.aggregate_id;
    elsif p_event.aggregate_type = 'payment' then
      select coalesce(
        individual_user_id,
        public.internal_organization_owner_user_id(organization_id)
      ) into recipient
      from public.payments
      where id = p_event.aggregate_id;
    end if;
    if recipient is null then
      return;
    end if;
    perform public.internal_create_notification(
      recipient,
      coalesce(p_rule.configuration->>'notification_type', 'automation'),
      title,
      body,
      p_event.aggregate_type,
      coalesce(p_event.safe_payload->>'public_id', p_event.aggregate_id::text)
    );
    return;
  end if;

  if p_rule.action_type = 'create_admin_follow_up' then
    for admin_row in
      select user_id from public.user_platform_roles where role = 'admin'
    loop
      perform public.internal_create_notification(
        admin_row.user_id,
        'admin_follow_up',
        title,
        body,
        p_event.aggregate_type,
        coalesce(p_event.safe_payload->>'public_id', p_event.aggregate_id::text)
      );
    end loop;
    return;
  end if;

  raise exception 'unsupported automation action';
end;
$$;

revoke all on function public.internal_execute_automation_action(public.automation_rules, public.domain_outbox_events)
  from public, anon, authenticated;
