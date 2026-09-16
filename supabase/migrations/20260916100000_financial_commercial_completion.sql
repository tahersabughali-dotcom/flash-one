-- Phase 2: commercial catalog, refunds, adjustments, credit notes, tax foundation,
-- quote snapshots, store-order invoices, and ledger event extensions.
-- Forward only. Does not rewrite historical migrations or payment ingest paths.

-- ---------------------------------------------------------------------------
-- Commercial service catalog (not Store products)
-- ---------------------------------------------------------------------------
create table public.commercial_services (
  id uuid primary key default gen_random_uuid(),
  public_id text not null default public.random_public_id('SVC-'),
  name text not null,
  description text not null,
  category text not null,
  status text not null default 'active',
  customer_visible boolean not null default false,
  commercial_mode text not null,
  default_currency text,
  default_price_minor bigint,
  internal_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by_user_id uuid references auth.users (id) on delete restrict,
  constraint commercial_services_name_length_check
    check (char_length(name) between 1 and 160),
  constraint commercial_services_description_length_check
    check (char_length(description) between 1 and 4000),
  constraint commercial_services_category_check
    check (category in (
      'software_development',
      'web_systems',
      'applications',
      'automation',
      'ai_solutions',
      'it_consultancy',
      'technical_support',
      'system_setup',
      'custom_software',
      'technology_services',
      'other'
    )),
  constraint commercial_services_status_check
    check (status in ('active', 'archived')),
  constraint commercial_services_mode_check
    check (commercial_mode in ('quote_required', 'fixed_price')),
  constraint commercial_services_currency_check
    check (default_currency is null or default_currency in ('GBP', 'USD', 'EUR')),
  constraint commercial_services_price_check
    check (default_price_minor is null or default_price_minor >= 0),
  constraint commercial_services_fixed_price_check
    check (
      (commercial_mode = 'quote_required' and default_price_minor is null and default_currency is null)
      or (commercial_mode = 'fixed_price' and default_price_minor is not null and default_currency is not null)
    ),
  constraint commercial_services_internal_notes_length_check
    check (internal_notes is null or char_length(internal_notes) between 1 and 4000),
  constraint commercial_services_public_id_format_check
    check (public_id ~ '^SVC-[A-F0-9]{12}$'),
  constraint commercial_services_public_id_key unique (public_id),
  constraint commercial_services_name_key unique (name)
);

comment on table public.commercial_services is
  'Internal commercial service catalog. Independent from Store products. Not a transaction.';

create trigger commercial_services_set_updated_at
  before update on public.commercial_services
  for each row
  execute function public.set_updated_at();

create index commercial_services_status_visible_idx
  on public.commercial_services (status, customer_visible);

alter table public.work_requests
  add column catalog_service_id uuid references public.commercial_services (id) on delete restrict,
  add column catalog_snapshot jsonb not null default '{}'::jsonb;

create index work_requests_catalog_service_id_idx
  on public.work_requests (catalog_service_id);

create or replace function public.work_request_snapshot_catalog()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  service public.commercial_services;
begin
  if new.catalog_service_id is null then
    return new;
  end if;
  select * into service
  from public.commercial_services
  where id = new.catalog_service_id;
  if service.id is null then
    raise exception 'catalog service not found';
  end if;
  if not public.is_platform_admin()
     and (service.status <> 'active' or service.customer_visible is not true) then
    raise exception 'catalog service is not available';
  end if;
  new.catalog_snapshot := jsonb_build_object(
    'public_id', service.public_id,
    'name', service.name,
    'description', service.description,
    'category', service.category,
    'commercial_mode', service.commercial_mode,
    'default_currency', service.default_currency,
    'default_price_minor', service.default_price_minor
  );
  return new;
end;
$$;

create trigger work_requests_snapshot_catalog
  before insert or update of catalog_service_id
  on public.work_requests
  for each row
  execute function public.work_request_snapshot_catalog();

alter table public.quotes
  add column commercial_snapshot jsonb not null default '{}'::jsonb;

comment on column public.quotes.commercial_snapshot is
  'Immutable commercial meaning captured when the quote is issued. Catalog changes do not rewrite this snapshot.';

-- ---------------------------------------------------------------------------
-- Optional tax foundation (disabled). Invoice tax_minor remains 0.
-- ---------------------------------------------------------------------------
create table public.platform_tax_settings (
  id smallint primary key default 1,
  enabled boolean not null default false,
  rate_basis_points integer not null default 0,
  label text,
  updated_at timestamptz not null default now(),
  constraint platform_tax_settings_singleton_check check (id = 1),
  constraint platform_tax_settings_rate_check
    check (rate_basis_points >= 0 and rate_basis_points <= 10000),
  constraint platform_tax_settings_label_length_check
    check (label is null or char_length(label) between 1 and 80)
);

