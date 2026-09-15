-- Flash One payment platform foundation
-- Payment Core + requests + attempts + provider events.
-- Does not store provider secrets. Does not invent provider APIs.

-- ---------------------------------------------------------------------------
-- Existing table extensions
-- ---------------------------------------------------------------------------
alter table public.payments drop constraint payments_source_type_check;
alter table public.payments drop constraint payments_provider_null_check;
alter table public.payments drop constraint payments_owner_xor_check;

alter table public.payments
  add column if not exists guest_email text,
  add column if not exists guest_name text,
  add column if not exists payment_request_id uuid,
  add column if not exists payment_attempt_id uuid,
  add column if not exists review_required boolean not null default false;

alter table public.payments
  add constraint payments_source_type_check
    check (source_type in (
      'manual',
      'paypal',
      'stripe',
      'wise',
      'worldfirst',
      'usdt',
      'development_test'
    )),
  add constraint payments_owner_party_check
    check (
      (individual_user_id is not null and organization_id is null and guest_email is null)
      or (individual_user_id is null and organization_id is not null and guest_email is null)
      or (individual_user_id is null and organization_id is null and guest_email is not null)
    ),
  add constraint payments_guest_email_length_check
    check (guest_email is null or char_length(guest_email) between 3 and 254),
  add constraint payments_guest_name_length_check
    check (guest_name is null or char_length(guest_name) between 1 and 120);

create unique index if not exists payments_provider_reference_key
  on public.payments (provider, provider_reference)
  where provider is not null and provider_reference is not null;

alter table public.receipts drop constraint receipts_owner_xor_check;
alter table public.receipts
  add column if not exists guest_email text,
  add column if not exists guest_name text;
alter table public.receipts
  add constraint receipts_owner_party_check
    check (
      (individual_user_id is not null and organization_id is null and guest_email is null)
      or (individual_user_id is null and organization_id is not null and guest_email is null)
      or (individual_user_id is null and organization_id is null and guest_email is not null)
    );

alter table public.financial_ledger_entries drop constraint financial_ledger_entries_event_type_check;
alter table public.financial_ledger_entries
  add constraint financial_ledger_entries_event_type_check
    check (event_type in (
      'manual_payment_recorded',
      'payment_received',
      'payment_allocated'
    ));

alter table public.reconciliation_items drop constraint reconciliation_items_source_type_check;
alter table public.reconciliation_items
  add constraint reconciliation_items_source_type_check
    check (source_type in ('manual_dev', 'provider_event', 'development_test'));

-- ---------------------------------------------------------------------------
-- Runtime + provider registry (no secrets)
-- ---------------------------------------------------------------------------
create table public.payment_runtime_settings (
  key text primary key,
  value text not null
);

insert into public.payment_runtime_settings (key, value)
values ('environment', 'development');

comment on table public.payment_runtime_settings is
  'Non-secret runtime flags. environment=development allows the development_test provider. Production must set environment=production.';

create table public.payment_providers (
  code text primary key,
  display_name text not null,
  operational_state text not null,
  eligibility text not null,
  capabilities jsonb not null,
  supported_currencies text[] not null,
  notes text,
  updated_at timestamptz not null default now(),
  constraint payment_providers_state_check
    check (operational_state in (
      'enabled',
      'maintenance',
      'disabled',
      'configuration_required'
    )),
  constraint payment_providers_eligibility_check
    check (eligibility in ('all', 'business_only')),
  constraint payment_providers_code_check
    check (code in ('paypal', 'stripe', 'wise', 'worldfirst', 'usdt', 'development_test'))
);

create trigger payment_providers_set_updated_at
  before update on public.payment_providers
  for each row
  execute function public.set_updated_at();

