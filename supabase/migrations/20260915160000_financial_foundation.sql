-- Flash One financial recording foundation
-- Invoices, payments, allocations, receipts, operational ledger, reconciliation.
-- No payment providers. No FX. No VAT registration claims. No statutory accounts.

-- ---------------------------------------------------------------------------
-- Currency helper (V1: GBP/USD/EUR use 100 minor units)
-- ---------------------------------------------------------------------------
create or replace function public.currency_minor_units(p_currency text)
returns integer
language sql
immutable
set search_path = pg_catalog, public
as $$
  select case p_currency
    when 'GBP' then 100
    when 'USD' then 100
    when 'EUR' then 100
    else null
  end;
$$;

comment on function public.currency_minor_units(text) is
  'Minor units per major unit. V1 currencies use 100. Do not assume every future currency has two decimals.';

revoke all on function public.currency_minor_units(text) from public, anon;
grant execute on function public.currency_minor_units(text) to authenticated;

create or replace function public.random_grouped_public_id(p_prefix text)
returns text
language plpgsql
volatile
set search_path = pg_catalog, public, extensions
as $$
declare
  alphabet constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  raw bytea;
  i integer;
  n integer;
  grouped text := '';
begin
  raw := gen_random_bytes(16);
  for i in 0..15 loop
    n := get_byte(raw, i) % 32;
    grouped := grouped || substr(alphabet, n + 1, 1);
    if i in (3, 7, 11) then
      grouped := grouped || '-';
    end if;
  end loop;
  return p_prefix || grouped;
end;
$$;

comment on function public.random_grouped_public_id(text) is
  'Unpredictable grouped public id. Used for receipts. Not a sequential number.';

revoke all on function public.random_grouped_public_id(text) from public, anon, authenticated;

create sequence public.invoice_number_seq as bigint start with 1;
create sequence public.receipt_number_seq as bigint start with 1;

-- ---------------------------------------------------------------------------
-- invoices
-- ---------------------------------------------------------------------------
create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  public_id text not null default public.random_public_id('INV-'),
  invoice_number text,
  individual_user_id uuid references public.individual_accounts (user_id) on delete restrict,
  organization_id uuid references public.organizations (id) on delete restrict,
  project_id uuid references public.projects (id) on delete restrict,
  quote_id uuid references public.quotes (id) on delete restrict,
  contract_id uuid references public.contracts (id) on delete restrict,
  currency text not null,
  status text not null default 'draft',
  subtotal_minor bigint not null default 0,
  tax_minor bigint not null default 0,
  total_minor bigint not null default 0,
  amount_paid_minor bigint not null default 0,
  issue_date date,
  due_date date,
  issued_at timestamptz,
  paid_at timestamptz,
  voided_at timestamptz,
  voided_by_user_id uuid references auth.users (id) on delete restrict,
  void_reason text,
  customer_snapshot jsonb not null default '{}'::jsonb,
  billing_snapshot jsonb not null default '{}'::jsonb,
  notes text,
  created_by_user_id uuid references auth.users (id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint invoices_public_id_format_check
    check (public_id ~ '^INV-[A-F0-9]{12}$'),
  constraint invoices_public_id_key unique (public_id),
  constraint invoices_invoice_number_key unique (invoice_number),
  constraint invoices_currency_check
    check (currency in ('GBP', 'USD', 'EUR')),
  constraint invoices_status_check
    check (status in ('draft', 'issued', 'partially_paid', 'paid', 'void')),
  constraint invoices_owner_xor_check
    check (
      (individual_user_id is not null and organization_id is null)
      or (individual_user_id is null and organization_id is not null)
    ),
  constraint invoices_amounts_check
    check (
      subtotal_minor >= 0
      and tax_minor = 0
      and total_minor = subtotal_minor + tax_minor
      and amount_paid_minor >= 0
      and amount_paid_minor <= total_minor
    ),
  constraint invoices_number_when_issued_check
    check (
      (status = 'draft' and invoice_number is null and issued_at is null)
      or (status <> 'draft' and invoice_number is not null)
    ),
  constraint invoices_void_state_check
    check (
      (status <> 'void' and voided_at is null)
      or (status = 'void' and voided_at is not null)
    ),
  constraint invoices_notes_length_check
    check (notes is null or char_length(notes) between 1 and 4000),
  constraint invoices_void_reason_length_check
    check (void_reason is null or char_length(void_reason) between 1 and 400)
);

comment on table public.invoices is
  'Commercial invoice. Not a quote, payment, receipt, or ledger entry. Amounts are integer minor units. Tax is 0 until VAT is configured. Auth is not required forever for a future historical customer; V1 still uses individual_accounts or organizations.';