comment on table public.platform_tax_settings is
  'Optional tax configuration foundation. Disabled by default. Flash One is not assumed VAT registered.';

insert into public.platform_tax_settings (id, enabled, rate_basis_points, label)
values (1, false, 0, null)
on conflict (id) do nothing;

alter table public.invoices
  add column tax_snapshot jsonb not null default jsonb_build_object(
    'enabled', false,
    'rate_basis_points', 0,
    'label', null
  );

comment on column public.invoices.tax_snapshot is
  'Tax configuration snapshot. V1 remains disabled and tax_minor stays 0.';

-- ---------------------------------------------------------------------------
-- Manual payment evidence fields
-- ---------------------------------------------------------------------------
alter table public.payments
  add column notes text,
  add column manual_reference text;

alter table public.payments
  add constraint payments_notes_length_check
    check (notes is null or char_length(notes) between 1 and 4000),
  add constraint payments_manual_reference_length_check
    check (manual_reference is null or char_length(manual_reference) between 1 and 160);

-- ---------------------------------------------------------------------------
-- Refunds (internal records; no provider refund APIs)
-- ---------------------------------------------------------------------------
create table public.refunds (
  id uuid primary key default gen_random_uuid(),
  public_id text not null default public.random_public_id('REF-'),
  payment_id uuid not null references public.payments (id) on delete restrict,
  amount_minor bigint not null,
  currency text not null,
  reason text not null,
  status text not null,
  recorded_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  created_by_user_id uuid references auth.users (id) on delete restrict,
  constraint refunds_amount_check check (amount_minor > 0),
  constraint refunds_currency_check check (currency in ('GBP', 'USD', 'EUR')),
  constraint refunds_reason_length_check
    check (char_length(reason) between 1 and 400),
  constraint refunds_status_check
    check (status in ('recorded', 'pending_external', 'completed_manual')),
  constraint refunds_public_id_format_check
    check (public_id ~ '^REF-[A-F0-9]{12}$'),
  constraint refunds_public_id_key unique (public_id)
);

comment on table public.refunds is
  'Internal refund records. Original payment amount is immutable. Does not claim a provider refund API executed.';

create index refunds_payment_id_idx on public.refunds (payment_id);

-- ---------------------------------------------------------------------------
-- Financial adjustments
-- ---------------------------------------------------------------------------
create table public.financial_adjustments (
  id uuid primary key default gen_random_uuid(),
  public_id text not null default public.random_public_id('ADJ-'),
  kind text not null,
  amount_minor bigint not null,
  currency text not null,
  reason text not null,
  status text not null default 'recorded',
  payment_id uuid references public.payments (id) on delete restrict,
  invoice_id uuid references public.invoices (id) on delete restrict,
  created_at timestamptz not null default now(),
  created_by_user_id uuid references auth.users (id) on delete restrict,
  constraint financial_adjustments_kind_check
    check (kind in ('accounting_correction', 'allocation_correction', 'manual_adjustment')),
  constraint financial_adjustments_amount_check check (amount_minor > 0),
  constraint financial_adjustments_currency_check check (currency in ('GBP', 'USD', 'EUR')),
  constraint financial_adjustments_reason_length_check
    check (char_length(reason) between 1 and 400),
  constraint financial_adjustments_status_check
    check (status in ('recorded')),
  constraint financial_adjustments_public_id_format_check
    check (public_id ~ '^ADJ-[A-F0-9]{12}$'),
  constraint financial_adjustments_public_id_key unique (public_id)
);

comment on table public.financial_adjustments is
  'Corrections that do not rewrite immutable payment or invoice history.';

create index financial_adjustments_payment_id_idx on public.financial_adjustments (payment_id);
create index financial_adjustments_invoice_id_idx on public.financial_adjustments (invoice_id);

-- ---------------------------------------------------------------------------
-- Credit notes (do not rewrite issued invoices)
-- ---------------------------------------------------------------------------
create sequence public.credit_note_number_seq;