insert into public.payment_providers (
  code, display_name, operational_state, eligibility, capabilities, supported_currencies, notes
) values
(
  'paypal',
  'PayPal',
  'configuration_required',
  'all',
  '{"checkout": true, "payment_link": true, "webhook": true, "refund": true, "partial_refund": true, "guest_payment": true, "status_lookup": true}'::jsonb,
  array['GBP', 'USD', 'EUR'],
  'Official hosted checkout. Sandbox credentials are not present. CONFIGURATION REQUIRED.'
),
(
  'stripe',
  'Stripe',
  'configuration_required',
  'all',
  '{"checkout": true, "payment_link": false, "webhook": true, "refund": true, "partial_refund": true, "guest_payment": true, "status_lookup": true}'::jsonb,
  array['GBP', 'USD', 'EUR'],
  'Official Checkout Session. Test credentials are not present. CONFIGURATION REQUIRED.'
),
(
  'wise',
  'Wise',
  'configuration_required',
  'all',
  '{"checkout": false, "payment_link": false, "bank_transfer_instructions": true, "webhook": false, "refund": false, "guest_payment": false, "status_lookup": false}'::jsonb,
  array['GBP', 'USD', 'EUR'],
  'Collection API / payment links NOT VERIFIED. No bank details are stored. CONFIGURATION REQUIRED.'
),
(
  'worldfirst',
  'WorldFirst',
  'configuration_required',
  'business_only',
  '{"checkout": false, "payment_link": false, "bank_transfer_instructions": false, "webhook": false, "refund": false, "guest_payment": false, "status_lookup": false, "business_only": true}'::jsonb,
  array['GBP', 'USD', 'EUR'],
  'Business customers only. Public API capability NOT VERIFIED. CONFIGURATION REQUIRED.'
),
(
  'usdt',
  'USDT',
  'configuration_required',
  'all',
  '{"checkout": false, "webhook": false, "guest_payment": false, "networks": []}'::jsonb,
  array['USD'],
  'No wallet or network is configured. Do not display a receiving address. CONFIGURATION REQUIRED.'
),
(
  'development_test',
  'Development test',
  'enabled',
  'all',
  '{"checkout": true, "webhook": true, "guest_payment": true, "refund": false}'::jsonb,
  array['GBP', 'USD', 'EUR'],
  'DEVELOPMENT ONLY. Never available when runtime environment is production. Never masquerades as a real provider.'
);

-- ---------------------------------------------------------------------------
-- Payment requests / attempts / provider events
-- ---------------------------------------------------------------------------
create table public.payment_requests (
  id uuid primary key default gen_random_uuid(),
  public_id text not null default public.random_public_id('PRQ-'),
  individual_user_id uuid references public.individual_accounts (user_id) on delete restrict,
  organization_id uuid references public.organizations (id) on delete restrict,
  guest_email text,
  guest_name text,
  invoice_id uuid references public.invoices (id) on delete restrict,
  currency text not null,
  requested_amount_minor bigint,
  amount_mode text not null,
  min_amount_minor bigint,
  max_amount_minor bigint,
  status text not null default 'draft',
  service_code text,
  service_snapshot jsonb not null default '{}'::jsonb,
  description text,
  expires_at timestamptz,
  created_by_user_id uuid references auth.users (id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz,
  constraint payment_requests_public_id_format_check
    check (public_id ~ '^PRQ-[A-F0-9]{12}$'),
  constraint payment_requests_public_id_key unique (public_id),
  constraint payment_requests_currency_check
    check (currency in ('GBP', 'USD', 'EUR')),
  constraint payment_requests_amount_mode_check
    check (amount_mode in ('fixed', 'customer_entered')),
  constraint payment_requests_status_check
    check (status in ('draft', 'active', 'completed', 'expired', 'cancelled')),
  constraint payment_requests_party_check
    check (
      (individual_user_id is not null and organization_id is null)
      or (individual_user_id is null and organization_id is not null)
      or (individual_user_id is null and organization_id is null and guest_email is not null)
    ),
  constraint payment_requests_fixed_amount_check
    check (
      (amount_mode = 'fixed' and requested_amount_minor > 0)
      or (
        amount_mode = 'customer_entered'
        and min_amount_minor > 0
        and max_amount_minor >= min_amount_minor
      )
    ),
  constraint payment_requests_service_check
    check (
      service_code is null
      or service_code in (
        'technical_consultation',
        'code_review',
        'bug_fix',
        'small_website_modification',
        'code_modification',
        'website_update',
        'other'
      )
    ),
  constraint payment_requests_description_length_check
    check (description is null or char_length(description) between 1 and 400)
);

create trigger payment_requests_set_updated_at
  before update on public.payment_requests
  for each row
  execute function public.set_updated_at();

create index payment_requests_invoice_id_idx on public.payment_requests (invoice_id);
create index payment_requests_status_idx on public.payment_requests (status);

comment on table public.payment_requests is
  'Ask to pay. Not proof of money received. Guest rows have guest_email and no CRM owner.';

create table public.payment_attempts (
  id uuid primary key default gen_random_uuid(),
  public_id text not null default public.random_public_id('PAT-'),
  payment_request_id uuid not null references public.payment_requests (id) on delete restrict,
  provider text not null references public.payment_providers (code),
  currency text not null,
  amount_minor bigint not null,
  status text not null default 'created',
  ingest_key_hash text not null,
  provider_session_reference text,
  payment_id uuid references public.payments (id) on delete restrict,
  review_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz,
  constraint payment_attempts_public_id_format_check
    check (public_id ~ '^PAT-[A-F0-9]{12}$'),
  constraint payment_attempts_public_id_key unique (public_id),
  constraint payment_attempts_currency_check
    check (currency in ('GBP', 'USD', 'EUR')),
  constraint payment_attempts_amount_check
    check (amount_minor > 0),
  constraint payment_attempts_status_check
    check (status in (
      'created',
      'pending',
      'redirected',
      'processing',
      'succeeded',
      'failed',
      'cancelled',
      'expired',
      'review_required'
    ))
);

create trigger payment_attempts_set_updated_at
  before update on public.payment_attempts
  for each row
  execute function public.set_updated_at();

create index payment_attempts_request_id_idx on public.payment_attempts (payment_request_id);
create index payment_attempts_ingest_key_hash_idx on public.payment_attempts (ingest_key_hash);

comment on table public.payment_attempts is
  'Checkout/process state. Not a succeeded payment. ingest_key_hash is sha256 of a server-only ingest key.';

create table public.payment_provider_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null references public.payment_providers (code),
  external_event_id text not null,
  event_type text not null,
  received_at timestamptz not null default now(),
  verified_at timestamptz,
  processing_status text not null default 'received',
  attempt_id uuid references public.payment_attempts (id) on delete restrict,
  payment_id uuid references public.payments (id) on delete restrict,
  currency text,
  amount_minor bigint,
  provider_reference text,
  safe_metadata jsonb not null default '{}'::jsonb,
  error_state text,
  constraint payment_provider_events_status_check
    check (processing_status in (
      'received',
      'processed',
      'ignored',
      'mismatch',
      'failed'
    )),
  constraint payment_provider_events_provider_event_key unique (provider, external_event_id)
);

