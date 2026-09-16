-- Phase 4 automation actions and admin configuration RPCs.

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
  created_task public.operational_tasks;
  created_case public.support_cases;
begin
  if p_rule.action_type = 'development_fail' then
    if public.payment_runtime_environment() is distinct from 'development' then
      raise exception 'development fail action is not available';
    end if;
    raise exception 'synthetic automation failure';
  end if;

  title := left(coalesce(p_rule.configuration->>'title', 'Flash One update'), 160);
  body := left(coalesce(p_rule.configuration->>'body', 'A platform event was recorded.'), 1000);

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
    elsif p_event.aggregate_type = 'invoice' then
      select coalesce(
        individual_user_id,
        public.internal_organization_owner_user_id(organization_id)
      ) into recipient
      from public.invoices
      where id = p_event.aggregate_id;
    elsif p_event.aggregate_type = 'support_case' then
      select coalesce(
        individual_user_id,
        public.internal_organization_owner_user_id(organization_id)
      ) into recipient
      from public.support_cases
      where id = p_event.aggregate_id
        and customer_visible = true;
    elsif p_event.aggregate_type = 'project' then
      select coalesce(
        individual_user_id,
        public.internal_organization_owner_user_id(organization_id)
      ) into recipient
      from public.projects
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

  if p_rule.action_type = 'create_operational_task' then
    insert into public.operational_tasks (
      title, description, status, priority, created_by_user_id
    ) values (
      title,
      left(body, 4000),
      'todo',
      'normal',
      null
    ) returning * into created_task;
    perform public.internal_record_operational_activity(
      'automation_task_created',
      'operational_task',
      created_task.public_id,
      'Automation created an internal follow-up task',
      null
    );
    return;
  end if;

  if p_rule.action_type = 'create_case' then
    insert into public.support_cases (
      title, case_type, priority, status, description, customer_visible, created_by_user_id
    ) values (
      title,
      'general',
      'normal',
      'open',
      left(body, 8000),
      false,
      null
    ) returning * into created_case;
    insert into public.support_case_events (case_id, event_type, summary, created_by_user_id)
    values (created_case.id, 'created', 'Opened by automation', null);
    return;
  end if;

  if p_rule.action_type = 'record_activity' then
    perform public.internal_record_operational_activity(
      'automation_activity',
      p_event.aggregate_type,
      coalesce(p_event.safe_payload->>'public_id', p_event.aggregate_id::text),
      left(title || ': ' || body, 400),
      null
    );
    return;
  end if;

  raise exception 'unsupported automation action';
end;
$$;

revoke all on function public.internal_execute_automation_action(public.automation_rules, public.domain_outbox_events)
  from public, anon, authenticated;

create or replace function public.admin_upsert_automation_rule(
  p_public_id text,
  p_name text,
  p_event_type text,
  p_action_type text,
  p_title text,
  p_body text,
  p_enabled boolean
)
returns public.automation_rules
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  actor uuid;
  current public.automation_rules;
  name_text text;
begin
  actor := public.assert_platform_admin();
  name_text := left(trim(coalesce(p_name, '')), 120);
  if name_text = '' then
    raise exception 'invalid automation rule';
  end if;
  if p_action_type in ('create_notification', 'create_admin_follow_up', 'create_operational_task', 'create_case', 'record_activity', 'development_fail') is not true then
    raise exception 'unsupported automation action';
  end if;
  if p_action_type = 'development_fail' and public.payment_runtime_environment() is distinct from 'development' then
    raise exception 'development fail action is not available';
  end if;
  if p_public_id is null or btrim(p_public_id) = '' then
    insert into public.automation_rules (
      name, event_type, action_type, enabled, configuration, created_by_user_id
    ) values (
      name_text,
      p_event_type,
      p_action_type,
      coalesce(p_enabled, false),
      jsonb_build_object(
        'title', left(trim(coalesce(p_title, name_text)), 160),
        'body', left(trim(coalesce(p_body, 'A platform event was recorded.')), 1000)
      ),
      actor
    ) returning * into current;
  else
    update public.automation_rules
    set
      name = name_text,
      event_type = p_event_type,
      action_type = p_action_type,
      enabled = coalesce(p_enabled, enabled),
      configuration = jsonb_build_object(
        'title', left(trim(coalesce(p_title, name_text)), 160),
        'body', left(trim(coalesce(p_body, 'A platform event was recorded.')), 1000)
      )
    where public_id = p_public_id
    returning * into current;
    if current.id is null then
      raise exception 'automation rule not found';
    end if;
  end if;
  perform public.admin_record_audit_event(
    'automation.upsert',
    'automation_rule',
    current.id,
    jsonb_build_object('public_id', current.public_id)
  );
  return current;