create table public.credit_notes (
  id uuid primary key default gen_random_uuid(),
  public_id text not null default public.random_public_id('CRN-'),
  credit_note_number text,
  invoice_id uuid not null references public.invoices (id) on delete restrict,
  amount_minor bigint not null,
  currency text not null,
  reason text not null,
  status text not null default 'draft',
  notes text,
  issued_at timestamptz,
  voided_at timestamptz,
  created_at timestamptz not null default now(),
  created_by_user_id uuid references auth.users (id) on delete restrict,
  constraint credit_notes_amount_check check (amount_minor > 0),
  constraint credit_notes_currency_check check (currency in ('GBP', 'USD', 'EUR')),
  constraint credit_notes_reason_length_check
    check (char_length(reason) between 1 and 400),
  constraint credit_notes_notes_length_check
    check (notes is null or char_length(notes) between 1 and 4000),
  constraint credit_notes_status_check
    check (status in ('draft', 'issued', 'void')),
  constraint credit_notes_public_id_format_check
    check (public_id ~ '^CRN-[A-F0-9]{12}$'),
  constraint credit_notes_public_id_key unique (public_id),
  constraint credit_notes_number_key unique (credit_note_number)
);

comment on table public.credit_notes is
  'Reduces remaining invoice balance without rewriting the original invoice. Not a UK VAT credit-note claim.';

create index credit_notes_invoice_id_idx on public.credit_notes (invoice_id);

-- ---------------------------------------------------------------------------
-- Ledger constraint extensions
-- ---------------------------------------------------------------------------
alter table public.financial_ledger_entries
  drop constraint financial_ledger_entries_event_type_check;
alter table public.financial_ledger_entries
  add constraint financial_ledger_entries_event_type_check
    check (event_type in (
      'manual_payment_recorded',
      'payment_received',
      'payment_allocated',
      'refund_recorded',
      'credit_note_issued',
      'adjustment_recorded'
    ));

alter table public.financial_ledger_entries
  drop constraint financial_ledger_entries_direction_check;
alter table public.financial_ledger_entries
  add constraint financial_ledger_entries_direction_check
    check (direction in ('in', 'allocation', 'out'));

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------
create or replace function public.invoice_credit_issued_minor(p_invoice_id uuid)
returns bigint
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select coalesce(sum(amount_minor), 0)::bigint
  from public.credit_notes
  where invoice_id = p_invoice_id
    and status = 'issued';
$$;

revoke all on function public.invoice_credit_issued_minor(uuid) from public, anon, authenticated;

create or replace function public.payment_refunded_minor(p_payment_id uuid)
returns bigint
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select coalesce(sum(amount_minor), 0)::bigint
  from public.refunds
  where payment_id = p_payment_id
    and status in ('recorded', 'completed_manual');
$$;

revoke all on function public.payment_refunded_minor(uuid) from public, anon, authenticated;

create or replace function public.sync_invoice_payment_state(p_invoice_id uuid)
returns public.invoices
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  current public.invoices;
  allocated bigint;
  credited bigint;
  covered bigint;
begin
  select * into current from public.invoices where id = p_invoice_id for update;
  if current.id is null then
    raise exception 'invoice not found';
  end if;
  if current.status in ('draft', 'void') then
    return current;
  end if;
  allocated := public.invoice_allocated_minor(current.id);
  credited := public.invoice_credit_issued_minor(current.id);
  covered := allocated + credited;
  if covered = 0 then
    update public.invoices
    set amount_paid_minor = 0, status = 'issued', paid_at = null
    where id = current.id
    returning * into current;
  elsif covered < current.total_minor then
    update public.invoices
    set amount_paid_minor = allocated, status = 'partially_paid', paid_at = null
    where id = current.id
    returning * into current;
  else
    update public.invoices
    set
      amount_paid_minor = allocated,
      status = 'paid',
      paid_at = coalesce(current.paid_at, now())
    where id = current.id
    returning * into current;
  end if;
  return current;
end;
$$;

revoke all on function public.sync_invoice_payment_state(uuid) from public, anon, authenticated;

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
  payment public.payments;
  invoice public.invoices;
  existing public.payment_allocations;
  payment_remaining bigint;
  invoice_due bigint;
begin
  actor := public.assert_platform_admin();
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
  if (payment.individual_user_id is distinct from invoice.individual_user_id)
     or (payment.organization_id is distinct from invoice.organization_id) then
    raise exception 'payment and invoice owners do not match';
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
  invoice_due := invoice.total_minor
    - public.invoice_allocated_minor(invoice.id)
    - public.invoice_credit_issued_minor(invoice.id);
  if p_amount_minor > payment_remaining then
    raise exception 'allocation exceeds payment remaining';
  end if;
  if p_amount_minor > invoice_due then
    raise exception 'allocation exceeds invoice amount due';
  end if;

  insert into public.payment_allocations (
    payment_id, invoice_id, amount_minor, allocated_by_user_id
  )
  values (payment.id, invoice.id, p_amount_minor, actor)
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