comment on column public.invoices.public_id is
  'Unpredictable lookup id. Not the legal invoice number. Organization invitations also used INV- historically; they are a different table.';

comment on column public.invoices.invoice_number is
  'Assigned atomically at issue from invoice_number_seq as FO-INV-YYYY-000001. Year is issue year; the sequence is global and never reused.';

comment on column public.invoices.tax_minor is
  'Always 0 in Phase 4. Flash One is not claiming VAT registration.';

create trigger invoices_set_updated_at
  before update on public.invoices
  for each row
  execute function public.set_updated_at();

create index invoices_individual_user_id_idx on public.invoices (individual_user_id);
create index invoices_organization_id_idx on public.invoices (organization_id);
create index invoices_status_idx on public.invoices (status);
create index invoices_quote_id_idx on public.invoices (quote_id);

create table public.invoice_line_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices (id) on delete cascade,
  position integer not null,
  description text not null,
  quantity integer not null,
  unit_amount_minor bigint not null,
  line_total_minor bigint not null,
  constraint invoice_line_items_position_check
    check (position >= 1),
  constraint invoice_line_items_description_length_check
    check (char_length(description) between 1 and 200),
  constraint invoice_line_items_quantity_check
    check (quantity >= 1 and quantity <= 9999),
  constraint invoice_line_items_unit_amount_check
    check (unit_amount_minor >= 0 and unit_amount_minor <= 9999999900),
  constraint invoice_line_items_total_check
    check (line_total_minor = quantity * unit_amount_minor),
  constraint invoice_line_items_invoice_position_key unique (invoice_id, position)
);

comment on table public.invoice_line_items is
  'Invoice lines. Totals are quantity * unit_amount_minor. Issued invoice lines are immutable.';