end;
$$;

revoke all on function public.admin_upsert_automation_rule(text, text, text, text, text, text, boolean)
  from public, anon;
grant execute on function public.admin_upsert_automation_rule(text, text, text, text, text, text, boolean)
  to authenticated;

create or replace function public.admin_update_company_settings(
  p_legal_company_name text,
  p_trading_name text,
  p_company_number text,
  p_registered_address text,
  p_country_code text,
  p_vat_registered boolean,
  p_vat_number text,
  p_public_email text,
  p_public_phone text,
  p_website text,
  p_support_contact text
)
returns public.company_settings
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  actor uuid;
  current public.company_settings;
begin
  actor := public.assert_platform_admin();
  update public.company_settings
  set
    legal_company_name = nullif(left(trim(coalesce(p_legal_company_name, '')), 160), ''),
    trading_name = nullif(left(trim(coalesce(p_trading_name, '')), 160), ''),
    company_number = nullif(left(trim(coalesce(p_company_number, '')), 80), ''),
    registered_address = nullif(left(trim(coalesce(p_registered_address, '')), 400), ''),
    country_code = nullif(upper(left(trim(coalesce(p_country_code, '')), 2)), ''),
    vat_registered = p_vat_registered,
    vat_number = nullif(left(trim(coalesce(p_vat_number, '')), 40), ''),
    public_email = nullif(left(trim(coalesce(p_public_email, '')), 160), ''),
    public_phone = nullif(left(trim(coalesce(p_public_phone, '')), 40), ''),
    website = nullif(left(trim(coalesce(p_website, '')), 200), ''),
    support_contact = nullif(left(trim(coalesce(p_support_contact, '')), 160), ''),
    updated_by_user_id = actor
  where singleton = true
  returning * into current;
  perform public.admin_record_audit_event('company_settings.update', 'company_settings', null, '{}'::jsonb);
  return current;
end;
$$;

revoke all on function public.admin_update_company_settings(text, text, text, text, text, boolean, text, text, text, text, text)
  from public, anon;
grant execute on function public.admin_update_company_settings(text, text, text, text, text, boolean, text, text, text, text, text)
  to authenticated;

create or replace function public.admin_update_brand_settings(
  p_brand_name text,
  p_website text,
  p_invoice_branding_name text
)
returns public.brand_settings
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  actor uuid;
  current public.brand_settings;
begin
  actor := public.assert_platform_admin();
  update public.brand_settings
  set
    brand_name = coalesce(nullif(left(trim(p_brand_name), 80), ''), brand_name),
    website = coalesce(nullif(left(trim(p_website), 200), ''), website),
    invoice_branding_name = coalesce(nullif(left(trim(p_invoice_branding_name), 80), ''), invoice_branding_name),
    updated_by_user_id = actor
  where singleton = true
  returning * into current;
  perform public.admin_record_audit_event('brand_settings.update', 'brand_settings', null, '{}'::jsonb);
  return current;
end;
$$;

revoke all on function public.admin_update_brand_settings(text, text, text) from public, anon;
grant execute on function public.admin_update_brand_settings(text, text, text) to authenticated;

create or replace function public.admin_set_feature_flag(p_code text, p_enabled boolean)
returns public.feature_flags
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  actor uuid;
  current public.feature_flags;
begin
  actor := public.assert_platform_admin();
  update public.feature_flags
  set enabled = coalesce(p_enabled, enabled)
  where code = p_code
  returning * into current;
  if current.code is null then
    raise exception 'feature flag not found';
  end if;
  perform public.admin_record_audit_event(
    'feature_flag.set',
    'feature_flag',
    null,
    jsonb_build_object('code', current.code, 'enabled', current.enabled)
  );
  return current;
end;
$$;

