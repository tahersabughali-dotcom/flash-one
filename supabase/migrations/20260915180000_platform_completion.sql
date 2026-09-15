-- Flash One V1 platform completion
-- Store + AI + Automation foundation + Notifications
-- Separate modules. Store money uses Payment Core. No production secrets.

-- ---------------------------------------------------------------------------
-- Store
-- ---------------------------------------------------------------------------
create table public.store_products (
  id uuid primary key default gen_random_uuid(),
  public_id text not null default public.random_public_id('PRD-'),
  slug text not null,
  name text not null,
  short_description text not null,
  description text,
  product_type text not null,
  commercial_mode text not null,
  status text not null default 'draft',
  customer_visible boolean not null default false,
  quantity_mode text not null default 'single',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint store_products_public_id_format_check
    check (public_id ~ '^PRD-[A-F0-9]{12}$'),
  constraint store_products_public_id_key unique (public_id),
  constraint store_products_slug_format_check
    check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$' and char_length(slug) between 3 and 80),
  constraint store_products_slug_key unique (slug),
  constraint store_products_name_length_check
    check (char_length(name) between 1 and 160),
  constraint store_products_short_description_length_check
    check (char_length(short_description) between 1 and 280),
  constraint store_products_description_length_check
    check (description is null or char_length(description) between 1 and 4000),
  constraint store_products_type_check
    check (product_type in (
      'software', 'service', 'template', 'license', 'support', 'consulting', 'custom'
    )),
  constraint store_products_commercial_mode_check
    check (commercial_mode in ('fixed_price', 'quote_required')),
  constraint store_products_status_check
    check (status in ('draft', 'active', 'archived')),
  constraint store_products_quantity_mode_check
    check (quantity_mode in ('single', 'multiple'))
);

create trigger store_products_set_updated_at
  before update on public.store_products
  for each row
  execute function public.set_updated_at();

create index store_products_status_idx on public.store_products (status);

comment on table public.store_products is
  'Flash One Store catalog. Not a payment, invoice, or project.';

create table public.store_product_prices (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.store_products (id) on delete restrict,
  currency text not null,
  amount_minor bigint not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint store_product_prices_currency_check
    check (currency in ('GBP', 'USD', 'EUR')),
  constraint store_product_prices_amount_check
    check (amount_minor > 0),
  constraint store_product_prices_product_currency_key unique (product_id, currency)
);

create trigger store_product_prices_set_updated_at
  before update on public.store_product_prices
  for each row
  execute function public.set_updated_at();

comment on table public.store_product_prices is
  'Explicit currency prices. No FX. Missing currency means the product is not for sale in that currency.';

create table public.store_orders (
  id uuid primary key default gen_random_uuid(),
  public_id text not null default public.random_public_id('ORD-'),
  individual_user_id uuid references public.individual_accounts (user_id) on delete restrict,
  organization_id uuid references public.organizations (id) on delete restrict,
  guest_email text,
  guest_name text,
  status text not null default 'pending_payment',
  currency text not null,
  subtotal_minor bigint not null,
  tax_minor bigint not null default 0,
  total_minor bigint not null,
  payment_request_id uuid references public.payment_requests (id) on delete restrict,
  invoice_id uuid references public.invoices (id) on delete restrict,
  access_key_hash text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  paid_at timestamptz,
  completed_at timestamptz,
  constraint store_orders_public_id_format_check
    check (public_id ~ '^ORD-[A-F0-9]{12}$'),
  constraint store_orders_public_id_key unique (public_id),
  constraint store_orders_currency_check
    check (currency in ('GBP', 'USD', 'EUR')),
  constraint store_orders_status_check
    check (status in ('draft', 'pending_payment', 'paid', 'processing', 'completed', 'cancelled')),
  constraint store_orders_totals_check
    check (subtotal_minor >= 0 and tax_minor = 0 and total_minor = subtotal_minor + tax_minor),
  constraint store_orders_party_check
    check (
      (individual_user_id is not null and organization_id is null and guest_email is null)
      or (individual_user_id is null and organization_id is not null and guest_email is null)
      or (individual_user_id is null and organization_id is null and guest_email is not null)
    ),
  constraint store_orders_guest_email_length_check
    check (guest_email is null or char_length(guest_email) between 3 and 254),
  constraint store_orders_guest_name_length_check
    check (guest_name is null or char_length(guest_name) between 1 and 120)
);

create trigger store_orders_set_updated_at
  before update on public.store_orders
  for each row
  execute function public.set_updated_at();

create index store_orders_payment_request_id_idx on public.store_orders (payment_request_id);
create index store_orders_status_idx on public.store_orders (status);
create unique index store_orders_payment_request_id_key
  on public.store_orders (payment_request_id)
  where payment_request_id is not null;

comment on table public.store_orders is
  'Store Order is not a Payment. Paid state comes from Payment Core.';

create table public.store_order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.store_orders (id) on delete restrict,
  product_id uuid references public.store_products (id) on delete restrict,
  product_public_id text not null,
  product_name text not null,
  product_type text not null,
  unit_price_minor bigint not null,
  quantity integer not null,
  line_total_minor bigint not null,
  created_at timestamptz not null default now(),
  constraint store_order_items_quantity_check
    check (quantity >= 1 and quantity <= 20),
  constraint store_order_items_unit_price_check
    check (unit_price_minor > 0),
  constraint store_order_items_line_total_check
    check (line_total_minor = unit_price_minor * quantity)
);

create index store_order_items_order_id_idx on public.store_order_items (order_id);

comment on table public.store_order_items is
  'Immutable commercial snapshot. Later product rename/reprice must not change this row.';

-- ---------------------------------------------------------------------------
-- AI
-- ---------------------------------------------------------------------------
create table public.ai_providers (
  code text primary key,
  display_name text not null,
  operational_state text not null,
  model_identifier text,
  capabilities jsonb not null default '{}'::jsonb,
  notes text,
  updated_at timestamptz not null default now(),
  constraint ai_providers_state_check
    check (operational_state in ('enabled', 'maintenance', 'disabled', 'configuration_required')),
  constraint ai_providers_code_check
    check (code in ('development_test', 'openai', 'anthropic'))
);