comment on table public.payment_provider_events is
  'Deduplicated provider events. Unique (provider, external_event_id). No secrets or card data.';

alter table public.payments
  add constraint payments_payment_request_id_fkey
    foreign key (payment_request_id) references public.payment_requests (id) on delete restrict,
  add constraint payments_payment_attempt_id_fkey
    foreign key (payment_attempt_id) references public.payment_attempts (id) on delete restrict;

-- ---------------------------------------------------------------------------
-- Internal helpers
-- ---------------------------------------------------------------------------
create or replace function public.payment_runtime_environment()
returns text
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select value from public.payment_runtime_settings where key = 'environment';
$$;

revoke all on function public.payment_runtime_environment() from public, anon;
grant execute on function public.payment_runtime_environment() to authenticated;

create or replace function public.sha256_hex(p_value text)
returns text
language sql
immutable
set search_path = pg_catalog, public, extensions
as $$
  select encode(digest(p_value, 'sha256'), 'hex');
$$;

revoke all on function public.sha256_hex(text) from public, anon, authenticated;

create or replace function public.internal_issue_receipt(p_payment_id uuid)
returns public.receipts
language plpgsql
security definer
set search_path = pg_catalog, public, extensions
as $$
declare
  payment public.payments;
  current public.receipts;
  seq bigint;
  label text;
begin
  select * into payment from public.payments where id = p_payment_id for update;
  if payment.id is null then
    raise exception 'payment not found';
  end if;
  if payment.status <> 'succeeded' then
    raise exception 'receipt requires a succeeded payment';
  end if;
  select * into current from public.receipts where payment_id = payment.id;
  if current.id is not null then
    return current;
  end if;
  label := case payment.source_type
    when 'manual' then 'Manual development payment record'
    when 'development_test' then 'Development test payment record'
    else 'Recorded payment'
  end;
  seq := nextval('public.receipt_number_seq');
  insert into public.receipts (
    public_id, receipt_number, payment_id,
    individual_user_id, organization_id, guest_email, guest_name,
    currency, amount_minor, snapshot
  ) values (
    public.random_grouped_public_id('RCP-'),
    'FO-RCP-' || to_char(now() at time zone 'utc', 'YYYY') || '-' || lpad(seq::text, 6, '0'),
    payment.id,
    payment.individual_user_id,
    payment.organization_id,
    payment.guest_email,
    payment.guest_name,
    payment.currency,
    payment.amount_minor,
    jsonb_build_object(
      'source_type', payment.source_type,
      'provider', payment.provider,
      'currency', payment.currency,
      'amount_minor', payment.amount_minor,
      'received_at', payment.received_at,
      'label', label
    )
  )
  returning * into current;
  return current;