revoke all on function public.admin_allocate_payment(uuid, uuid, bigint) from public, anon;
grant execute on function public.admin_allocate_payment(uuid, uuid, bigint) to authenticated;

create or replace function public.admin_issue_quote(
  p_work_request_id uuid,
  p_currency text,
  p_valid_until date,
  p_customer_notes text,
  p_lines jsonb
)
returns public.quotes
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  request public.work_requests;
  created public.quotes;
  next_version integer;
  line jsonb;
  pos integer := 0;
  qty integer;
  unit_minor bigint;
  desc_text text;
  subtotal bigint := 0;
  notes text;
  snapshot jsonb;
begin
  perform public.assert_platform_admin();

  select * into request
  from public.work_requests
  where id = p_work_request_id
  for update;

  if request.id is null then
    raise exception 'work request not found';
  end if;

  if request.status not in ('under_review', 'needs_information', 'qualified') then
    raise exception 'quote can only be issued for a reviewed or qualified request';
  end if;

  if p_currency not in ('GBP', 'USD', 'EUR') then
    raise exception 'unsupported currency';
  end if;

  if p_valid_until is null or p_valid_until < current_date then
    raise exception 'valid-until date must be today or later';
  end if;

  if jsonb_typeof(p_lines) is distinct from 'array' or jsonb_array_length(p_lines) < 1 then
    raise exception 'quote requires line items';
  end if;

  notes := nullif(left(trim(coalesce(p_customer_notes, '')), 4000), '');

  select coalesce(max(version), 0) + 1 into next_version
  from public.quotes
  where work_request_id = request.id;

  insert into public.quotes (
    work_request_id,
    version,
    currency,
    subtotal_minor,
    tax_minor,
    total_minor,
    status,
    valid_until,
    customer_notes
  )
  values (
    request.id,
    next_version,
    p_currency,
    0,
    0,
    0,
    'draft',
    p_valid_until,
    notes
  )
  returning * into created;

  for line in select value from jsonb_array_elements(p_lines)
  loop
    pos := pos + 1;
    desc_text := left(trim(coalesce(line->>'description', '')), 200);
    qty := coalesce((line->>'quantity')::integer, 0);
    unit_minor := coalesce((line->>'unit_amount_minor')::bigint, -1);

    if desc_text = '' or qty < 1 or unit_minor < 0 then
      raise exception 'invalid quote line item';
    end if;

    insert into public.quote_line_items (
      quote_id,
      position,
      description,
      quantity,
      unit_amount_minor,
      line_total_minor
    )
    values (
      created.id,
      pos,
      desc_text,
      qty,
      unit_minor,
      qty * unit_minor
    );

    subtotal := subtotal + (qty * unit_minor);
  end loop;

  update public.quotes
  set status = 'superseded'
  where work_request_id = request.id
    and status = 'sent'
    and id <> created.id;

  select jsonb_build_object(
    'currency', p_currency,
    'subtotal_minor', subtotal,
    'tax_minor', 0,
    'total_minor', subtotal,
    'valid_until', p_valid_until,
    'customer_notes', notes,
    'catalog_snapshot', request.catalog_snapshot,
    'lines', coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'position', item.position,
            'description', item.description,
            'quantity', item.quantity,
            'unit_amount_minor', item.unit_amount_minor,
            'line_total_minor', item.line_total_minor
          )
          order by item.position
        )
        from public.quote_line_items as item
        where item.quote_id = created.id
      ),
      '[]'::jsonb
    )
  )
  into snapshot;

  update public.quotes
  set
    subtotal_minor = subtotal,
    tax_minor = 0,
    total_minor = subtotal,
    status = 'sent',
    sent_at = now(),
    commercial_snapshot = snapshot
  where id = created.id
  returning * into created;

  if request.status <> 'qualified' then
    update public.work_requests
    set status = 'qualified'
    where id = request.id;
  end if;

  return created;
end;
$$;

revoke all on function public.admin_issue_quote(uuid, text, date, text, jsonb) from public, anon;
grant execute on function public.admin_issue_quote(uuid, text, date, text, jsonb) to authenticated;

-- ---------------------------------------------------------------------------
-- Catalog RPCs
-- ---------------------------------------------------------------------------
create or replace function public.admin_upsert_commercial_service(
  p_public_id text,
  p_name text,
  p_description text,
  p_category text,
  p_status text,
  p_customer_visible boolean,
  p_commercial_mode text,
  p_default_currency text,
  p_default_price_minor bigint,
  p_internal_notes text
)
returns public.commercial_services
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  actor uuid;
  current public.commercial_services;
  currency text;
  price bigint;
  notes text;