create trigger ai_providers_set_updated_at
  before update on public.ai_providers
  for each row
  execute function public.set_updated_at();

insert into public.ai_providers (code, display_name, operational_state, model_identifier, capabilities, notes)
values
(
  'development_test',
  'Development test assistant',
  'enabled',
  'flash-one-development-deterministic',
  '{"chat": true, "work_request_suggestion": true}'::jsonb,
  'DEVELOPMENT ONLY. Deterministic. Never masquerades as a live language model. Disabled when runtime environment is production.'
),
(
  'openai',
  'OpenAI',
  'configuration_required',
  null,
  '{"chat": true}'::jsonb,
  'CONFIGURATION REQUIRED. No API credential is stored. Not live.'
),
(
  'anthropic',
  'Anthropic',
  'configuration_required',
  null,
  '{"chat": true}'::jsonb,
  'CONFIGURATION REQUIRED. No API credential is stored. Not live.'
);

comment on table public.ai_providers is
  'AI provider registry. No API secrets. Missing credentials is configuration_required.';

create table public.ai_conversations (
  id uuid primary key default gen_random_uuid(),
  public_id text not null default public.random_public_id('AIC-'),
  user_id uuid not null references auth.users (id) on delete restrict,
  purpose text not null default 'project_idea',
  status text not null default 'active',
  pending_suggestion jsonb,
  suggestion_consumed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint ai_conversations_public_id_format_check
    check (public_id ~ '^AIC-[A-F0-9]{12}$'),
  constraint ai_conversations_public_id_key unique (public_id),
  constraint ai_conversations_purpose_check
    check (purpose in ('project_idea', 'general')),
  constraint ai_conversations_status_check
    check (status in ('active', 'archived'))
);

create trigger ai_conversations_set_updated_at
  before update on public.ai_conversations
  for each row
  execute function public.set_updated_at();

create index ai_conversations_user_id_idx on public.ai_conversations (user_id);

comment on table public.ai_conversations is
  'AI chat is not a project conversation. AI cannot create binding commercial records by itself.';

create table public.ai_messages (
  id uuid primary key default gen_random_uuid(),
  public_id text not null default public.random_public_id('AIM-'),
  conversation_id uuid not null references public.ai_conversations (id) on delete restrict,
  role text not null,
  body text not null,
  structured_suggestion jsonb,
  created_by_user_id uuid references auth.users (id) on delete restrict,
  created_at timestamptz not null default now(),
  constraint ai_messages_public_id_format_check
    check (public_id ~ '^AIM-[A-F0-9]{12}$'),
  constraint ai_messages_public_id_key unique (public_id),
  constraint ai_messages_role_check
    check (role in ('user', 'assistant', 'system')),
  constraint ai_messages_body_length_check
    check (char_length(body) between 1 and 8000),
  constraint ai_messages_user_role_actor_check
    check (
      (role = 'user' and created_by_user_id is not null)
      or (role in ('assistant', 'system') and created_by_user_id is null)
    )
);

create index ai_messages_conversation_id_idx on public.ai_messages (conversation_id, created_at);

-- ---------------------------------------------------------------------------
-- Automation + outbox
-- ---------------------------------------------------------------------------
create table public.domain_outbox_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  aggregate_type text not null,
  aggregate_id uuid not null,
  safe_payload jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now(),
  processing_status text not null default 'pending',
  attempt_count integer not null default 0,
  last_error text,
  processed_at timestamptz,
  constraint domain_outbox_events_status_check
    check (processing_status in ('pending', 'processed', 'failed')),
  constraint domain_outbox_events_type_check
    check (event_type in (
      'payment.confirmed',
      'store_order.paid',
      'work_request.submitted'
    )),
  constraint domain_outbox_events_attempt_check
    check (attempt_count >= 0 and attempt_count <= 3)
);

create unique index domain_outbox_events_identity_key
  on public.domain_outbox_events (event_type, aggregate_type, aggregate_id);

create index domain_outbox_events_pending_idx
  on public.domain_outbox_events (processing_status, occurred_at)
  where processing_status = 'pending';

comment on table public.domain_outbox_events is
  'Internal domain events. Not financial truth. No secrets in payloads. Customers cannot query this table.';

create table public.automation_rules (
  id uuid primary key default gen_random_uuid(),
  public_id text not null default public.random_public_id('AUR-'),
  name text not null,
  event_type text not null,
  action_type text not null,
  enabled boolean not null default false,
  configuration jsonb not null default '{}'::jsonb,
  created_by_user_id uuid references auth.users (id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint automation_rules_public_id_format_check
    check (public_id ~ '^AUR-[A-F0-9]{12}$'),
  constraint automation_rules_public_id_key unique (public_id),
  constraint automation_rules_name_length_check
    check (char_length(name) between 1 and 120),
  constraint automation_rules_event_type_check
    check (event_type in (
      'payment.confirmed',
      'store_order.paid',
      'work_request.submitted'
    )),
  constraint automation_rules_action_type_check
    check (action_type in (
      'create_notification',
      'create_admin_follow_up',
      'development_fail'
    ))
);

create trigger automation_rules_set_updated_at
  before update on public.automation_rules
  for each row
  execute function public.set_updated_at();

comment on table public.automation_rules is
  'Allowlisted internal reactions. No SQL/JS/HTTP from configuration. Platform Admin only.';

create table public.automation_runs (
  id uuid primary key default gen_random_uuid(),
  public_id text not null default public.random_public_id('ARN-'),
  rule_id uuid not null references public.automation_rules (id) on delete restrict,
  event_id uuid not null references public.domain_outbox_events (id) on delete restrict,
  status text not null,
  error_summary text,
  attempt_count integer not null default 1,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  constraint automation_runs_public_id_format_check
    check (public_id ~ '^ARN-[A-F0-9]{12}$'),
  constraint automation_runs_public_id_key unique (public_id),
  constraint automation_runs_status_check
    check (status in ('pending', 'processing', 'succeeded', 'failed', 'skipped')),
  constraint automation_runs_rule_event_key unique (rule_id, event_id)
);

create index automation_runs_rule_id_idx on public.automation_runs (rule_id, started_at desc);

-- ---------------------------------------------------------------------------
-- Notifications
-- ---------------------------------------------------------------------------
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  public_id text not null default public.random_public_id('NTF-'),
  recipient_user_id uuid not null references auth.users (id) on delete restrict,
  type text not null,
  title text not null,
  body text not null,
  read_at timestamptz,
  source_type text,
  source_public_id text,
  created_at timestamptz not null default now(),
  constraint notifications_public_id_format_check
    check (public_id ~ '^NTF-[A-F0-9]{12}$'),
  constraint notifications_public_id_key unique (public_id),
  constraint notifications_title_length_check
    check (char_length(title) between 1 and 160),
  constraint notifications_body_length_check
    check (char_length(body) between 1 and 1000),
  constraint notifications_type_check
    check (type in (
      'store_order_paid',
      'work_request_submitted',
      'admin_follow_up',
      'automation'
    ))
);