end;
$$;

revoke all on function public.internal_issue_receipt(uuid) from public, anon, authenticated;

create or replace function public.admin_issue_receipt(p_payment_id uuid)
returns public.receipts
language plpgsql
security definer
set search_path = pg_catalog, public, extensions
as $$
begin
  perform public.assert_platform_admin();
  return public.internal_issue_receipt(p_payment_id);
end;
$$;

create or replace function public.internal_allocate_payment(
  p_payment_id uuid,
  p_invoice_id uuid,
  p_amount_minor bigint,
  p_actor uuid
)
returns public.payment_allocations
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  payment public.payments;
  invoice public.invoices;
  existing public.payment_allocations;
  payment_remaining bigint;
  invoice_due bigint;
begin
  if p_amount_minor is null or p_amount_minor <= 0 then
    raise exception 'invalid allocation amount';
  end if;
  select * into payment from public.payments where id = p_payment_id for update;
  select * into invoice from public.invoices where id = p_invoice_id for update;
  if payment.id is null then
    raise exception 'payment not found';
  end if;
  if invoice.id is null then
    raise exception 'invoice not found';
  end if;
  if payment.status <> 'succeeded' then
    raise exception 'cannot allocate this payment';
  end if;
  if invoice.status = 'void' or invoice.status = 'draft' then
    raise exception 'cannot allocate to this invoice';
  end if;
  if payment.currency is distinct from invoice.currency then
    raise exception 'cross-currency allocation is not allowed';
  end if;
  if payment.guest_email is null and (
       payment.individual_user_id is distinct from invoice.individual_user_id
       or payment.organization_id is distinct from invoice.organization_id
     ) then
    raise exception 'payment and invoice owners do not match';
  end if;
  if payment.guest_email is not null and invoice.id is not null then
    if invoice.individual_user_id is distinct from payment.individual_user_id
       or invoice.organization_id is distinct from payment.organization_id then
      raise exception 'payment and invoice owners do not match';
    end if;
  end if;

  select * into existing
  from public.payment_allocations
  where payment_id = payment.id and invoice_id = invoice.id;
  if existing.id is not null then
    if existing.amount_minor = p_amount_minor then
      return existing;
    end if;
    raise exception 'allocation already exists for this payment and invoice';
  end if;

  payment_remaining := payment.amount_minor - public.payment_allocated_minor(payment.id);
  invoice_due := invoice.total_minor - public.invoice_allocated_minor(invoice.id);
  if p_amount_minor > payment_remaining then
    raise exception 'allocation exceeds payment remaining';
  end if;
  if p_amount_minor > invoice_due then
    raise exception 'allocation exceeds invoice amount due';
  end if;

  insert into public.payment_allocations (
    payment_id, invoice_id, amount_minor, allocated_by_user_id
  ) values (payment.id, invoice.id, p_amount_minor, p_actor)
  returning * into existing;

  perform public.sync_invoice_payment_state(invoice.id);
  perform public.post_financial_ledger_entry(
    'payment_allocated',
    payment.currency,
    p_amount_minor,
    'allocation',
    payment.id,
    invoice.id,
    null,
    existing.id::text
  );
  return existing;
end;
$$;

revoke all on function public.internal_allocate_payment(uuid, uuid, bigint, uuid)
  from public, anon, authenticated;

create or replace function public.admin_allocate_payment(
  p_payment_id uuid,
  p_invoice_id uuid,
  p_amount_minor bigint
)
returns public.payment_allocations
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  actor uuid;
begin
  actor := public.assert_platform_admin();
  return public.internal_allocate_payment(p_payment_id, p_invoice_id, p_amount_minor, actor);
end;
$$;

-- ---------------------------------------------------------------------------
-- Provider admin + payment requests
-- ---------------------------------------------------------------------------
create or replace function public.admin_set_provider_state(
  p_code text,
  p_operational_state text
)
returns public.payment_providers
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  current public.payment_providers;
begin
  perform public.assert_platform_admin();
  if p_operational_state not in ('enabled', 'maintenance', 'disabled', 'configuration_required') then
    raise exception 'invalid provider state';
  end if;
  select * into current from public.payment_providers where code = p_code for update;
  if current.code is null then
    raise exception 'provider not found';
  end if;
  if p_code = 'development_test'
     and p_operational_state = 'enabled'
     and public.payment_runtime_environment() is distinct from 'development' then
    raise exception 'development test provider cannot be enabled outside development';
  end if;
  update public.payment_providers
  set operational_state = p_operational_state
  where code = p_code
  returning * into current;
  return current;