begin
  actor := public.assert_platform_admin();
  currency := nullif(btrim(coalesce(p_default_currency, '')), '');
  price := p_default_price_minor;
  notes := nullif(btrim(coalesce(p_internal_notes, '')), '');
  if p_commercial_mode = 'quote_required' then
    currency := null;
    price := null;
  end if;

  if p_public_id is not null and btrim(p_public_id) <> '' then
    select * into current
    from public.commercial_services
    where public_id = p_public_id
    for update;
    if current.id is null then
      raise exception 'catalog service not found';
    end if;
    update public.commercial_services
    set
      name = p_name,
      description = p_description,
      category = p_category,
      status = p_status,
      customer_visible = coalesce(p_customer_visible, false),
      commercial_mode = p_commercial_mode,
      default_currency = currency,
      default_price_minor = price,
      internal_notes = notes
    where id = current.id
    returning * into current;
    return current;
  end if;

  insert into public.commercial_services (
    name,
    description,
    category,
    status,
    customer_visible,
    commercial_mode,
    default_currency,
    default_price_minor,
    internal_notes,
    created_by_user_id
  )
  values (
    p_name,
    p_description,
    p_category,
    coalesce(nullif(p_status, ''), 'active'),
    coalesce(p_customer_visible, false),
    p_commercial_mode,
    currency,
    price,
    notes,
    actor
  )
  returning * into current;
  return current;
end;
$$;

revoke all on function public.admin_upsert_commercial_service(text, text, text, text, text, boolean, text, text, bigint, text)
  from public, anon;
grant execute on function public.admin_upsert_commercial_service(text, text, text, text, text, boolean, text, text, bigint, text)
  to authenticated;

-- ---------------------------------------------------------------------------
-- Manual payment with truthful evidence fields
-- ---------------------------------------------------------------------------
create or replace function public.admin_record_manual_payment_evidence(
  p_individual_public_id text,
  p_organization_public_id text,
  p_currency text,
  p_amount_minor bigint,
  p_notes text,
  p_manual_reference text,
  p_received_at timestamptz
)
returns public.payments
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  actor uuid;
  individual_id uuid;
  organization_id uuid;
  created public.payments;
  notes text;
  reference text;
  received timestamptz;
begin
  actor := public.assert_platform_admin();
  if public.currency_minor_units(p_currency) is null then
    raise exception 'unsupported currency';
  end if;
  if p_amount_minor is null or p_amount_minor <= 0 then
    raise exception 'invalid payment amount';
  end if;
  if p_individual_public_id is not null and btrim(p_individual_public_id) <> '' then
    select user_id into individual_id
    from public.individual_accounts
    where public_id = p_individual_public_id;
  end if;
  if p_organization_public_id is not null and btrim(p_organization_public_id) <> '' then
    select id into organization_id
    from public.organizations
    where public_id = p_organization_public_id;
  end if;
  if individual_id is not null and organization_id is not null then
    raise exception 'payment cannot have both individual and organization owners';
  end if;
  if individual_id is null and organization_id is null then
    raise exception 'payment requires a customer or business';
  end if;

  notes := nullif(btrim(coalesce(p_notes, '')), '');
  reference := nullif(btrim(coalesce(p_manual_reference, '')), '');
  received := coalesce(p_received_at, now());

  insert into public.payments (
    individual_user_id,
    organization_id,
    currency,
    amount_minor,
    status,
    source_type,
    received_at,
    created_by_user_id,
    notes,
    manual_reference
  )
  values (
    individual_id,
    organization_id,
    p_currency,
    p_amount_minor,
    'succeeded',
    'manual',
    received,
    actor,
    notes,
    reference
  )
  returning * into created;

  perform public.post_financial_ledger_entry(
    'manual_payment_recorded',
    created.currency,
    created.amount_minor,
    'in',
    created.id,
    null,
    null,
    created.public_id
  );
  perform public.admin_issue_receipt(created.id);
  return created;
end;
$$;

revoke all on function public.admin_record_manual_payment_evidence(text, text, text, bigint, text, text, timestamptz)
  from public, anon;
grant execute on function public.admin_record_manual_payment_evidence(text, text, text, bigint, text, text, timestamptz)
  to authenticated;

-- ---------------------------------------------------------------------------
-- Store order invoice (opt-in; never auto-created)
-- ---------------------------------------------------------------------------
create or replace function public.admin_create_invoice_from_store_order(
  p_store_order_public_id text
)
returns public.invoices
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  actor uuid;
  order_row public.store_orders;
  created public.invoices;
  item public.store_order_items;
  pos integer := 0;
  lines jsonb := '[]'::jsonb;