revoke all on function public.admin_set_feature_flag(text, boolean) from public, anon;
grant execute on function public.admin_set_feature_flag(text, boolean) to authenticated;

create or replace function public.admin_set_currency_enabled(p_code text, p_enabled boolean)
returns public.platform_currencies
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  current public.platform_currencies;
begin
  perform public.assert_platform_admin();
  update public.platform_currencies
  set enabled = coalesce(p_enabled, enabled)
  where code = p_code
  returning * into current;
  if current.code is null then
    raise exception 'currency not found';
  end if;
  return current;
end;
$$;

revoke all on function public.admin_set_currency_enabled(text, boolean) from public, anon;
grant execute on function public.admin_set_currency_enabled(text, boolean) to authenticated;

create or replace function public.admin_set_country_enabled(p_code text, p_enabled boolean)
returns public.platform_countries
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  current public.platform_countries;
begin
  perform public.assert_platform_admin();
  update public.platform_countries
  set enabled = coalesce(p_enabled, enabled)
  where code = p_code
  returning * into current;
  if current.code is null then
    raise exception 'country not found';
  end if;
  return current;
end;
$$;

revoke all on function public.admin_set_country_enabled(text, boolean) from public, anon;
grant execute on function public.admin_set_country_enabled(text, boolean) to authenticated;

create or replace function public.admin_set_language_enabled(p_code text, p_enabled boolean)
returns public.platform_languages
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  current public.platform_languages;
begin
  perform public.assert_platform_admin();
  if p_code = 'en' and p_enabled is distinct from true then
    raise exception 'english remains the default language';
  end if;
  update public.platform_languages
  set enabled = coalesce(p_enabled, enabled)
  where code = p_code
  returning * into current;
  if current.code is null then
    raise exception 'language not found';
  end if;
  return current;
end;
$$;

revoke all on function public.admin_set_language_enabled(text, boolean) from public, anon;
grant execute on function public.admin_set_language_enabled(text, boolean) to authenticated;

create or replace function public.admin_set_integration_state(p_code text, p_state text)
returns public.integrations
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  current public.integrations;
begin
  perform public.assert_platform_admin();
  if p_state not in ('enabled', 'disabled', 'configuration_required', 'maintenance', 'unavailable') then
    raise exception 'invalid integration state';
  end if;
  update public.integrations
  set operational_state = p_state
  where code = p_code
  returning * into current;
  if current.code is null then
    raise exception 'integration not found';
  end if;
  perform public.admin_record_audit_event(
    'integration.state',
    'integration',
    null,
    jsonb_build_object('code', current.code, 'state', current.operational_state)
  );
  return current;
end;
$$;

revoke all on function public.admin_set_integration_state(text, text) from public, anon;
grant execute on function public.admin_set_integration_state(text, text) to authenticated;

create or replace function public.admin_set_platform_setting(
  p_category text,
  p_key text,
  p_value_kind text,
  p_value_text text,
  p_value_bool boolean,
  p_value_int integer
)
returns public.platform_setting_values
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  actor uuid;
  current public.platform_setting_values;
begin
  actor := public.assert_platform_admin();
  if p_key ilike '%secret%' or p_key ilike '%password%' or p_key ilike '%token%' or p_key ilike '%private%key%' then
    raise exception 'secret keys are not allowed';
  end if;
  if p_category = 'retention' and p_key = 'auto_delete_enabled' and p_value_bool is distinct from false then
    raise exception 'automatic deletion of records is not enabled';
  end if;
  update public.platform_setting_values
  set
    value_kind = p_value_kind,
    value_text = case when p_value_kind = 'text' then nullif(left(trim(coalesce(p_value_text, '')), 400), '') else null end,
    value_bool = case when p_value_kind = 'bool' then coalesce(p_value_bool, false) else null end,
    value_int = case when p_value_kind = 'int' then coalesce(p_value_int, 0) else null end,
    updated_by_user_id = actor
  where category = p_category and key = p_key
  returning * into current;
  if current.key is null then
    raise exception 'setting not found';
  end if;
  return current;
end;
$$;

revoke all on function public.admin_set_platform_setting(text, text, text, text, boolean, integer)
  from public, anon;
grant execute on function public.admin_set_platform_setting(text, text, text, text, boolean, integer)
  to authenticated;