end;
$$;

revoke all on function public.admin_set_provider_state(text, text) from public, anon;
grant execute on function public.admin_set_provider_state(text, text) to authenticated;

create or replace function public.admin_create_payment_request(
  p_individual_public_id text,
  p_organization_public_id text,
  p_guest_email text,
  p_guest_name text,
  p_invoice_public_id text,
  p_currency text,
  p_amount_mode text,
  p_requested_amount_minor bigint,
  p_min_amount_minor bigint,
  p_max_amount_minor bigint,
  p_service_code text,
  p_description text,
  p_expires_at timestamptz
)
returns public.payment_requests
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  actor uuid;
  individual_id uuid;
  organization_id uuid;
  invoice public.invoices;
  linked_invoice_id uuid;
  currency text;
  amount bigint;
  created public.payment_requests;
  snapshot jsonb := '{}'::jsonb;
  service text;
begin
  actor := public.assert_platform_admin();
  service := nullif(btrim(p_service_code), '');

  if p_invoice_public_id is not null and btrim(p_invoice_public_id) <> '' then
    select * into invoice from public.invoices where public_id = p_invoice_public_id;
    if invoice.id is null then
      raise exception 'invoice not found';
    end if;
    if invoice.status not in ('issued', 'partially_paid') then
      raise exception 'invoice is not payable';
    end if;
    currency := invoice.currency;
    amount := invoice.total_minor - invoice.amount_paid_minor;
    if amount <= 0 then
      raise exception 'invoice has no amount due';
    end if;
    if p_requested_amount_minor is not null and p_requested_amount_minor > 0 then
      if p_requested_amount_minor > amount then
        raise exception 'cannot request more than invoice amount due';
      end if;
      amount := p_requested_amount_minor;
    end if;
    individual_id := invoice.individual_user_id;
    organization_id := invoice.organization_id;
    linked_invoice_id := invoice.id;
  else
    currency := p_currency;
    if public.currency_minor_units(currency) is null then
      raise exception 'unsupported currency';
    end if;
    if p_individual_public_id is not null and btrim(p_individual_public_id) <> '' then
      select user_id into individual_id from public.individual_accounts where public_id = p_individual_public_id;
    end if;
    if p_organization_public_id is not null and btrim(p_organization_public_id) <> '' then
      select id into organization_id from public.organizations where public_id = p_organization_public_id;
    end if;
    amount := p_requested_amount_minor;
  end if;

  if individual_id is not null and organization_id is not null then
    raise exception 'payment request cannot have both individual and organization owners';
  end if;
  if individual_id is null and organization_id is null and nullif(btrim(p_guest_email), '') is null then
    raise exception 'payment request requires a customer, business, or guest email';
  end if;
  if service is not null then
    snapshot := jsonb_build_object('service_code', service, 'captured_at', now());
  end if;

  insert into public.payment_requests (
    individual_user_id, organization_id, guest_email, guest_name,
    invoice_id, currency, requested_amount_minor, amount_mode,
    min_amount_minor, max_amount_minor, service_code, service_snapshot,
    description, expires_at, created_by_user_id, status
  ) values (
    individual_id,
    organization_id,
    case when linked_invoice_id is not null then null else nullif(lower(btrim(p_guest_email)), '') end,
    case when linked_invoice_id is not null then null else nullif(btrim(p_guest_name), '') end,
    linked_invoice_id,
    currency,
    case when coalesce(p_amount_mode, 'fixed') = 'fixed' then amount else null end,
    coalesce(nullif(btrim(p_amount_mode), ''), 'fixed'),
    p_min_amount_minor,
    p_max_amount_minor,
    service,
    snapshot,
    nullif(btrim(p_description), ''),
    p_expires_at,
    actor,
    'draft'
  )
  returning * into created;
  return created;
end;
$$;

revoke all on function public.admin_create_payment_request(text, text, text, text, text, text, text, bigint, bigint, bigint, text, text, timestamptz)
  from public, anon;
grant execute on function public.admin_create_payment_request(text, text, text, text, text, text, text, bigint, bigint, bigint, text, text, timestamptz)
  to authenticated;