begin
  actor := public.assert_platform_admin();
  select * into order_row
  from public.store_orders
  where public_id = p_store_order_public_id
  for update;
  if order_row.id is null then
    raise exception 'store order not found';
  end if;
  if order_row.invoice_id is not null then
    select * into created from public.invoices where id = order_row.invoice_id;
    return created;
  end if;
  if order_row.individual_user_id is null and order_row.organization_id is null then
    raise exception 'store order requires a customer or business for invoicing';
  end if;

  for item in
    select * from public.store_order_items
    where order_id = order_row.id
    order by created_at
  loop
    pos := pos + 1;
    lines := lines || jsonb_build_array(jsonb_build_object(
      'description', left(item.product_name, 200),
      'quantity', item.quantity,
      'unit_amount_minor', item.unit_price_minor
    ));
  end loop;
  if pos < 1 then
    raise exception 'store order has no line items';
  end if;

  created := public.admin_create_invoice(
    coalesce((
      select public_id from public.individual_accounts
      where user_id = order_row.individual_user_id
    ), ''),
    coalesce((
      select public_id from public.organizations
      where id = order_row.organization_id
    ), ''),
    '',
    '',
    '',
    order_row.currency,
    null,
    'Created from store order ' || order_row.public_id,
    lines
  );

  update public.store_orders
  set invoice_id = created.id
  where id = order_row.id;

  return created;
end;
$$;

revoke all on function public.admin_create_invoice_from_store_order(text) from public, anon;
grant execute on function public.admin_create_invoice_from_store_order(text) to authenticated;

-- ---------------------------------------------------------------------------
-- Refunds
-- ---------------------------------------------------------------------------
create or replace function public.admin_record_refund(
  p_payment_public_id text,
  p_amount_minor bigint,
  p_reason text,
  p_status text
)
returns public.refunds
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  actor uuid;
  payment public.payments;
  created public.refunds;
  refunded bigint;
  refundable bigint;
  next_status text;
begin
  actor := public.assert_platform_admin();
  if p_amount_minor is null or p_amount_minor <= 0 then
    raise exception 'invalid refund amount';
  end if;
  if p_status not in ('recorded', 'pending_external', 'completed_manual') then
    raise exception 'invalid refund status';
  end if;
  if char_length(btrim(coalesce(p_reason, ''))) < 1 then
    raise exception 'refund requires a reason';
  end if;

  select * into payment from public.payments where public_id = p_payment_public_id for update;
  if payment.id is null then
    raise exception 'payment not found';
  end if;
  if payment.status not in ('succeeded', 'partially_refunded', 'refunded') then
    raise exception 'payment is not eligible for refund';
  end if;
  if payment.review_required then
    raise exception 'cannot refund a payment that requires review';
  end if;

  refunded := public.payment_refunded_minor(payment.id);
  refundable := payment.amount_minor - refunded;
  if p_amount_minor > refundable then
    raise exception 'refund exceeds refundable amount';
  end if;

  insert into public.refunds (
    payment_id,
    amount_minor,
    currency,
    reason,
    status,
    created_by_user_id
  )
  values (
    payment.id,
    p_amount_minor,
    payment.currency,
    btrim(p_reason),
    p_status,
    actor
  )
  returning * into created;

  if p_status in ('recorded', 'completed_manual') then
    perform public.post_financial_ledger_entry(
      'refund_recorded',
      payment.currency,
      p_amount_minor,
      'out',
      payment.id,
      null,
      null,
      created.public_id
    );
    refunded := refunded + p_amount_minor;
    if refunded >= payment.amount_minor then
      next_status := 'refunded';
    else
      next_status := 'partially_refunded';
    end if;
    update public.payments
    set status = next_status
    where id = payment.id;
  end if;

  return created;
end;
$$;

revoke all on function public.admin_record_refund(text, bigint, text, text) from public, anon;
grant execute on function public.admin_record_refund(text, bigint, text, text) to authenticated;

-- ---------------------------------------------------------------------------
-- Adjustments
-- ---------------------------------------------------------------------------
create or replace function public.admin_record_adjustment(
  p_kind text,
  p_amount_minor bigint,
  p_currency text,
  p_reason text,
  p_payment_public_id text,
  p_invoice_public_id text
)
returns public.financial_adjustments
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  actor uuid;
  created public.financial_adjustments;
  payment_id uuid;
  invoice_id uuid;