create index notifications_recipient_user_id_idx
  on public.notifications (recipient_user_id, created_at desc);

comment on table public.notifications is
  'In-app notifications only. Not email, SMS, or WhatsApp.';

-- ---------------------------------------------------------------------------
-- Access helpers
-- ---------------------------------------------------------------------------
create or replace function public.can_access_store_order(p_order_id uuid)
returns boolean
language plpgsql
stable
security definer
set search_path = pg_catalog, public
as $$
declare
  current public.store_orders;
  actor uuid;
begin
  actor := (select auth.uid());
  if actor is null then
    return false;
  end if;
  if public.is_platform_admin() then
    return true;
  end if;
  select * into current from public.store_orders where id = p_order_id;
  if current.id is null then
    return false;
  end if;
  if current.individual_user_id is not null and current.individual_user_id = actor then
    return true;
  end if;
  if current.organization_id is not null and public.is_organization_member(current.organization_id) then
    return true;
  end if;
  return false;
end;
$$;

revoke all on function public.can_access_store_order(uuid) from public, anon;
grant execute on function public.can_access_store_order(uuid) to authenticated;

create or replace function public.can_access_ai_conversation(p_conversation_id uuid)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select exists (
    select 1
    from public.ai_conversations
    where id = p_conversation_id
      and (
        user_id = (select auth.uid())
        or public.is_platform_admin()
      )
  );
$$;