create or replace function public.admin_set_payment_request_status(
  p_request_id uuid,
  p_status text
)
returns public.payment_requests
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  current public.payment_requests;
begin
  perform public.assert_platform_admin();
  select * into current from public.payment_requests where id = p_request_id for update;
  if current.id is null then
    raise exception 'payment request not found';
  end if;
  if current.status = 'completed' and p_status is distinct from 'completed' then
    raise exception 'completed payment requests cannot change status';
  end if;
  if p_status not in ('draft', 'active', 'cancelled', 'expired') and p_status is distinct from current.status then
    raise exception 'invalid payment request status';
  end if;
  if p_status = 'cancelled' and current.status not in ('draft', 'active') then
    raise exception 'cannot cancel this payment request';
  end if;
  update public.payment_requests
  set status = p_status
  where id = current.id
  returning * into current;
  return current;
end;
$$;

revoke all on function public.admin_set_payment_request_status(uuid, text) from public, anon;
grant execute on function public.admin_set_payment_request_status(uuid, text) to authenticated;

create or replace function public.public_create_guest_payment_request(
  p_guest_name text,
  p_guest_email text,
  p_currency text,
  p_amount_minor bigint,
  p_service_code text,
  p_description text
)
returns public.payment_requests
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  created public.payment_requests;
  recent integer;
  service text;
begin
  if public.currency_minor_units(p_currency) is null then
    raise exception 'unsupported currency';
  end if;
  if p_amount_minor is null or p_amount_minor < 100 or p_amount_minor > 9999999900 then
    raise exception 'invalid payment amount';
  end if;
  service := nullif(btrim(p_service_code), '');
  if service is null then
    raise exception 'select a service';
  end if;
  if nullif(btrim(p_guest_email), '') is null or nullif(btrim(p_guest_name), '') is null then
    raise exception 'guest name and email are required';
  end if;
  select count(*) into recent
  from public.payment_requests
  where guest_email = lower(btrim(p_guest_email))
    and created_at > now() - interval '1 hour';
  if recent >= 5 then
    raise exception 'payment could not be started';
  end if;
  insert into public.payment_requests (
    guest_email, guest_name, currency, requested_amount_minor, amount_mode,
    service_code, service_snapshot, description, status
  ) values (
    lower(btrim(p_guest_email)),
    btrim(p_guest_name),
    p_currency,
    p_amount_minor,
    'fixed',
    service,
    jsonb_build_object('service_code', service, 'captured_at', now()),
    nullif(btrim(p_description), ''),
    'active'
  )
  returning * into created;
  return created;
end;
$$;

revoke all on function public.public_create_guest_payment_request(text, text, text, bigint, text, text) from public;
grant execute on function public.public_create_guest_payment_request(text, text, text, bigint, text, text)
  to anon, authenticated;

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
  select * into current from public.payment_requests where public_id = p_public_id;
  if current.id is null then
    return jsonb_build_object('status', 'not_found');
  end if;
  if current.status in ('expired') or (current.expires_at is not null and current.expires_at <= now()) then
    return jsonb_build_object(
      'public_id', current.public_id,
      'status', 'expired',
      'currency', current.currency
    );
  end if;
  if current.status in ('cancelled', 'draft') then
    return jsonb_build_object(
      'public_id', current.public_id,
      'status', current.status,
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
    'guest', current.guest_email is not null,
    'has_invoice', current.invoice_id is not null
  );
end;
$$;

revoke all on function public.public_get_payment_request(text) from public;
grant execute on function public.public_get_payment_request(text) to anon, authenticated;

create or replace function public.public_get_attempt_status(p_public_id text)
returns jsonb
language plpgsql
stable
security definer
set search_path = pg_catalog, public
as $$
declare
  attempt public.payment_attempts;
  request public.payment_requests;
begin
  select * into attempt from public.payment_attempts where public_id = p_public_id;
  if attempt.id is null then
    return jsonb_build_object('status', 'not_found');
  end if;
  select * into request from public.payment_requests where id = attempt.payment_request_id;
  return jsonb_build_object(
    'public_id', attempt.public_id,
    'status', attempt.status,
    'currency', attempt.currency,
    'amount_minor', attempt.amount_minor,
    'provider', attempt.provider,
    'request_status', request.status,
    'review_reason', attempt.review_reason
  );
end;
$$;