begin
  actor := public.assert_platform_admin();
  if p_kind not in ('accounting_correction', 'allocation_correction', 'manual_adjustment') then
    raise exception 'invalid adjustment kind';
  end if;
  if public.currency_minor_units(p_currency) is null then
    raise exception 'unsupported currency';
  end if;
  if p_amount_minor is null or p_amount_minor <= 0 then
    raise exception 'invalid adjustment amount';
  end if;
  if char_length(btrim(coalesce(p_reason, ''))) < 1 then
    raise exception 'adjustment requires a reason';
  end if;
  if p_payment_public_id is not null and btrim(p_payment_public_id) <> '' then
    select id into payment_id from public.payments where public_id = p_payment_public_id;
    if payment_id is null then
      raise exception 'payment not found';
    end if;
  end if;
  if p_invoice_public_id is not null and btrim(p_invoice_public_id) <> '' then
    select id into invoice_id from public.invoices where public_id = p_invoice_public_id;
    if invoice_id is null then
      raise exception 'invoice not found';
    end if;
  end if;

  insert into public.financial_adjustments (
    kind,
    amount_minor,
    currency,
    reason,
    status,
    payment_id,
    invoice_id,
    created_by_user_id
  )
  values (
    p_kind,
    p_amount_minor,
    p_currency,
    btrim(p_reason),
    'recorded',
    payment_id,
    invoice_id,
    actor
  )
  returning * into created;

  perform public.post_financial_ledger_entry(
    'adjustment_recorded',
    created.currency,
    created.amount_minor,
    'out',
    payment_id,
    invoice_id,
    null,
    created.public_id
  );
  return created;
end;
$$;

revoke all on function public.admin_record_adjustment(text, bigint, text, text, text, text) from public, anon;
grant execute on function public.admin_record_adjustment(text, bigint, text, text, text, text) to authenticated;

-- ---------------------------------------------------------------------------
-- Credit notes
-- ---------------------------------------------------------------------------
create or replace function public.admin_create_credit_note(
  p_invoice_public_id text,
  p_amount_minor bigint,
  p_reason text,
  p_notes text
)
returns public.credit_notes
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  actor uuid;
  invoice public.invoices;
  created public.credit_notes;
  remaining bigint;
begin
  actor := public.assert_platform_admin();
  select * into invoice from public.invoices where public_id = p_invoice_public_id for update;
  if invoice.id is null then
    raise exception 'invoice not found';
  end if;
  if invoice.status not in ('issued', 'partially_paid') then
    raise exception 'credit note requires an issued invoice with remaining balance';
  end if;
  if p_amount_minor is null or p_amount_minor <= 0 then
    raise exception 'invalid credit note amount';
  end if;
  if char_length(btrim(coalesce(p_reason, ''))) < 1 then
    raise exception 'credit note requires a reason';
  end if;
  remaining := invoice.total_minor
    - public.invoice_allocated_minor(invoice.id)
    - public.invoice_credit_issued_minor(invoice.id);
  if p_amount_minor > remaining then
    raise exception 'credit note exceeds remaining invoice balance';
  end if;

  insert into public.credit_notes (
    invoice_id,
    amount_minor,
    currency,
    reason,
    notes,
    status,
    created_by_user_id
  )
  values (
    invoice.id,
    p_amount_minor,
    invoice.currency,
    btrim(p_reason),
    nullif(btrim(coalesce(p_notes, '')), ''),
    'draft',
    actor
  )
  returning * into created;
  return created;
end;
$$;

revoke all on function public.admin_create_credit_note(text, bigint, text, text) from public, anon;
grant execute on function public.admin_create_credit_note(text, bigint, text, text) to authenticated;

create or replace function public.admin_issue_credit_note(p_credit_note_id uuid)
returns public.credit_notes
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  actor uuid;
  current public.credit_notes;
  invoice public.invoices;
  remaining bigint;
  seq bigint;
begin
  actor := public.assert_platform_admin();
  select * into current from public.credit_notes where id = p_credit_note_id for update;
  if current.id is null then
    raise exception 'credit note not found';
  end if;
  if current.status = 'issued' then
    return current;
  end if;
  if current.status <> 'draft' then
    raise exception 'credit note cannot be issued';
  end if;
  select * into invoice from public.invoices where id = current.invoice_id for update;
  remaining := invoice.total_minor
    - public.invoice_allocated_minor(invoice.id)
    - public.invoice_credit_issued_minor(invoice.id);
  if current.amount_minor > remaining then
    raise exception 'credit note exceeds remaining invoice balance';
  end if;
  seq := nextval('public.credit_note_number_seq');
  update public.credit_notes
  set
    status = 'issued',
    issued_at = now(),
    credit_note_number = 'FO-CRN-' || to_char(now() at time zone 'utc', 'YYYY') || '-' || lpad(seq::text, 6, '0')
  where id = current.id
  returning * into current;

  perform public.post_financial_ledger_entry(
    'credit_note_issued',
    current.currency,
    current.amount_minor,
    'out',
    null,
    invoice.id,
    null,
    current.public_id
  );
  perform public.sync_invoice_payment_state(invoice.id);
  return current;