-- ---------------------------------------------------------------------------
-- payments / allocations / receipts
-- ---------------------------------------------------------------------------
create table public.payments (
  id uuid primary key default gen_random_uuid(),
  public_id text not null default public.random_public_id('PAY-'),
  individual_user_id uuid references public.individual_accounts (user_id) on delete restrict,
  organization_id uuid references public.organizations (id) on delete restrict,
  currency text not null,
  amount_minor bigint not null,
  status text not null,
  source_type text not null,
  provider text,
  provider_reference text,
  received_at timestamptz,
  created_by_user_id uuid references auth.users (id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint payments_public_id_format_check
    check (public_id ~ '^PAY-[A-F0-9]{12}$'),
  constraint payments_public_id_key unique (public_id),
  constraint payments_currency_check
    check (currency in ('GBP', 'USD', 'EUR')),
  constraint payments_amount_check
    check (amount_minor > 0),
  constraint payments_status_check
    check (status in (
      'pending',
      'succeeded',
      'failed',
      'cancelled',
      'refunded',
      'partially_refunded'
    )),
  constraint payments_source_type_check
    check (source_type in ('manual')),
  constraint payments_provider_null_check
    check (provider is null and provider_reference is null),
  constraint payments_owner_xor_check
    check (
      (individual_user_id is not null and organization_id is null)
      or (individual_user_id is null and organization_id is not null)
    )
);

comment on table public.payments is
  'Provider-independent payment record. Phase 4 only supports source_type=manual development records. Not an invoice or receipt. Provider integrations are Phase 5.';

create trigger payments_set_updated_at
  before update on public.payments
  for each row
  execute function public.set_updated_at();

create index payments_individual_user_id_idx on public.payments (individual_user_id);
create index payments_organization_id_idx on public.payments (organization_id);

create table public.payment_allocations (
  id uuid primary key default gen_random_uuid(),
  payment_id uuid not null references public.payments (id) on delete restrict,
  invoice_id uuid not null references public.invoices (id) on delete restrict,
  amount_minor bigint not null,
  allocated_at timestamptz not null default now(),
  allocated_by_user_id uuid references auth.users (id) on delete restrict,
  constraint payment_allocations_amount_check
    check (amount_minor > 0),
  constraint payment_allocations_payment_invoice_key unique (payment_id, invoice_id)
);

comment on table public.payment_allocations is
  'Many-to-many allocation of a payment onto invoices. Unique per payment/invoice pair. Retry with the same amount is idempotent.';

create table public.receipts (
  id uuid primary key default gen_random_uuid(),
  public_id text not null,
  receipt_number text not null,
  payment_id uuid not null references public.payments (id) on delete restrict,
  individual_user_id uuid references public.individual_accounts (user_id) on delete restrict,
  organization_id uuid references public.organizations (id) on delete restrict,
  currency text not null,
  amount_minor bigint not null,
  issued_at timestamptz not null default now(),
  snapshot jsonb not null,
  created_at timestamptz not null default now(),
  constraint receipts_public_id_format_check
    check (public_id ~ '^RCP-[A-HJ-NP-Z2-9]{4}(-[A-HJ-NP-Z2-9]{4}){3}$'),
  constraint receipts_public_id_key unique (public_id),
  constraint receipts_receipt_number_key unique (receipt_number),
  constraint receipts_payment_id_key unique (payment_id),
  constraint receipts_currency_check
    check (currency in ('GBP', 'USD', 'EUR')),
  constraint receipts_amount_check
    check (amount_minor > 0),
  constraint receipts_owner_xor_check
    check (
      (individual_user_id is not null and organization_id is null)
      or (individual_user_id is null and organization_id is not null)
    )
);

comment on table public.receipts is
  'Evidence that Flash One recorded money received. Not an invoice. One receipt per payment. public_id is unpredictable; receipt_number is sequential.';

create index receipts_individual_user_id_idx on public.receipts (individual_user_id);
create index receipts_organization_id_idx on public.receipts (organization_id);

-- ---------------------------------------------------------------------------
-- ledger + reconciliation
-- ---------------------------------------------------------------------------
create table public.financial_ledger_entries (
  id uuid primary key default gen_random_uuid(),
  public_id text not null default public.random_public_id('LED-'),
  event_type text not null,
  currency text not null,
  amount_minor bigint not null,
  direction text not null,
  payment_id uuid references public.payments (id) on delete restrict,
  invoice_id uuid references public.invoices (id) on delete restrict,
  receipt_id uuid references public.receipts (id) on delete restrict,
  source_reference text,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint financial_ledger_entries_public_id_format_check
    check (public_id ~ '^LED-[A-F0-9]{12}$'),
  constraint financial_ledger_entries_public_id_key unique (public_id),
  constraint financial_ledger_entries_currency_check
    check (currency in ('GBP', 'USD', 'EUR')),
  constraint financial_ledger_entries_amount_check
    check (amount_minor > 0),
  constraint financial_ledger_entries_direction_check
    check (direction in ('in', 'allocation')),
  constraint financial_ledger_entries_event_type_check
    check (event_type in (
      'manual_payment_recorded',
      'payment_allocated'
    ))
);

comment on table public.financial_ledger_entries is
  'Append-only operational financial ledger. Not audit_events and not project_activity. Not statutory double-entry accounts.';

create table public.reconciliation_items (
  id uuid primary key default gen_random_uuid(),
  public_id text not null default public.random_public_id('RCL-'),
  source_type text not null,
  external_reference text,
  currency text not null,
  amount_minor bigint not null,
  occurred_at timestamptz not null default now(),
  status text not null default 'unmatched',
  matched_payment_id uuid references public.payments (id) on delete restrict,
  notes text,
  created_by_user_id uuid references auth.users (id) on delete restrict,
  created_at timestamptz not null default now(),
  reconciled_at timestamptz,
  reconciled_by_user_id uuid references auth.users (id) on delete restrict,
  constraint reconciliation_items_public_id_format_check
    check (public_id ~ '^RCL-[A-F0-9]{12}$'),
  constraint reconciliation_items_public_id_key unique (public_id),
  constraint reconciliation_items_source_type_check
    check (source_type in ('manual_dev')),
  constraint reconciliation_items_currency_check
    check (currency in ('GBP', 'USD', 'EUR')),
  constraint reconciliation_items_amount_check
    check (amount_minor > 0),
  constraint reconciliation_items_status_check
    check (status in ('unmatched', 'suggested', 'matched', 'reconciled', 'ignored')),
  constraint reconciliation_items_notes_length_check
    check (notes is null or char_length(notes) between 1 and 400)
);

comment on table public.reconciliation_items is
  'Foundation for matching future provider/bank items to internal payments. Matching is not a sale and does not create a payment. Phase 4 only supports manual_dev test items.';

create index reconciliation_items_status_idx on public.reconciliation_items (status);

-- ---------------------------------------------------------------------------
-- Immutability triggers
-- ---------------------------------------------------------------------------
create or replace function public.financial_prevent_mutation()
returns trigger
language plpgsql
security invoker
set search_path = pg_catalog, public
as $$
begin
  raise exception 'financial records of this type are immutable';
end;
$$;

revoke all on function public.financial_prevent_mutation() from public, anon, authenticated;

create trigger financial_ledger_entries_prevent_update
  before update on public.financial_ledger_entries
  for each row
  execute function public.financial_prevent_mutation();

create trigger financial_ledger_entries_prevent_delete
  before delete on public.financial_ledger_entries
  for each row
  execute function public.financial_prevent_mutation();

create trigger receipts_prevent_update
  before update on public.receipts
  for each row
  execute function public.financial_prevent_mutation();

create trigger receipts_prevent_delete
  before delete on public.receipts
  for each row
  execute function public.financial_prevent_mutation();

create trigger payment_allocations_prevent_update
  before update on public.payment_allocations
  for each row
  execute function public.financial_prevent_mutation();

create trigger payment_allocations_prevent_delete
  before delete on public.payment_allocations
  for each row
  execute function public.financial_prevent_mutation();

create or replace function public.invoices_protect_issued()
returns trigger
language plpgsql
security invoker
set search_path = pg_catalog, public
as $$
begin
  if old.status = 'draft' then
    return new;
  end if;
  if new.invoice_number is distinct from old.invoice_number
     or new.individual_user_id is distinct from old.individual_user_id
     or new.organization_id is distinct from old.organization_id
     or new.currency is distinct from old.currency
     or new.subtotal_minor is distinct from old.subtotal_minor
     or new.tax_minor is distinct from old.tax_minor
     or new.total_minor is distinct from old.total_minor
     or new.quote_id is distinct from old.quote_id
     or new.project_id is distinct from old.project_id
     or new.contract_id is distinct from old.contract_id
     or new.customer_snapshot is distinct from old.customer_snapshot
     or new.billing_snapshot is distinct from old.billing_snapshot
     or new.issue_date is distinct from old.issue_date
     or new.due_date is distinct from old.due_date
     or new.issued_at is distinct from old.issued_at then
    raise exception 'issued invoice commercial fields are immutable';
  end if;
  if old.status = 'void' and new.status is distinct from 'void' then
    raise exception 'void invoices cannot change status';
  end if;
  return new;
end;
$$;

revoke all on function public.invoices_protect_issued() from public, anon, authenticated;

create trigger invoices_protect_issued
  before update on public.invoices
  for each row
  execute function public.invoices_protect_issued();

create or replace function public.invoice_line_items_protect_issued()
returns trigger
language plpgsql
security invoker
set search_path = pg_catalog, public
as $$
declare
  invoice_status text;
begin
  select status into invoice_status
  from public.invoices
  where id = coalesce(new.invoice_id, old.invoice_id);
  if invoice_status is distinct from 'draft' then
    raise exception 'issued invoice lines are immutable';
  end if;
  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

revoke all on function public.invoice_line_items_protect_issued() from public, anon, authenticated;

create trigger invoice_line_items_protect_issued
  before insert or update or delete on public.invoice_line_items
  for each row
  execute function public.invoice_line_items_protect_issued();

-- ---------------------------------------------------------------------------
-- Access helpers
-- ---------------------------------------------------------------------------
create or replace function public.can_access_invoice(p_invoice_id uuid)
returns boolean
language plpgsql
stable
security definer
set search_path = pg_catalog, public
as $$
declare
  current public.invoices;
  actor uuid;
begin
  actor := (select auth.uid());
  if actor is null then
    return false;
  end if;
  if public.is_platform_admin() then
    return true;
  end if;
  select * into current from public.invoices where id = p_invoice_id;
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

comment on function public.can_access_invoice(uuid) is
  'Customer/org-member access to issued invoices. Developer assignment is not financial authorization. Drafts are admin-only.';

revoke all on function public.can_access_invoice(uuid) from public, anon;
grant execute on function public.can_access_invoice(uuid) to authenticated;

create or replace function public.can_access_payment(p_payment_id uuid)
returns boolean
language plpgsql
stable
security definer
set search_path = pg_catalog, public
as $$
declare
  current public.payments;
  actor uuid;
begin
  actor := (select auth.uid());
  if actor is null then
    return false;
  end if;
  if public.is_platform_admin() then
    return true;
  end if;
  select * into current from public.payments where id = p_payment_id;
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

revoke all on function public.can_access_payment(uuid) from public, anon;
grant execute on function public.can_access_payment(uuid) to authenticated;

create or replace function public.invoice_allocated_minor(p_invoice_id uuid)
returns bigint
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select coalesce(sum(amount_minor), 0)
  from public.payment_allocations
  where invoice_id = p_invoice_id;
$$;

revoke all on function public.invoice_allocated_minor(uuid) from public, anon;
grant execute on function public.invoice_allocated_minor(uuid) to authenticated;

create or replace function public.payment_allocated_minor(p_payment_id uuid)
returns bigint
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select coalesce(sum(amount_minor), 0)
  from public.payment_allocations
  where payment_id = p_payment_id;
$$;

revoke all on function public.payment_allocated_minor(uuid) from public, anon;
grant execute on function public.payment_allocated_minor(uuid) to authenticated;

create or replace function public.sync_invoice_payment_state(p_invoice_id uuid)
returns public.invoices
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  current public.invoices;
  allocated bigint;
begin
  select * into current from public.invoices where id = p_invoice_id for update;
  if current.id is null then
    raise exception 'invoice not found';
  end if;
  if current.status in ('draft', 'void') then
    return current;
  end if;
  allocated := public.invoice_allocated_minor(current.id);
  if allocated = 0 then
    update public.invoices
    set amount_paid_minor = 0, status = 'issued', paid_at = null
    where id = current.id
    returning * into current;
  elsif allocated < current.total_minor then
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

create or replace function public.post_financial_ledger_entry(
  p_event_type text,
  p_currency text,
  p_amount_minor bigint,
  p_direction text,
  p_payment_id uuid,
  p_invoice_id uuid,
  p_receipt_id uuid,
  p_source_reference text
)
returns public.financial_ledger_entries
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  created public.financial_ledger_entries;
begin
  insert into public.financial_ledger_entries (
    event_type,
    currency,
    amount_minor,
    direction,
    payment_id,
    invoice_id,
    receipt_id,
    source_reference
  )
  values (
    p_event_type,
    p_currency,
    p_amount_minor,
    p_direction,
    p_payment_id,
    p_invoice_id,
    p_receipt_id,
    p_source_reference
  )
  returning * into created;
  return created;
end;
$$;

revoke all on function public.post_financial_ledger_entry(text, text, bigint, text, uuid, uuid, uuid, text)
  from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- Invoice operations
-- ---------------------------------------------------------------------------
create or replace function public.replace_invoice_lines(p_invoice_id uuid, p_lines jsonb)
returns void
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  line jsonb;
  pos integer := 0;
  qty integer;
  unit_minor bigint;
  subtotal bigint := 0;
  line_total bigint;
begin
  if coalesce(jsonb_array_length(p_lines), 0) < 1 then
    raise exception 'invoice requires line items';
  end if;
  delete from public.invoice_line_items where invoice_id = p_invoice_id;
  for line in select value from jsonb_array_elements(p_lines)
  loop
    pos := pos + 1;
    qty := (line->>'quantity')::integer;
    unit_minor := (line->>'unit_amount_minor')::bigint;
    if qty is null or qty < 1 or qty > 9999 then
      raise exception 'invalid quantity';
    end if;
    if unit_minor is null or unit_minor < 0 or unit_minor > 9999999900 then
      raise exception 'invalid unit amount';
    end if;
    line_total := qty * unit_minor;
    subtotal := subtotal + line_total;
    insert into public.invoice_line_items (
      invoice_id, position, description, quantity, unit_amount_minor, line_total_minor
    ) values (
      p_invoice_id,
      pos,
      left(trim(coalesce(line->>'description', '')), 200),
      qty,
      unit_minor,
      line_total
    );
  end loop;
  update public.invoices
  set
    subtotal_minor = subtotal,
    tax_minor = 0,
    total_minor = subtotal,
    amount_paid_minor = 0
  where id = p_invoice_id;
end;
$$;

revoke all on function public.replace_invoice_lines(uuid, jsonb) from public, anon, authenticated;

create or replace function public.admin_create_invoice(
  p_individual_public_id text,
  p_organization_public_id text,
  p_quote_public_id text,
  p_project_public_id text,
  p_contract_public_id text,
  p_currency text,
  p_due_date date,
  p_notes text,
  p_lines jsonb
)
returns public.invoices
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  actor uuid;
  created public.invoices;
  individual_id uuid;
  organization_id uuid;
  quote_row public.quotes;
  request_row public.work_requests;
  project_row public.projects;
  contract_row public.contracts;
  lines jsonb := p_lines;
  currency text;
begin
  actor := public.assert_platform_admin();

  if p_quote_public_id is not null and btrim(p_quote_public_id) <> '' then
    select * into quote_row from public.quotes where public_id = p_quote_public_id;
    if quote_row.id is null or quote_row.status <> 'accepted' then
      raise exception 'accepted quote not found';
    end if;
    select * into request_row from public.work_requests where id = quote_row.work_request_id;
    individual_id := request_row.individual_user_id;
    organization_id := request_row.organization_id;
    currency := quote_row.currency;
    if lines is null or jsonb_array_length(lines) = 0 then
      select coalesce(jsonb_agg(jsonb_build_object(
        'description', description,
        'quantity', quantity,
        'unit_amount_minor', unit_amount_minor
      ) order by position), '[]'::jsonb)
      into lines
      from public.quote_line_items
      where quote_id = quote_row.id;
    end if;
    select * into project_row from public.projects where accepted_quote_id = quote_row.id;
  else
    currency := p_currency;
    if public.currency_minor_units(currency) is null then
      raise exception 'unsupported currency';
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
  end if;

  if p_project_public_id is not null and btrim(p_project_public_id) <> '' then
    select * into project_row from public.projects where public_id = p_project_public_id;
    if project_row.id is null then
      raise exception 'project not found';
    end if;
  end if;
  if p_contract_public_id is not null and btrim(p_contract_public_id) <> '' then
    select * into contract_row from public.contracts where public_id = p_contract_public_id;
    if contract_row.id is null then
      raise exception 'contract not found';
    end if;
  end if;

  if individual_id is not null and organization_id is not null then
    raise exception 'invoice cannot have both individual and organization owners';
  end if;
  if individual_id is null and organization_id is null then
    raise exception 'invoice requires a customer or business';
  end if;

  insert into public.invoices (
    individual_user_id,
    organization_id,
    project_id,
    quote_id,
    contract_id,
    currency,
    due_date,
    notes,
    created_by_user_id,
    billing_snapshot
  )
  values (
    individual_id,
    organization_id,
    project_row.id,
    quote_row.id,
    contract_row.id,
    currency,
    p_due_date,
    nullif(btrim(p_notes), ''),
    actor,
    jsonb_build_object('issuer', 'Flash One', 'domain', 'flashone.uk')
  )
  returning * into created;

  perform public.replace_invoice_lines(created.id, lines);
  select * into created from public.invoices where id = created.id;
  return created;
end;
$$;

revoke all on function public.admin_create_invoice(text, text, text, text, text, text, date, text, jsonb)
  from public, anon;
grant execute on function public.admin_create_invoice(text, text, text, text, text, text, date, text, jsonb)
  to authenticated;

create or replace function public.admin_set_invoice_lines(p_invoice_id uuid, p_lines jsonb)
returns public.invoices
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  current public.invoices;
begin
  perform public.assert_platform_admin();
  select * into current from public.invoices where id = p_invoice_id for update;
  if current.id is null then
    raise exception 'invoice not found';
  end if;
  if current.status <> 'draft' then
    raise exception 'issued invoice lines are immutable';
  end if;
  perform public.replace_invoice_lines(current.id, p_lines);
  select * into current from public.invoices where id = current.id;
  return current;
end;
$$;

revoke all on function public.admin_set_invoice_lines(uuid, jsonb) from public, anon;
grant execute on function public.admin_set_invoice_lines(uuid, jsonb) to authenticated;

create or replace function public.admin_issue_invoice(p_invoice_id uuid)
returns public.invoices
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  actor uuid;
  current public.invoices;
  display_name text;
  customer_public text;
  line_snapshot jsonb;
  seq bigint;
begin
  actor := public.assert_platform_admin();
  select * into current from public.invoices where id = p_invoice_id for update;
  if current.id is null then
    raise exception 'invoice not found';
  end if;
  if current.status <> 'draft' then
    return current;
  end if;
  if current.total_minor <= 0 then
    raise exception 'invoice total must be greater than zero';
  end if;
  if not exists (select 1 from public.invoice_line_items where invoice_id = current.id) then
    raise exception 'invoice requires line items';
  end if;

  if current.individual_user_id is not null then
    select individual_accounts.public_id, profiles.full_name
    into customer_public, display_name
    from public.individual_accounts
    left join public.profiles on profiles.user_id = individual_accounts.user_id
    where individual_accounts.user_id = current.individual_user_id;
  else
    select public_id, name into customer_public, display_name
    from public.organizations
    where id = current.organization_id;
  end if;

  select coalesce(jsonb_agg(jsonb_build_object(
    'position', position,
    'description', description,
    'quantity', quantity,
    'unit_amount_minor', unit_amount_minor,
    'line_total_minor', line_total_minor
  ) order by position), '[]'::jsonb)
  into line_snapshot
  from public.invoice_line_items
  where invoice_id = current.id;

  seq := nextval('public.invoice_number_seq');
  update public.invoices
  set
    status = 'issued',
    invoice_number = 'FO-INV-' || to_char(now() at time zone 'utc', 'YYYY') || '-' || lpad(seq::text, 6, '0'),
    issue_date = (now() at time zone 'utc')::date,
    issued_at = now(),
    customer_snapshot = jsonb_build_object(
      'kind', case when current.individual_user_id is not null then 'individual' else 'organization' end,
      'public_id', customer_public,
      'display_name', coalesce(display_name, 'Customer'),
      'currency', current.currency,
      'subtotal_minor', current.subtotal_minor,
      'tax_minor', 0,
      'total_minor', current.total_minor,
      'issue_date', (now() at time zone 'utc')::date,
      'due_date', current.due_date,
      'lines', line_snapshot
    )
  where id = current.id
  returning * into current;
  return current;
end;
$$;

revoke all on function public.admin_issue_invoice(uuid) from public, anon;
grant execute on function public.admin_issue_invoice(uuid) to authenticated;

create or replace function public.admin_void_invoice(p_invoice_id uuid, p_reason text)
returns public.invoices
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  actor uuid;
  current public.invoices;
begin
  actor := public.assert_platform_admin();
  select * into current from public.invoices where id = p_invoice_id for update;
  if current.id is null then
    raise exception 'invoice not found';
  end if;
  if current.status = 'void' then
    return current;
  end if;
  if current.status = 'draft' then
    raise exception 'draft invoices cannot be voided';
  end if;
  if public.invoice_allocated_minor(current.id) <> 0 then
    raise exception 'cannot void an invoice with allocations';
  end if;
  update public.invoices
  set
    status = 'void',
    voided_at = now(),
    voided_by_user_id = actor,
    void_reason = nullif(btrim(p_reason), '')
  where id = current.id
  returning * into current;
  return current;
end;
$$;

revoke all on function public.admin_void_invoice(uuid, text) from public, anon;
grant execute on function public.admin_void_invoice(uuid, text) to authenticated;

-- ---------------------------------------------------------------------------
-- Payments, allocations, receipts
-- ---------------------------------------------------------------------------
create or replace function public.admin_issue_receipt(p_payment_id uuid)
returns public.receipts
language plpgsql
security definer
set search_path = pg_catalog, public, extensions
as $$
declare
  actor uuid;
  payment public.payments;
  current public.receipts;
  seq bigint;
begin
  actor := public.assert_platform_admin();
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
  seq := nextval('public.receipt_number_seq');
  insert into public.receipts (
    public_id,
    receipt_number,
    payment_id,
    individual_user_id,
    organization_id,
    currency,
    amount_minor,
    snapshot
  )
  values (
    public.random_grouped_public_id('RCP-'),
    'FO-RCP-' || to_char(now() at time zone 'utc', 'YYYY') || '-' || lpad(seq::text, 6, '0'),
    payment.id,
    payment.individual_user_id,
    payment.organization_id,
    payment.currency,
    payment.amount_minor,
    jsonb_build_object(
      'source_type', payment.source_type,
      'currency', payment.currency,
      'amount_minor', payment.amount_minor,
      'received_at', payment.received_at,
      'label', 'Manual development payment record'
    )
  )
  returning * into current;
  return current;
end;
$$;

revoke all on function public.admin_issue_receipt(uuid) from public, anon;
grant execute on function public.admin_issue_receipt(uuid) to authenticated;

create or replace function public.admin_record_manual_payment(
  p_individual_public_id text,
  p_organization_public_id text,
  p_currency text,
  p_amount_minor bigint
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

  insert into public.payments (
    individual_user_id,
    organization_id,
    currency,
    amount_minor,
    status,
    source_type,
    received_at,
    created_by_user_id
  )
  values (
    individual_id,
    organization_id,
    p_currency,
    p_amount_minor,
    'succeeded',
    'manual',
    now(),
    actor
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

revoke all on function public.admin_record_manual_payment(text, text, text, bigint) from public, anon;
grant execute on function public.admin_record_manual_payment(text, text, text, bigint) to authenticated;

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
  invoice_due := invoice.total_minor - public.invoice_allocated_minor(invoice.id);
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

create or replace function public.admin_create_reconciliation_item(
  p_currency text,
  p_amount_minor bigint,
  p_notes text
)
returns public.reconciliation_items
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  actor uuid;
  created public.reconciliation_items;
begin
  actor := public.assert_platform_admin();
  if public.currency_minor_units(p_currency) is null then
    raise exception 'unsupported currency';
  end if;
  if p_amount_minor is null or p_amount_minor <= 0 then
    raise exception 'invalid amount';
  end if;
  insert into public.reconciliation_items (
    source_type,
    currency,
    amount_minor,
    status,
    notes,
    created_by_user_id
  )
  values (
    'manual_dev',
    p_currency,
    p_amount_minor,
    'unmatched',
    coalesce(nullif(btrim(p_notes), ''), 'Manual development reconciliation item. Not bank evidence.'),
    actor
  )
  returning * into created;
  return created;
end;
$$;

revoke all on function public.admin_create_reconciliation_item(text, bigint, text) from public, anon;
grant execute on function public.admin_create_reconciliation_item(text, bigint, text) to authenticated;

create or replace function public.admin_match_reconciliation_item(
  p_item_id uuid,
  p_payment_id uuid
)
returns public.reconciliation_items
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  actor uuid;
  item public.reconciliation_items;
  payment public.payments;
begin
  actor := public.assert_platform_admin();
  select * into item from public.reconciliation_items where id = p_item_id for update;
  select * into payment from public.payments where id = p_payment_id for update;
  if item.id is null then
    raise exception 'reconciliation item not found';
  end if;
  if payment.id is null then
    raise exception 'payment not found';
  end if;
  if item.status in ('reconciled', 'ignored') then
    return item;
  end if;
  if item.status = 'matched' and item.matched_payment_id = payment.id then
    return item;
  end if;
  if item.currency is distinct from payment.currency then
    raise exception 'cross-currency match is not allowed';
  end if;
  if item.amount_minor is distinct from payment.amount_minor then
    raise exception 'amount does not match payment';
  end if;
  if payment.status <> 'succeeded' then
    raise exception 'can only match a succeeded payment';
  end if;
  update public.reconciliation_items
  set status = 'matched', matched_payment_id = payment.id
  where id = item.id
  returning * into item;
  return item;
end;
$$;

revoke all on function public.admin_match_reconciliation_item(uuid, uuid) from public, anon;
grant execute on function public.admin_match_reconciliation_item(uuid, uuid) to authenticated;

create or replace function public.admin_confirm_reconciliation_item(p_item_id uuid)
returns public.reconciliation_items
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  actor uuid;
  item public.reconciliation_items;
begin
  actor := public.assert_platform_admin();
  select * into item from public.reconciliation_items where id = p_item_id for update;
  if item.id is null then
    raise exception 'reconciliation item not found';
  end if;
  if item.status = 'reconciled' then
    return item;
  end if;
  if item.status <> 'matched' or item.matched_payment_id is null then
    raise exception 'reconciliation item is not matched';
  end if;
  update public.reconciliation_items
  set
    status = 'reconciled',
    reconciled_at = now(),
    reconciled_by_user_id = actor
  where id = item.id
  returning * into item;
  return item;
end;
$$;

revoke all on function public.admin_confirm_reconciliation_item(uuid) from public, anon;
grant execute on function public.admin_confirm_reconciliation_item(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- Privileges and RLS
-- ---------------------------------------------------------------------------
revoke all on table public.invoices from public, anon, authenticated;
revoke all on table public.invoice_line_items from public, anon, authenticated;
revoke all on table public.payments from public, anon, authenticated;
revoke all on table public.payment_allocations from public, anon, authenticated;
revoke all on table public.receipts from public, anon, authenticated;
revoke all on table public.financial_ledger_entries from public, anon, authenticated;
revoke all on table public.reconciliation_items from public, anon, authenticated;

grant select on table public.invoices to authenticated;
grant select on table public.invoice_line_items to authenticated;
grant select on table public.payments to authenticated;
grant select on table public.payment_allocations to authenticated;
grant select on table public.receipts to authenticated;
grant select on table public.financial_ledger_entries to authenticated;
grant select on table public.reconciliation_items to authenticated;

alter table public.invoices enable row level security;
alter table public.invoices force row level security;
alter table public.invoice_line_items enable row level security;
alter table public.invoice_line_items force row level security;
alter table public.payments enable row level security;
alter table public.payments force row level security;
alter table public.payment_allocations enable row level security;
alter table public.payment_allocations force row level security;
alter table public.receipts enable row level security;
alter table public.receipts force row level security;
alter table public.financial_ledger_entries enable row level security;
alter table public.financial_ledger_entries force row level security;
alter table public.reconciliation_items enable row level security;
alter table public.reconciliation_items force row level security;

create policy invoices_select_related
  on public.invoices
  for select
  to authenticated
  using (public.can_access_invoice(id) or public.is_platform_admin());

create policy invoice_line_items_select_related
  on public.invoice_line_items
  for select
  to authenticated
  using (public.can_access_invoice(invoice_id) or public.is_platform_admin());

create policy payments_select_related
  on public.payments
  for select
  to authenticated
  using (public.can_access_payment(id));

create policy payment_allocations_select_related
  on public.payment_allocations
  for select
  to authenticated
  using (
    public.is_platform_admin()
    or public.can_access_invoice(invoice_id)
    or public.can_access_payment(payment_id)
  );

create policy receipts_select_related
  on public.receipts
  for select
  to authenticated
  using (public.can_access_payment(payment_id));

create policy financial_ledger_entries_select_admin
  on public.financial_ledger_entries
  for select
  to authenticated
  using (public.is_platform_admin());

create policy reconciliation_items_select_admin
  on public.reconciliation_items
  for select
  to authenticated
  using (public.is_platform_admin());