revoke all on function public.public_get_attempt_status(text) from public;
grant execute on function public.public_get_attempt_status(text) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Attempts + finalization
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
  if request.id is null then
    raise exception 'payment request not found';
  end if;
  if request.expires_at is not null and request.expires_at <= now() then
    update public.payment_requests set status = 'expired' where id = request.id and status = 'active';
    raise exception 'payment request expired';
  end if;
  if request.status <> 'active' then
    raise exception 'payment request is not active';
  end if;
  select * into provider from public.payment_providers where code = p_provider;
  if provider.code is null then
    raise exception 'provider not found';
  end if;
  if provider.eligibility = 'business_only' and request.organization_id is null then
    raise exception 'this payment method is for business customers only';
  end if;
  if provider.operational_state <> 'enabled' then
    raise exception 'payment method unavailable';
  end if;
  if coalesce((provider.capabilities->>'checkout')::boolean, false) is not true then
    raise exception 'payment method unavailable';
  end if;
  if provider.code = 'development_test'
     and public.payment_runtime_environment() is distinct from 'development' then
    raise exception 'payment method unavailable';
  end if;
  if not (request.currency = any (provider.supported_currencies)) then
    raise exception 'unsupported currency';
  end if;

  if request.amount_mode = 'fixed' then
    amount := request.requested_amount_minor;
  else
    amount := p_amount_minor;
    if amount is null or amount < request.min_amount_minor or amount > request.max_amount_minor then
      raise exception 'invalid payment amount';
    end if;
  end if;
  if amount is null or amount <= 0 then
    raise exception 'invalid payment amount';
  end if;

  if request.invoice_id is not null then
    select * into invoice from public.invoices where id = request.invoice_id for update;
    if invoice.status not in ('issued', 'partially_paid') then
      raise exception 'invoice is not payable';
    end if;
    if request.currency is distinct from invoice.currency then
      raise exception 'currency mismatch';
    end if;
    if amount > (invoice.total_minor - invoice.amount_paid_minor) then
      raise exception 'cannot request more than invoice amount due';
    end if;
  end if;

  select count(*) into recent
  from public.payment_attempts
  where payment_request_id = request.id
    and created_at > now() - interval '1 hour';
  if recent >= 20 then
    raise exception 'payment could not be started';
  end if;

  if request.guest_email is not null and request.individual_user_id is null and request.organization_id is null then
    if nullif(btrim(p_guest_email), '') is null then
      raise exception 'guest email is required';
    end if;
  end if;

  ingest_raw := encode(gen_random_bytes(32), 'hex');
  insert into public.payment_attempts (
    payment_request_id, provider, currency, amount_minor, status, ingest_key_hash
  ) values (
    request.id,
    provider.code,
    request.currency,
    amount,
    'pending',
    public.sha256_hex(ingest_raw)
  )
  returning * into created;

  return jsonb_build_object(
    'public_id', created.public_id,
    'status', created.status,
    'provider', created.provider,
    'currency', created.currency,
    'amount_minor', created.amount_minor,
    'ingest_key', ingest_raw
  );
end;
$$;

revoke all on function public.create_payment_attempt(text, text, bigint, text, text) from public;
grant execute on function public.create_payment_attempt(text, text, bigint, text, text)
  to anon, authenticated;

create or replace function public.finalize_confirmed_payment(
  p_event_id uuid
)
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
      return jsonb_build_object(
        'duplicate', true,
        'processing_status', existing.processing_status,
        'payment_public_id', payment.public_id,
        'attempt_public_id', attempt.public_id,
        'attempt_status', attempt.status
      );
    end if;
    if existing.processing_status in ('processed', 'mismatch') then
      return jsonb_build_object(
        'duplicate', true,
        'processing_status', existing.processing_status,
        'attempt_public_id', attempt.public_id,
        'attempt_status', attempt.status
      );
    end if;
    event := existing;
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

create or replace function public.mark_attempt_cancelled(p_attempt_public_id text, p_ingest_key text)
returns public.payment_attempts
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  attempt public.payment_attempts;
begin
  select * into attempt
  from public.payment_attempts
  where public_id = p_attempt_public_id
    and ingest_key_hash = public.sha256_hex(p_ingest_key)
  for update;
  if attempt.id is null then
    raise exception 'payment attempt not found';
  end if;
  if attempt.status in ('succeeded', 'review_required') then
    return attempt;
  end if;
  update public.payment_attempts
  set status = 'cancelled', completed_at = now()
  where id = attempt.id
  returning * into attempt;
  return attempt;
end;
$$;