end;
$$;

revoke all on function public.admin_issue_credit_note(uuid) from public, anon;
grant execute on function public.admin_issue_credit_note(uuid) to authenticated;

create or replace function public.admin_void_credit_note(p_credit_note_id uuid)
returns public.credit_notes
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  actor uuid;
  current public.credit_notes;
begin
  actor := public.assert_platform_admin();
  select * into current from public.credit_notes where id = p_credit_note_id for update;
  if current.id is null then
    raise exception 'credit note not found';
  end if;
  if current.status = 'void' then
    return current;
  end if;
  if current.status <> 'draft' then
    raise exception 'only a draft credit note can be voided';
  end if;
  update public.credit_notes
  set status = 'void', voided_at = now()
  where id = current.id
  returning * into current;
  return current;
end;
$$;

revoke all on function public.admin_void_credit_note(uuid) from public, anon;
grant execute on function public.admin_void_credit_note(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- Catalog seed (configuration, not customer transactions)
-- ---------------------------------------------------------------------------
insert into public.commercial_services (
  name, description, category, status, customer_visible, commercial_mode
)
values
  ('Software Development', 'Custom software development for operational systems and product work.', 'software_development', 'active', true, 'quote_required'),
  ('Web Systems', 'Web application and platform development.', 'web_systems', 'active', true, 'quote_required'),
  ('Applications', 'Application design and implementation for customer workflows.', 'applications', 'active', true, 'quote_required'),
  ('Automation', 'Process and systems automation.', 'automation', 'active', true, 'quote_required'),
  ('AI Solutions', 'Applied AI solutions designed around a scoped customer need.', 'ai_solutions', 'active', true, 'quote_required'),
  ('IT Consultancy', 'Independent IT consultancy and technical advisory work.', 'it_consultancy', 'active', true, 'quote_required'),
  ('Technical Support', 'Technical support for systems delivered or maintained by Flash One.', 'technical_support', 'active', true, 'quote_required'),
  ('System Setup / Implementation', 'Implementation and setup of agreed systems.', 'system_setup', 'active', true, 'quote_required'),
  ('Custom Software', 'Bespoke software for a defined commercial scope.', 'custom_software', 'active', true, 'quote_required'),
  ('Technology Services', 'Broader technology services scoped by quote.', 'technology_services', 'active', true, 'quote_required')
on conflict (name) do nothing;

-- ---------------------------------------------------------------------------
-- Privileges and RLS
-- ---------------------------------------------------------------------------
revoke all on table public.commercial_services from public, anon, authenticated;
revoke all on table public.platform_tax_settings from public, anon, authenticated;
revoke all on table public.refunds from public, anon, authenticated;
revoke all on table public.financial_adjustments from public, anon, authenticated;
revoke all on table public.credit_notes from public, anon, authenticated;

grant select on table public.commercial_services to authenticated;
grant select on table public.platform_tax_settings to authenticated;
grant select on table public.refunds to authenticated;
grant select on table public.financial_adjustments to authenticated;
grant select on table public.credit_notes to authenticated;

alter table public.commercial_services enable row level security;
alter table public.commercial_services force row level security;
alter table public.platform_tax_settings enable row level security;
alter table public.platform_tax_settings force row level security;
alter table public.refunds enable row level security;
alter table public.refunds force row level security;
alter table public.financial_adjustments enable row level security;
alter table public.financial_adjustments force row level security;
alter table public.credit_notes enable row level security;
alter table public.credit_notes force row level security;

create policy commercial_services_select
  on public.commercial_services
  for select
  to authenticated
  using (
    public.is_platform_admin()
    or (status = 'active' and customer_visible = true)
  );

create policy platform_tax_settings_select_admin
  on public.platform_tax_settings
  for select
  to authenticated
  using (public.is_platform_admin());

create policy refunds_select_admin
  on public.refunds
  for select
  to authenticated
  using (public.is_platform_admin());

create policy financial_adjustments_select_admin
  on public.financial_adjustments
  for select
  to authenticated
  using (public.is_platform_admin());

create policy credit_notes_select
  on public.credit_notes
  for select
  to authenticated
  using (
    public.is_platform_admin()
    or (status = 'issued' and public.can_access_invoice(invoice_id))
  );