revoke all on function public.can_access_ai_conversation(uuid) from public, anon;
grant execute on function public.can_access_ai_conversation(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- Domain outbox + automation
-- ---------------------------------------------------------------------------
create or replace function public.internal_enqueue_domain_event(
  p_event_type text,
  p_aggregate_type text,
  p_aggregate_id uuid,
  p_payload jsonb
)
returns public.domain_outbox_events
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  created public.domain_outbox_events;
begin
  insert into public.domain_outbox_events (
    event_type, aggregate_type, aggregate_id, safe_payload
  ) values (
    p_event_type, p_aggregate_type, p_aggregate_id, coalesce(p_payload, '{}'::jsonb)
  )
  on conflict (event_type, aggregate_type, aggregate_id)
  do update set safe_payload = excluded.safe_payload
  returning * into created;
  return created;
end;
$$;

revoke all on function public.internal_enqueue_domain_event(text, text, uuid, jsonb)
  from public, anon, authenticated;

create or replace function public.internal_create_notification(
  p_recipient uuid,
  p_type text,
  p_title text,
  p_body text,
  p_source_type text,
  p_source_public_id text
)
returns public.notifications
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  created public.notifications;
begin
  if p_recipient is null then
    raise exception 'notification recipient required';
  end if;
  insert into public.notifications (
    recipient_user_id, type, title, body, source_type, source_public_id
  ) values (
    p_recipient, p_type, p_title, p_body, p_source_type, p_source_public_id
  )
  returning * into created;
  return created;
end;
$$;

revoke all on function public.internal_create_notification(uuid, text, text, text, text, text)
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
      select individual_user_id into recipient
      from public.store_orders
      where id = p_event.aggregate_id;
    elsif p_event.aggregate_type = 'work_request' then
      select created_by_user_id into recipient
      from public.work_requests
      where id = p_event.aggregate_id;
    elsif p_event.aggregate_type = 'payment' then
      select individual_user_id into recipient
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
  existing uuid;
begin
  for event in
    select * from public.domain_outbox_events
    where processing_status = 'pending'
    order by occurred_at
    for update skip locked
  loop
    update public.domain_outbox_events
    set attempt_count = least(attempt_count + 1, 3)
    where id = event.id;

    for rule in
      select * from public.automation_rules
      where enabled
        and event_type = event.event_type
        and (
          action_type <> 'development_fail'
          or public.payment_runtime_environment() = 'development'
        )
    loop
      select id into existing
      from public.automation_runs
      where rule_id = rule.id and event_id = event.id;
      if existing is not null then
        continue;
      end if;
      begin
        perform public.internal_execute_automation_action(rule, event);
        insert into public.automation_runs (rule_id, event_id, status, finished_at)
        values (rule.id, event.id, 'succeeded', now());
      exception when others then
        insert into public.automation_runs (rule_id, event_id, status, error_summary, finished_at)
        values (
          rule.id,
          event.id,
          'failed',
          left(sqlerrm, 200),
          now()
        );
      end;
    end loop;

    update public.domain_outbox_events
    set processing_status = 'processed', processed_at = now()
    where id = event.id;
    processed := processed + 1;
  end loop;
  return processed;
end;
$$;

revoke all on function public.process_pending_outbox() from public;
grant execute on function public.process_pending_outbox() to anon, authenticated;

create or replace function public.internal_apply_store_order_paid(p_request_id uuid)
returns void
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  current public.store_orders;
begin
  update public.store_orders
  set status = 'paid',
      paid_at = coalesce(paid_at, now())
  where payment_request_id = p_request_id
    and status = 'pending_payment'
  returning * into current;
  if current.id is null then
    return;
  end if;
  perform public.internal_enqueue_domain_event(
    'store_order.paid',
    'store_order',
    current.id,
    jsonb_build_object(
      'public_id', current.public_id,
      'currency', current.currency,
      'total_minor', current.total_minor
    )
  );
end;
$$;

revoke all on function public.internal_apply_store_order_paid(uuid)
  from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- Store RPCs
-- ---------------------------------------------------------------------------
create or replace function public.public_list_store_products()
returns jsonb
language plpgsql
stable
security definer
set search_path = pg_catalog, public
as $$
begin
  return coalesce((
    select jsonb_agg(jsonb_build_object(
      'public_id', p.public_id,
      'slug', p.slug,
      'name', p.name,
      'short_description', p.short_description,
      'product_type', p.product_type,
      'commercial_mode', p.commercial_mode,
      'prices', coalesce((
        select jsonb_agg(jsonb_build_object(
          'currency', pr.currency,
          'amount_minor', pr.amount_minor
        ) order by pr.currency)
        from public.store_product_prices pr
        where pr.product_id = p.id and pr.active
      ), '[]'::jsonb)
    ) order by p.name)
    from public.store_products p
    where p.status = 'active'
      and p.customer_visible = true
  ), '[]'::jsonb);
end;
$$;

revoke all on function public.public_list_store_products() from public;
grant execute on function public.public_list_store_products() to anon, authenticated;

create or replace function public.public_get_store_product(p_slug text)
returns jsonb
language plpgsql
stable
security definer
set search_path = pg_catalog, public
as $$
declare
  product public.store_products;
begin
  if p_slug is null or p_slug !~ '^[a-z0-9]+(?:-[a-z0-9]+)*$' then
    return jsonb_build_object('status', 'not_found');
  end if;
  select * into product
  from public.store_products
  where slug = p_slug
    and status = 'active'
    and customer_visible = true;
  if product.id is null then
    return jsonb_build_object('status', 'not_found');
  end if;
  return jsonb_build_object(
    'status', 'ok',
    'public_id', product.public_id,
    'slug', product.slug,
    'name', product.name,
    'short_description', product.short_description,
    'description', product.description,
    'product_type', product.product_type,
    'commercial_mode', product.commercial_mode,
    'quantity_mode', product.quantity_mode,
    'prices', coalesce((
      select jsonb_agg(jsonb_build_object(
        'currency', pr.currency,
        'amount_minor', pr.amount_minor
      ) order by pr.currency)
      from public.store_product_prices pr
      where pr.product_id = product.id and pr.active
    ), '[]'::jsonb)
  );
end;
$$;

revoke all on function public.public_get_store_product(text) from public;
grant execute on function public.public_get_store_product(text) to anon, authenticated;

create or replace function public.create_store_order(
  p_product_public_id text,
  p_quantity integer,
  p_currency text,
  p_guest_name text,
  p_guest_email text,
  p_organization_public_id text
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public, extensions
as $$
declare
  actor uuid;
  product public.store_products;
  price public.store_product_prices;
  v_organization_id uuid;
  v_individual_id uuid;
  v_guest_email text;
  v_guest_name text;
  quantity integer;
  line_total bigint;
  created public.store_orders;
  request public.payment_requests;
  access_raw text;
  recent integer;
begin
  actor := (select auth.uid());
  select * into product
  from public.store_products
  where public_id = p_product_public_id
  for update;
  if product.id is null or product.status <> 'active' or product.customer_visible is not true then
    raise exception 'product is not available';
  end if;
  if product.commercial_mode = 'quote_required' then
    raise exception 'quote required';
  end if;
  if public.currency_minor_units(p_currency) is null then
    raise exception 'unsupported currency';
  end if;
  quantity := coalesce(p_quantity, 1);
  if product.quantity_mode = 'single' then
    quantity := 1;
  end if;
  if quantity < 1 or quantity > 20 then
    raise exception 'invalid quantity';
  end if;
  select * into price
  from public.store_product_prices
  where product_id = product.id
    and currency = p_currency
    and active;
  if price.id is null then
    raise exception 'no price for selected currency';
  end if;
  line_total := price.amount_minor * quantity;

  if actor is not null then
    if p_organization_public_id is not null and btrim(p_organization_public_id) <> '' then
      select id into v_organization_id
      from public.organizations
      where public_id = p_organization_public_id;
      if v_organization_id is null or not public.is_organization_member(v_organization_id) then
        raise exception 'not authorized';
      end if;
    else
      select user_id into v_individual_id
      from public.individual_accounts
      where user_id = actor;
      if v_individual_id is null then
        raise exception 'create an individual relationship before ordering for yourself';
      end if;
    end if;
    select count(*) into recent
    from public.store_orders
    where created_at > now() - interval '1 hour'
      and (
        individual_user_id = actor
        or (v_organization_id is not null and store_orders.organization_id = v_organization_id)
      );
    if recent >= 10 then
      raise exception 'order could not be created';
    end if;
  else
    v_guest_email := lower(btrim(coalesce(p_guest_email, '')));
    v_guest_name := btrim(coalesce(p_guest_name, ''));
    if v_guest_email = '' or v_guest_name = '' then
      raise exception 'guest name and email are required';
    end if;
    if v_guest_email !~ '^[^@]+@[^@]+\.[^@]+$' then
      raise exception 'guest name and email are required';
    end if;
    select count(*) into recent
    from public.store_orders
    where store_orders.guest_email = v_guest_email
      and created_at > now() - interval '1 hour';
    if recent >= 5 then
      raise exception 'order could not be created';
    end if;
  end if;

  access_raw := encode(gen_random_bytes(32), 'hex');
  insert into public.store_orders (
    individual_user_id, organization_id, guest_email, guest_name,
    status, currency, subtotal_minor, tax_minor, total_minor, access_key_hash
  ) values (
    v_individual_id,
    v_organization_id,
    v_guest_email,
    v_guest_name,
    'pending_payment',
    p_currency,
    line_total,
    0,
    line_total,
    public.sha256_hex(access_raw)
  )
  returning * into created;

  insert into public.store_order_items (
    order_id, product_id, product_public_id, product_name, product_type,
    unit_price_minor, quantity, line_total_minor
  ) values (
    created.id,
    product.id,
    product.public_id,
    product.name,
    product.product_type,
    price.amount_minor,
    quantity,
    line_total
  );

  insert into public.payment_requests (
    individual_user_id, organization_id, guest_email, guest_name,
    currency, requested_amount_minor, amount_mode, status,
    service_code, service_snapshot, description, created_by_user_id
  ) values (
    created.individual_user_id,
    created.organization_id,
    created.guest_email,
    created.guest_name,
    created.currency,
    created.total_minor,
    'fixed',
    'active',
    'other',
    jsonb_build_object(
      'source', 'store_order',
      'order_public_id', created.public_id,
      'product_public_id', product.public_id,
      'product_name', product.name
    ),
    left('Store order ' || created.public_id, 400),
    actor
  )
  returning * into request;

  update public.store_orders
  set payment_request_id = request.id
  where id = created.id
  returning * into created;

  return jsonb_build_object(
    'order_public_id', created.public_id,
    'payment_request_public_id', request.public_id,
    'currency', created.currency,
    'total_minor', created.total_minor,
    'access_key', access_raw,
    'status', created.status
  );
end;
$$;

revoke all on function public.create_store_order(text, integer, text, text, text, text) from public;
grant execute on function public.create_store_order(text, integer, text, text, text, text)
  to anon, authenticated;

create or replace function public.admin_upsert_store_product(
  p_public_id text,
  p_slug text,
  p_name text,
  p_short_description text,
  p_description text,
  p_product_type text,
  p_commercial_mode text,
  p_quantity_mode text,
  p_customer_visible boolean
)
returns public.store_products
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  created public.store_products;
begin
  perform public.assert_platform_admin();
  if p_public_id is not null and btrim(p_public_id) <> '' then
    update public.store_products
    set slug = p_slug,
        name = p_name,
        short_description = p_short_description,
        description = nullif(btrim(p_description), ''),
        product_type = p_product_type,
        commercial_mode = p_commercial_mode,
        quantity_mode = coalesce(nullif(btrim(p_quantity_mode), ''), 'single'),
        customer_visible = coalesce(p_customer_visible, false)
    where public_id = p_public_id
    returning * into created;
    if created.id is null then
      raise exception 'product not found';
    end if;
    return created;
  end if;
  insert into public.store_products (
    slug, name, short_description, description, product_type,
    commercial_mode, quantity_mode, customer_visible, status
  ) values (
    p_slug,
    p_name,
    p_short_description,
    nullif(btrim(p_description), ''),
    p_product_type,
    p_commercial_mode,
    coalesce(nullif(btrim(p_quantity_mode), ''), 'single'),
    coalesce(p_customer_visible, false),
    'draft'
  )
  returning * into created;
  return created;
end;
$$;

revoke all on function public.admin_upsert_store_product(text, text, text, text, text, text, text, text, boolean)
  from public, anon;
grant execute on function public.admin_upsert_store_product(text, text, text, text, text, text, text, text, boolean)
  to authenticated;

create or replace function public.admin_set_store_product_status(
  p_public_id text,
  p_status text
)
returns public.store_products
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  created public.store_products;
begin
  perform public.assert_platform_admin();
  if p_status not in ('draft', 'active', 'archived') then
    raise exception 'invalid product status';
  end if;
  update public.store_products
  set status = p_status,
      customer_visible = case when p_status = 'active' then customer_visible else false end
  where public_id = p_public_id
  returning * into created;
  if created.id is null then
    raise exception 'product not found';
  end if;
  return created;
end;
$$;

revoke all on function public.admin_set_store_product_status(text, text) from public, anon;
grant execute on function public.admin_set_store_product_status(text, text) to authenticated;

create or replace function public.admin_set_store_product_price(
  p_product_public_id text,
  p_currency text,
  p_amount_minor bigint,
  p_active boolean
)
returns public.store_product_prices
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  product public.store_products;
  created public.store_product_prices;
begin
  perform public.assert_platform_admin();
  if public.currency_minor_units(p_currency) is null then
    raise exception 'unsupported currency';
  end if;
  if p_amount_minor is null or p_amount_minor <= 0 then
    raise exception 'invalid price';
  end if;
  select * into product from public.store_products where public_id = p_product_public_id;
  if product.id is null then
    raise exception 'product not found';
  end if;
  insert into public.store_product_prices (product_id, currency, amount_minor, active)
  values (product.id, p_currency, p_amount_minor, coalesce(p_active, true))
  on conflict (product_id, currency)
  do update set amount_minor = excluded.amount_minor, active = excluded.active
  returning * into created;
  return created;
end;
$$;

revoke all on function public.admin_set_store_product_price(text, text, bigint, boolean) from public, anon;
grant execute on function public.admin_set_store_product_price(text, text, bigint, boolean) to authenticated;

create or replace function public.admin_set_store_order_status(
  p_public_id text,
  p_status text
)
returns public.store_orders
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  current public.store_orders;
begin
  perform public.assert_platform_admin();
  select * into current from public.store_orders where public_id = p_public_id for update;
  if current.id is null then
    raise exception 'order not found';
  end if;
  if p_status = 'cancelled' then
    if current.status not in ('draft', 'pending_payment') then
      raise exception 'paid orders cannot be cancelled from Store';
    end if;
  elsif p_status = 'processing' then
    if current.status not in ('paid', 'processing') then
      raise exception 'order is not paid';
    end if;
  elsif p_status = 'completed' then
    if current.status not in ('paid', 'processing') then
      raise exception 'order is not paid';
    end if;
  else
    raise exception 'invalid order status';
  end if;
  update public.store_orders
  set status = p_status,
      completed_at = case when p_status = 'completed' then coalesce(completed_at, now()) else completed_at end
  where id = current.id
  returning * into current;
  return current;
end;
$$;

revoke all on function public.admin_set_store_order_status(text, text) from public, anon;
grant execute on function public.admin_set_store_order_status(text, text) to authenticated;

create or replace function public.admin_set_automation_rule_enabled(
  p_public_id text,
  p_enabled boolean
)
returns public.automation_rules
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  current public.automation_rules;
begin
  perform public.assert_platform_admin();
  update public.automation_rules
  set enabled = coalesce(p_enabled, false)
  where public_id = p_public_id
  returning * into current;
  if current.id is null then
    raise exception 'automation rule not found';
  end if;
  return current;
end;
$$;

revoke all on function public.admin_set_automation_rule_enabled(text, boolean) from public, anon;
grant execute on function public.admin_set_automation_rule_enabled(text, boolean) to authenticated;

create or replace function public.admin_set_ai_provider_state(
  p_code text,
  p_operational_state text
)
returns public.ai_providers
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  current public.ai_providers;
begin
  perform public.assert_platform_admin();
  if p_operational_state not in ('enabled', 'maintenance', 'disabled', 'configuration_required') then
    raise exception 'invalid provider state';
  end if;
  select * into current from public.ai_providers where code = p_code for update;
  if current.code is null then
    raise exception 'provider not found';
  end if;
  if p_code = 'development_test'
     and p_operational_state = 'enabled'
     and public.payment_runtime_environment() is distinct from 'development' then
    raise exception 'development test assistant cannot be enabled outside development';
  end if;
  update public.ai_providers
  set operational_state = p_operational_state
  where code = p_code
  returning * into current;
  return current;
end;
$$;

revoke all on function public.admin_set_ai_provider_state(text, text) from public, anon;
grant execute on function public.admin_set_ai_provider_state(text, text) to authenticated;

-- ---------------------------------------------------------------------------
-- AI RPCs
-- ---------------------------------------------------------------------------
create or replace function public.public_ai_status()
returns jsonb
language plpgsql
stable
security definer
set search_path = pg_catalog, public
as $$
declare
  current public.ai_providers;
begin
  select * into current
  from public.ai_providers
  where operational_state = 'enabled'
    and (
      code <> 'development_test'
      or public.payment_runtime_environment() = 'development'
    )
  order by case when code = 'development_test' then 0 else 1 end
  limit 1;
  if current.code is null then
    return jsonb_build_object(
      'configured', false,
      'code', null,
      'message', 'AI is not configured'
    );
  end if;
  return jsonb_build_object(
    'configured', true,
    'code', current.code,
    'display_name', current.display_name,
    'development_only', current.code = 'development_test'
  );
end;
$$;

revoke all on function public.public_ai_status() from public;
grant execute on function public.public_ai_status() to authenticated;

create or replace function public.create_ai_conversation(p_purpose text)
returns public.ai_conversations
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  actor uuid;
  created public.ai_conversations;
  recent integer;
begin
  actor := (select auth.uid());
  if actor is null then
    raise exception 'not authenticated';
  end if;
  select count(*) into recent
  from public.ai_conversations
  where user_id = actor
    and created_at > now() - interval '1 hour';
  if recent >= 20 then
    raise exception 'ai could not be started';
  end if;
  insert into public.ai_conversations (user_id, purpose)
  values (actor, coalesce(nullif(btrim(p_purpose), ''), 'project_idea'))
  returning * into created;
  return created;
end;
$$;

revoke all on function public.create_ai_conversation(text) from public, anon;
grant execute on function public.create_ai_conversation(text) to authenticated;

create or replace function public.insert_user_ai_message(
  p_conversation_public_id text,
  p_body text
)
returns public.ai_messages
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  actor uuid;
  conversation public.ai_conversations;
  created public.ai_messages;
  recent integer;
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
  select count(*) into recent
  from public.ai_messages
  where conversation_id = conversation.id
    and role = 'user'
    and created_at > now() - interval '1 hour';
  if recent >= 30 then
    raise exception 'ai could not be started';
  end if;
  insert into public.ai_messages (
    conversation_id, role, body, created_by_user_id
  ) values (
    conversation.id, 'user', btrim(p_body), actor
  )
  returning * into created;
  return created;
end;
$$;

revoke all on function public.insert_user_ai_message(text, text) from public, anon;
grant execute on function public.insert_user_ai_message(text, text) to authenticated;

create or replace function public.insert_assistant_ai_message(
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
  actor uuid;
  conversation public.ai_conversations;
  last_role text;
  created public.ai_messages;
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

revoke all on function public.insert_assistant_ai_message(text, text, jsonb) from public, anon;
grant execute on function public.insert_assistant_ai_message(text, text, jsonb) to authenticated;

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
  suggestion := conversation.pending_suggestion;
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

create or replace function public.mark_notification_read(p_public_id text)
returns public.notifications
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  actor uuid;
  current public.notifications;
begin
  actor := (select auth.uid());
  if actor is null then
    raise exception 'not authenticated';
  end if;
  update public.notifications
  set read_at = coalesce(read_at, now())
  where public_id = p_public_id
    and recipient_user_id = actor
  returning * into current;
  if current.id is null then
    raise exception 'notification not found';
  end if;
  return current;
end;
$$;

revoke all on function public.mark_notification_read(text) from public, anon;
grant execute on function public.mark_notification_read(text) to authenticated;

-- ---------------------------------------------------------------------------
-- Payment Core hook: order paid + outbox. Automation runs after, never rolls back money.
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
  if event.id is null then
    raise exception 'provider event not found';
  end if;
  if event.processing_status = 'processed' and event.payment_id is not null then
    select * into existing from public.payments where id = event.payment_id;
    return existing;
  end if;
  select * into attempt from public.payment_attempts where id = event.attempt_id for update;
  select * into request from public.payment_requests where id = attempt.payment_request_id for update;
  if request.invoice_id is not null then
    select * into invoice from public.invoices where id = request.invoice_id for update;
  end if;

  if event.currency is distinct from attempt.currency
     or event.amount_minor is distinct from attempt.amount_minor then
    insert into public.payments (
      individual_user_id, organization_id, guest_email, guest_name,
      currency, amount_minor, status, source_type, provider, provider_reference,
      received_at, payment_request_id, payment_attempt_id, review_required
    ) values (
      request.individual_user_id,
      request.organization_id,
      request.guest_email,
      request.guest_name,
      coalesce(event.currency, attempt.currency),
      coalesce(event.amount_minor, attempt.amount_minor),
      'succeeded',
      attempt.provider,
      attempt.provider,
      event.provider_reference,
      now(),
      request.id,
      attempt.id,
      true
    )
    returning * into created;
    perform public.post_financial_ledger_entry(
      'payment_received', created.currency, created.amount_minor, 'in',
      created.id, null, null, created.public_id
    );
    perform public.internal_issue_receipt(created.id);
    insert into public.reconciliation_items (
      source_type, external_reference, currency, amount_minor, status, notes, matched_payment_id
    ) values (
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
    set processing_status = 'mismatch', payment_id = created.id, verified_at = coalesce(verified_at, now())
    where id = event.id;
    perform public.internal_enqueue_domain_event(
      'payment.confirmed',
      'payment',
      created.id,
      jsonb_build_object(
        'public_id', created.public_id,
        'review_required', true
      )
    );
    select * into created from public.payments where id = created.id;
    return created;
  end if;

  insert into public.payments (
    individual_user_id, organization_id, guest_email, guest_name,
    currency, amount_minor, status, source_type, provider, provider_reference,
    received_at, payment_request_id, payment_attempt_id, review_required
  ) values (
    request.individual_user_id,
    request.organization_id,
    request.guest_email,
    request.guest_name,
    attempt.currency,
    attempt.amount_minor,
    'succeeded',
    attempt.provider,
    attempt.provider,
    event.provider_reference,
    now(),
    request.id,
    attempt.id,
    false
  )
  returning * into created;

  perform public.post_financial_ledger_entry(
    'payment_received', created.currency, created.amount_minor, 'in',
    created.id, null, null, created.public_id
  );
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

  update public.payment_attempts
  set status = 'succeeded', payment_id = created.id, completed_at = now()
  where id = attempt.id;
  update public.payment_requests
  set status = 'completed', completed_at = now()
  where id = request.id and status = 'active';
  update public.payment_provider_events
  set processing_status = 'processed', payment_id = created.id, verified_at = coalesce(verified_at, now())
  where id = event.id;
  insert into public.reconciliation_items (
    source_type, external_reference, currency, amount_minor, status, notes, matched_payment_id, reconciled_at
  ) values (
    case when attempt.provider = 'development_test' then 'development_test' else 'provider_event' end,
    event.external_event_id,
    created.currency,
    created.amount_minor,
    'matched',
    'Provider-confirmed event linked to an internal payment. Matching is not a separate sale.',
    created.id,
    now()
  );
  perform public.internal_apply_store_order_paid(request.id);
  perform public.internal_enqueue_domain_event(
    'payment.confirmed',
    'payment',
    created.id,
    jsonb_build_object(
      'public_id', created.public_id,
      'review_required', false
    )
  );
  select * into created from public.payments where id = created.id;
  return created;
end;
$$;

revoke all on function public.finalize_confirmed_payment(uuid) from public, anon, authenticated;

create or replace function public.ingest_provider_event(
  p_ingest_key text,
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
  result jsonb;
begin
  if p_ingest_key is null or char_length(p_ingest_key) < 32 then
    raise exception 'payment could not be started';
  end if;
  select * into attempt
  from public.payment_attempts
  where ingest_key_hash = public.sha256_hex(p_ingest_key)
  for update;
  if attempt.id is null then
    raise exception 'payment attempt not found';
  end if;
  if attempt.provider is distinct from p_provider then
    raise exception 'payment method unavailable';
  end if;
  if p_provider = 'development_test'
     and public.payment_runtime_environment() is distinct from 'development' then
    raise exception 'payment method unavailable';
  end if;

  select * into existing
  from public.payment_provider_events
  where provider = p_provider and external_event_id = p_external_event_id;
  if existing.id is not null then
    if existing.payment_id is not null then
      select * into payment from public.payments where id = existing.payment_id;
      result := jsonb_build_object(
        'duplicate', true,
        'processing_status', existing.processing_status,
        'payment_public_id', payment.public_id,
        'attempt_public_id', attempt.public_id,
        'attempt_status', attempt.status
      );
    elsif existing.processing_status in ('processed', 'mismatch') then
      result := jsonb_build_object(
        'duplicate', true,
        'processing_status', existing.processing_status,
        'attempt_public_id', attempt.public_id,
        'attempt_status', attempt.status
      );
    else
      event := existing;
    end if;
    if result is not null then
      begin
        perform public.process_pending_outbox();
      exception when others then
        null;
      end;
      return result;
    end if;
  else
    insert into public.payment_provider_events (
      provider, external_event_id, event_type, processing_status,
      attempt_id, currency, amount_minor, provider_reference, safe_metadata, verified_at
    ) values (
      p_provider,
      p_external_event_id,
      p_event_type,
      'received',
      attempt.id,
      p_currency,
      p_amount_minor,
      p_provider_reference,
      jsonb_build_object('outcome', p_outcome),
      now()
    )
    returning * into event;
  end if;

  if p_outcome = 'failed' then
    update public.payment_attempts
    set status = 'failed', completed_at = now()
    where id = attempt.id and status in ('created', 'pending', 'redirected', 'processing');
    update public.payment_provider_events
    set processing_status = 'ignored', error_state = 'provider_reported_failure'
    where id = event.id;
    return jsonb_build_object(
      'attempt_public_id', attempt.public_id,
      'attempt_status', 'failed'
    );
  end if;
  if p_outcome = 'cancelled' then
    update public.payment_attempts
    set status = 'cancelled', completed_at = now()
    where id = attempt.id and status in ('created', 'pending', 'redirected', 'processing');
    update public.payment_provider_events
    set processing_status = 'ignored', error_state = 'provider_reported_cancellation'
    where id = event.id;
    return jsonb_build_object(
      'attempt_public_id', attempt.public_id,
      'attempt_status', 'cancelled'
    );
  end if;
  if p_outcome <> 'succeeded' then
    raise exception 'unsupported provider outcome';
  end if;

  payment := public.finalize_confirmed_payment(event.id);
  select * into attempt from public.payment_attempts where id = attempt.id;
  begin
    perform public.process_pending_outbox();
  exception when others then
    null;
  end;
  return jsonb_build_object(
    'attempt_public_id', attempt.public_id,
    'attempt_status', attempt.status,
    'payment_public_id', payment.public_id,
    'review_required', payment.review_required
  );
end;
$$;

revoke all on function public.ingest_provider_event(text, text, text, text, text, bigint, text, text) from public;
grant execute on function public.ingest_provider_event(text, text, text, text, text, bigint, text, text)
  to anon, authenticated;

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
  end if;
  return new;
end;
$$;

revoke all on function public.work_request_submitted_enqueue() from public, anon, authenticated;

create trigger work_requests_enqueue_submitted
  after insert on public.work_requests
  for each row
  execute function public.work_request_submitted_enqueue();

-- Seed conservative DEVELOPMENT/V1 rules. Not production marketing.
insert into public.automation_rules (
  name, event_type, action_type, enabled, configuration
) values
(
  'Notify submitter when a work request is submitted',
  'work_request.submitted',
  'create_notification',
  true,
  jsonb_build_object(
    'title', 'Work request received',
    'body', 'Flash One has your request. This is an in-app notice, not an email.',
    'notification_type', 'work_request_submitted'
  )
),
(
  'Notify customer when a store order is paid',
  'store_order.paid',
  'create_notification',
  true,
  jsonb_build_object(
    'title', 'Store order paid',
    'body', 'Payment was recorded. Fulfillment is manual. This is an in-app notice, not an email.',
    'notification_type', 'store_order_paid'
  )
);

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
revoke all on table public.store_products from public, anon, authenticated;
revoke all on table public.store_product_prices from public, anon, authenticated;
revoke all on table public.store_orders from public, anon, authenticated;
revoke all on table public.store_order_items from public, anon, authenticated;
revoke all on table public.ai_providers from public, anon, authenticated;
revoke all on table public.ai_conversations from public, anon, authenticated;
revoke all on table public.ai_messages from public, anon, authenticated;
revoke all on table public.domain_outbox_events from public, anon, authenticated;
revoke all on table public.automation_rules from public, anon, authenticated;
revoke all on table public.automation_runs from public, anon, authenticated;
revoke all on table public.notifications from public, anon, authenticated;

grant select on table public.store_products to authenticated;
grant select on table public.store_product_prices to authenticated;
grant select on table public.store_orders to authenticated;
grant select on table public.store_order_items to authenticated;
grant select on table public.ai_providers to authenticated;
grant select, insert on table public.ai_conversations to authenticated;
grant select on table public.ai_messages to authenticated;
grant select on table public.automation_rules to authenticated;
grant select on table public.automation_runs to authenticated;
grant select on table public.notifications to authenticated;

alter table public.store_products enable row level security;
alter table public.store_products force row level security;
alter table public.store_product_prices enable row level security;
alter table public.store_product_prices force row level security;
alter table public.store_orders enable row level security;
alter table public.store_orders force row level security;
alter table public.store_order_items enable row level security;
alter table public.store_order_items force row level security;
alter table public.ai_providers enable row level security;
alter table public.ai_providers force row level security;
alter table public.ai_conversations enable row level security;
alter table public.ai_conversations force row level security;
alter table public.ai_messages enable row level security;
alter table public.ai_messages force row level security;
alter table public.domain_outbox_events enable row level security;
alter table public.domain_outbox_events force row level security;
alter table public.automation_rules enable row level security;
alter table public.automation_rules force row level security;
alter table public.automation_runs enable row level security;
alter table public.automation_runs force row level security;
alter table public.notifications enable row level security;
alter table public.notifications force row level security;

create policy store_products_select_admin
  on public.store_products
  for select to authenticated
  using (public.is_platform_admin());

create policy store_product_prices_select_admin
  on public.store_product_prices
  for select to authenticated
  using (public.is_platform_admin());

create policy store_orders_select_related
  on public.store_orders
  for select to authenticated
  using (public.can_access_store_order(id));

create policy store_order_items_select_related
  on public.store_order_items
  for select to authenticated
  using (public.can_access_store_order(order_id));

create policy ai_providers_select_admin
  on public.ai_providers
  for select to authenticated
  using (public.is_platform_admin());

create policy ai_conversations_select_own
  on public.ai_conversations
  for select to authenticated
  using (user_id = (select auth.uid()) or public.is_platform_admin());

create policy ai_conversations_insert_own
  on public.ai_conversations
  for insert to authenticated
  with check (user_id = (select auth.uid()));

create policy ai_messages_select_own
  on public.ai_messages
  for select to authenticated
  using (public.can_access_ai_conversation(conversation_id));

create policy domain_outbox_events_select_admin
  on public.domain_outbox_events
  for select to authenticated
  using (public.is_platform_admin());

create policy automation_rules_select_admin
  on public.automation_rules
  for select to authenticated
  using (public.is_platform_admin());

create policy automation_runs_select_admin
  on public.automation_runs
  for select to authenticated
  using (public.is_platform_admin());

create policy notifications_select_own
  on public.notifications
  for select to authenticated
  using (recipient_user_id = (select auth.uid()));