revoke all on function public.mark_attempt_cancelled(text, text) from public;
grant execute on function public.mark_attempt_cancelled(text, text) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Access + RLS
-- ---------------------------------------------------------------------------
create or replace function public.can_access_payment_request(p_request_id uuid)
returns boolean
language plpgsql
stable
security definer
set search_path = pg_catalog, public
as $$
declare
  current public.payment_requests;
  actor uuid;
begin
  actor := (select auth.uid());
  if actor is null then
    return false;
  end if;
  if public.is_platform_admin() then
    return true;
  end if;
  select * into current from public.payment_requests where id = p_request_id;
  if current.id is null then
    return false;
  end if;
  if current.status = 'draft' then
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

revoke all on function public.can_access_payment_request(uuid) from public, anon;
grant execute on function public.can_access_payment_request(uuid) to authenticated;

revoke all on table public.payment_runtime_settings from public, anon, authenticated;
revoke all on table public.payment_providers from public, anon, authenticated;
revoke all on table public.payment_requests from public, anon, authenticated;
revoke all on table public.payment_attempts from public, anon, authenticated;
revoke all on table public.payment_provider_events from public, anon, authenticated;

grant select on table public.payment_runtime_settings to authenticated;
grant select on table public.payment_providers to authenticated;
grant select on table public.payment_requests to authenticated;
grant select on table public.payment_attempts to authenticated;
grant select on table public.payment_provider_events to authenticated;

alter table public.payment_runtime_settings enable row level security;
alter table public.payment_runtime_settings force row level security;
alter table public.payment_providers enable row level security;
alter table public.payment_providers force row level security;
alter table public.payment_requests enable row level security;
alter table public.payment_requests force row level security;
alter table public.payment_attempts enable row level security;
alter table public.payment_attempts force row level security;
alter table public.payment_provider_events enable row level security;
alter table public.payment_provider_events force row level security;

create policy payment_runtime_settings_select_admin
  on public.payment_runtime_settings
  for select to authenticated
  using (public.is_platform_admin());

create policy payment_providers_select_admin
  on public.payment_providers
  for select to authenticated
  using (public.is_platform_admin());

create or replace function public.public_list_checkout_providers()
returns jsonb
language plpgsql
stable
security definer
set search_path = pg_catalog, public
as $$
begin
  return coalesce((
    select jsonb_agg(jsonb_build_object(
      'code', code,
      'display_name', display_name,
      'business_only', eligibility = 'business_only'
    ) order by display_name)
    from public.payment_providers
    where operational_state = 'enabled'
      and coalesce((capabilities->>'checkout')::boolean, false) = true
      and (
        code <> 'development_test'
        or public.payment_runtime_environment() = 'development'
      )
  ), '[]'::jsonb);
end;
$$;

revoke all on function public.public_list_checkout_providers() from public;
grant execute on function public.public_list_checkout_providers() to anon, authenticated;

create policy payment_requests_select_related
  on public.payment_requests
  for select to authenticated
  using (public.can_access_payment_request(id));

create policy payment_attempts_select_related
  on public.payment_attempts
  for select to authenticated
  using (
    public.is_platform_admin()
    or public.can_access_payment_request(payment_request_id)
  );

create policy payment_provider_events_select_admin
  on public.payment_provider_events
  for select to authenticated
  using (public.is_platform_admin());

create or replace function public.public_get_guest_receipt(
  p_attempt_public_id text,
  p_ingest_key text
)
returns jsonb
language plpgsql
stable
security definer
set search_path = pg_catalog, public
as $$
declare
  attempt public.payment_attempts;
  receipt public.receipts;
begin
  if p_ingest_key is null or char_length(p_ingest_key) < 32 then
    return jsonb_build_object('status', 'not_found');
  end if;
  select * into attempt
  from public.payment_attempts
  where public_id = p_attempt_public_id
    and ingest_key_hash = public.sha256_hex(p_ingest_key);
  if attempt.id is null or attempt.payment_id is null then
    return jsonb_build_object('status', 'not_found');
  end if;
  select * into receipt from public.receipts where payment_id = attempt.payment_id;
  if receipt.id is null then
    return jsonb_build_object('status', 'not_found');
  end if;
  return jsonb_build_object(
    'status', 'ok',
    'receipt_number', receipt.receipt_number,
    'currency', receipt.currency,
    'amount_minor', receipt.amount_minor,
    'issued_at', receipt.issued_at
  );
end;
$$;

revoke all on function public.public_get_guest_receipt(text, text) from public;
grant execute on function public.public_get_guest_receipt(text, text) to anon, authenticated;
