-- Flash One work request, quote, project, and contract/SOW foundation
-- No payments. No invoices. No electronic-signature product.

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------
create or replace function public.random_public_id(p_prefix text)
returns text
language sql
volatile
set search_path = pg_catalog, public
as $$
  select p_prefix || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 12));
$$;

revoke all on function public.random_public_id(text) from public, anon, authenticated;

create or replace function public.is_platform_admin()
returns boolean
language sql
stable
security invoker
set search_path = pg_catalog, public
as $$
  select exists (
    select 1
    from public.user_platform_roles
    where user_id = (select auth.uid())
      and role = 'admin'
  );
$$;

comment on function public.is_platform_admin() is
  'True when the current auth.uid() has user_platform_roles.admin. Not a domain relationship.';

revoke all on function public.is_platform_admin() from public, anon;
grant execute on function public.is_platform_admin() to authenticated;

create or replace function public.assert_platform_admin()
returns uuid
language plpgsql
stable
security invoker
set search_path = pg_catalog, public
as $$
declare
  actor uuid;
begin
  actor := (select auth.uid());
  if actor is null then
    raise exception 'not authenticated';
  end if;
  if not public.is_platform_admin() then
    raise exception 'not authorized';
  end if;
  return actor;
end;
$$;

revoke all on function public.assert_platform_admin() from public, anon;
grant execute on function public.assert_platform_admin() to authenticated;

-- ---------------------------------------------------------------------------
-- work_requests
-- Ownership is XOR: individual or organization, never both.
-- Both null is reserved for a future guest enquiry. V1 inserts require one.
-- ---------------------------------------------------------------------------
create table public.work_requests (
  id uuid primary key default gen_random_uuid(),
  public_id text not null default public.random_public_id('WRQ-'),
  created_by_user_id uuid references auth.users (id) on delete restrict,
  individual_user_id uuid references public.individual_accounts (user_id) on delete restrict,
  organization_id uuid references public.organizations (id) on delete restrict,
  title text not null,
  summary text not null,
  details text,
  service_category text not null,
  budget_indication text,
  desired_timeline text,
  status text not null default 'submitted',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint work_requests_title_length_check
    check (char_length(title) between 1 and 160),
  constraint work_requests_summary_length_check
    check (char_length(summary) between 1 and 2000),
  constraint work_requests_details_length_check
    check (details is null or char_length(details) between 1 and 8000),
  constraint work_requests_budget_length_check
    check (budget_indication is null or char_length(budget_indication) between 1 and 120),
  constraint work_requests_timeline_length_check
    check (desired_timeline is null or char_length(desired_timeline) between 1 and 120),
  constraint work_requests_service_category_check
    check (service_category in (
      'software_development',
      'automation_ai',
      'it_consultancy',
      'technology_services',
      'other'
    )),
  constraint work_requests_status_check
    check (status in (
      'submitted',
      'under_review',
      'needs_information',
      'qualified',
      'declined',
      'converted'
    )),
  constraint work_requests_public_id_format_check
    check (public_id ~ '^WRQ-[A-F0-9]{12}$'),
  constraint work_requests_public_id_key unique (public_id),
  constraint work_requests_owner_not_both_check
    check (not (individual_user_id is not null and organization_id is not null))
);

comment on table public.work_requests is
  'Customer work request. Not a project, quote, contract, payment, or invoice. Guest ownership (both relationship ids null) is reserved for a later public enquiry module.';

comment on column public.work_requests.created_by_user_id is
  'Authenticated submitter for V1. Nullable so a future guest enquiry can exist without auth identity.';

comment on column public.work_requests.public_id is
  'Public reference WRQ- plus 12 hex. Separate from InternalId.';

create trigger work_requests_set_updated_at
  before update on public.work_requests
  for each row
  execute function public.set_updated_at();

create index work_requests_created_by_user_id_idx
  on public.work_requests (created_by_user_id);

create index work_requests_organization_id_idx
  on public.work_requests (organization_id);

create index work_requests_status_idx
  on public.work_requests (status);

-- ---------------------------------------------------------------------------
-- quotes + line items
-- Money is integer minor units (pence/cents). Tax is stored as 0 until VAT
-- configuration exists. No FX.
-- ---------------------------------------------------------------------------
create table public.quotes (
  id uuid primary key default gen_random_uuid(),
  public_id text not null default public.random_public_id('QTE-'),
  work_request_id uuid not null references public.work_requests (id) on delete restrict,
  version integer not null,
  currency text not null,
  subtotal_minor bigint not null,
  tax_minor bigint not null default 0,
  total_minor bigint not null,
  status text not null default 'draft',
  valid_until date,
  customer_notes text,
  sent_at timestamptz,
  accepted_at timestamptz,
  accepted_by_user_id uuid references auth.users (id) on delete restrict,
  rejected_at timestamptz,
  rejected_by_user_id uuid references auth.users (id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint quotes_version_positive_check
    check (version >= 1),
  constraint quotes_currency_check
    check (currency in ('GBP', 'USD', 'EUR')),
  constraint quotes_subtotal_minor_check
    check (subtotal_minor >= 0),
  constraint quotes_tax_minor_check
    check (tax_minor = 0),
  constraint quotes_total_minor_check
    check (total_minor = subtotal_minor + tax_minor and total_minor >= 0),
  constraint quotes_status_check
    check (status in ('draft', 'sent', 'accepted', 'rejected', 'expired', 'superseded')),
  constraint quotes_customer_notes_length_check
    check (customer_notes is null or char_length(customer_notes) between 1 and 4000),
  constraint quotes_public_id_format_check
    check (public_id ~ '^QTE-[A-F0-9]{12}$'),
  constraint quotes_public_id_key unique (public_id),
  constraint quotes_request_version_key unique (work_request_id, version)
);

comment on table public.quotes is
  'Commercial quote for a work request. Not a payment, invoice, or project. Amounts are integer minor units.';

comment on column public.quotes.tax_minor is
  'Always 0 in this phase. VAT/tax configuration is deferred. Do not invent a VAT registration.';

create trigger quotes_set_updated_at
  before update on public.quotes
  for each row
  execute function public.set_updated_at();

create unique index quotes_one_sent_per_request_idx
  on public.quotes (work_request_id)
  where status = 'sent';

create unique index quotes_one_accepted_per_request_idx
  on public.quotes (work_request_id)
  where status = 'accepted';

create index quotes_work_request_id_idx
  on public.quotes (work_request_id);

create table public.quote_line_items (
  id uuid primary key default gen_random_uuid(),
  quote_id uuid not null references public.quotes (id) on delete cascade,
  position integer not null,
  description text not null,
  quantity integer not null,
  unit_amount_minor bigint not null,
  line_total_minor bigint not null,
  constraint quote_line_items_position_check
    check (position >= 1),
  constraint quote_line_items_description_length_check
    check (char_length(description) between 1 and 200),
  constraint quote_line_items_quantity_check
    check (quantity >= 1),
  constraint quote_line_items_unit_amount_check
    check (unit_amount_minor >= 0),
  constraint quote_line_items_total_check
    check (line_total_minor = quantity * unit_amount_minor),
  constraint quote_line_items_quote_position_key unique (quote_id, position)
);

comment on table public.quote_line_items is
  'Quote service lines. Totals are quantity * unit_amount_minor in integer minor units.';

-- ---------------------------------------------------------------------------
-- projects
-- ---------------------------------------------------------------------------
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  public_id text not null default public.random_public_id('PRJ-'),
  work_request_id uuid not null references public.work_requests (id) on delete restrict,
  accepted_quote_id uuid not null references public.quotes (id) on delete restrict,
  individual_user_id uuid references public.individual_accounts (user_id) on delete restrict,
  organization_id uuid references public.organizations (id) on delete restrict,
  name text not null,
  status text not null default 'planned',
  started_at timestamptz,
  target_completion_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint projects_name_length_check
    check (char_length(name) between 1 and 160),
  constraint projects_status_check
    check (status in ('planned', 'active', 'on_hold', 'completed', 'cancelled')),
  constraint projects_public_id_format_check
    check (public_id ~ '^PRJ-[A-F0-9]{12}$'),
  constraint projects_public_id_key unique (public_id),
  constraint projects_work_request_id_key unique (work_request_id),
  constraint projects_accepted_quote_id_key unique (accepted_quote_id),
  constraint projects_owner_not_both_check
    check (not (individual_user_id is not null and organization_id is not null))
);

comment on table public.projects is
  'Delivery project created only after a quote is accepted. Not a payment or invoice record.';

create trigger projects_set_updated_at
  before update on public.projects
  for each row
  execute function public.set_updated_at();

create index projects_organization_id_idx
  on public.projects (organization_id);

-- ---------------------------------------------------------------------------
-- contracts / SOW
-- Platform acknowledgment records. Not qualified electronic signatures.
-- ---------------------------------------------------------------------------
create table public.contracts (
  id uuid primary key default gen_random_uuid(),
  public_id text not null default public.random_public_id('CT-'),
  project_id uuid not null references public.projects (id) on delete restrict,
  quote_id uuid not null references public.quotes (id) on delete restrict,
  document_type text not null,
  version integer not null,
  title text not null,
  status text not null default 'issued',
  commercial_snapshot jsonb not null default '{}'::jsonb,
  acknowledgment_text text not null,
  effective_date date,
  accepted_at timestamptz,
  accepted_by_user_id uuid references auth.users (id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint contracts_document_type_check
    check (document_type in ('contract', 'statement_of_work')),
  constraint contracts_version_positive_check
    check (version >= 1),
  constraint contracts_title_length_check
    check (char_length(title) between 1 and 160),
  constraint contracts_status_check
    check (status in ('draft', 'issued', 'accepted', 'superseded')),
  constraint contracts_public_id_format_check
    check (public_id ~ '^CT-[A-F0-9]{12}$'),
  constraint contracts_public_id_key unique (public_id),
  constraint contracts_project_type_version_key unique (project_id, document_type, version)
);

comment on table public.contracts is
  'Contract/SOW acknowledgment record. Not DocuSign, Adobe Sign, or a qualified electronic signature. Legal templates are deferred.';

create trigger contracts_set_updated_at
  before update on public.contracts
  for each row
  execute function public.set_updated_at();

create index contracts_project_id_idx
  on public.contracts (project_id);

create index contracts_quote_id_idx
  on public.contracts (quote_id);

-- ---------------------------------------------------------------------------
-- Access helper used by RLS (invoker; memberships RLS still applies)
-- ---------------------------------------------------------------------------
create or replace function public.can_access_work_request(p_request_id uuid)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select exists (
    select 1
    from public.work_requests as request
    where request.id = p_request_id
      and (
        public.is_platform_admin()
        or request.created_by_user_id = (select auth.uid())
        or request.individual_user_id = (select auth.uid())
        or (
          request.organization_id is not null
          and exists (
            select 1
            from public.organization_memberships as membership
            where membership.organization_id = request.organization_id
              and membership.user_id = (select auth.uid())
          )
        )
      )
  );
$$;

comment on function public.can_access_work_request(uuid) is
  'Authorization helper for child rows. SECURITY DEFINER avoids RLS recursion; it still checks auth.uid() and membership.';

revoke all on function public.can_access_work_request(uuid) from public, anon;
grant execute on function public.can_access_work_request(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- Admin: request status
-- ---------------------------------------------------------------------------
create or replace function public.admin_update_work_request_status(
  p_work_request_id uuid,
  p_status text
)
returns public.work_requests
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  current public.work_requests;
  allowed boolean := false;
begin
  perform public.assert_platform_admin();

  select * into current
  from public.work_requests
  where id = p_work_request_id
  for update;

  if current.id is null then
    raise exception 'work request not found';
  end if;

  if current.status = p_status then
    return current;
  end if;

  if current.status = 'converted' then
    raise exception 'converted requests cannot change status';
  end if;

  if current.status = 'submitted' and p_status in ('under_review', 'needs_information', 'qualified', 'declined') then
    allowed := true;
  elsif current.status = 'under_review' and p_status in ('needs_information', 'qualified', 'declined') then
    allowed := true;
  elsif current.status = 'needs_information' and p_status in ('under_review', 'qualified', 'declined') then
    allowed := true;
  elsif current.status = 'qualified' and p_status in ('under_review', 'declined') then
    allowed := true;
  elsif current.status = 'declined' and p_status in ('under_review') then
    allowed := true;
  end if;

  if not allowed then
    raise exception 'invalid work request status transition';
  end if;

  update public.work_requests
  set status = p_status
  where id = current.id
  returning * into current;

  return current;
end;
$$;

comment on function public.admin_update_work_request_status(uuid, text) is
  'Trusted platform-admin status change. Does not grant domain ownership.';

revoke all on function public.admin_update_work_request_status(uuid, text) from public, anon;
grant execute on function public.admin_update_work_request_status(uuid, text) to authenticated;

-- ---------------------------------------------------------------------------
-- Admin: issue quote (new version, sent, previous sent superseded)
-- ---------------------------------------------------------------------------
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

  update public.quotes
  set
    subtotal_minor = subtotal,
    tax_minor = 0,
    total_minor = subtotal,
    status = 'sent',
    sent_at = now()
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

comment on function public.admin_issue_quote(uuid, text, date, text, jsonb) is
  'Creates the next quote version, supersedes any sent quote, and sends it. Tax remains 0.';

revoke all on function public.admin_issue_quote(uuid, text, date, text, jsonb) from public, anon;
grant execute on function public.admin_issue_quote(uuid, text, date, text, jsonb) to authenticated;

-- ---------------------------------------------------------------------------
-- Customer: accept / reject quote
-- ---------------------------------------------------------------------------
create or replace function public.accept_quote(p_quote_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  actor uuid;
  quote_row public.quotes;
  request public.work_requests;
  project_row public.projects;
  contract_row public.contracts;
  snapshot jsonb;
begin
  actor := (select auth.uid());
  if actor is null then
    raise exception 'not authenticated';
  end if;

  select * into quote_row
  from public.quotes
  where id = p_quote_id
  for update;

  if quote_row.id is null then
    raise exception 'quote not found';
  end if;

  select * into request
  from public.work_requests
  where id = quote_row.work_request_id
  for update;

  if not (
    request.created_by_user_id = actor
    or request.individual_user_id = actor
    or (
      request.organization_id is not null
      and exists (
        select 1
        from public.organization_memberships as membership
        where membership.organization_id = request.organization_id
          and membership.user_id = actor
      )
    )
  ) then
    raise exception 'not authorized';
  end if;

  if quote_row.status = 'accepted' then
    select * into project_row from public.projects where accepted_quote_id = quote_row.id;
    select * into contract_row
    from public.contracts
    where quote_id = quote_row.id
    order by version desc
    limit 1;

    return jsonb_build_object(
      'quote_public_id', quote_row.public_id,
      'project_public_id', project_row.public_id,
      'contract_public_id', contract_row.public_id,
      'already_accepted', true
    );
  end if;

  if quote_row.status = 'sent' and quote_row.valid_until is not null and quote_row.valid_until < current_date then
    update public.quotes
    set status = 'expired'
    where id = quote_row.id;
    raise exception 'quote has expired';
  end if;

  if quote_row.status <> 'sent' then
    raise exception 'quote cannot be accepted';
  end if;

  update public.quotes
  set
    status = 'accepted',
    accepted_at = now(),
    accepted_by_user_id = actor
  where id = quote_row.id
  returning * into quote_row;

  update public.work_requests
  set status = 'converted'
  where id = request.id;

  insert into public.projects (
    work_request_id,
    accepted_quote_id,
    individual_user_id,
    organization_id,
    name,
    status
  )
  values (
    request.id,
    quote_row.id,
    request.individual_user_id,
    request.organization_id,
    request.title,
    'planned'
  )
  on conflict (accepted_quote_id) do update
    set name = excluded.name
  returning * into project_row;

  select jsonb_build_object(
    'quote_public_id', quote_row.public_id,
    'currency', quote_row.currency,
    'subtotal_minor', quote_row.subtotal_minor,
    'tax_minor', quote_row.tax_minor,
    'total_minor', quote_row.total_minor,
    'valid_until', quote_row.valid_until,
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
        where item.quote_id = quote_row.id
      ),
      '[]'::jsonb
    )
  )
  into snapshot;

  insert into public.contracts (
    project_id,
    quote_id,
    document_type,
    version,
    title,
    status,
    commercial_snapshot,
    acknowledgment_text,
    effective_date
  )
  values (
    project_row.id,
    quote_row.id,
    'statement_of_work',
    1,
    'Statement of Work — ' || request.title,
    'issued',
    snapshot,
    'This is a Flash One platform acknowledgment of the accepted commercial terms. It is not a qualified electronic signature and not a final legal template. Approved contract language will be added later.',
    current_date
  )
  on conflict (project_id, document_type, version) do update
    set title = excluded.title
  returning * into contract_row;

  return jsonb_build_object(
    'quote_public_id', quote_row.public_id,
    'project_public_id', project_row.public_id,
    'contract_public_id', contract_row.public_id,
    'already_accepted', false
  );
end;
$$;

comment on function public.accept_quote(uuid) is
  'Customer acceptance: timestamps the quote, converts the request, creates one project and an issued SOW acknowledgment. Idempotent.';

revoke all on function public.accept_quote(uuid) from public, anon;
grant execute on function public.accept_quote(uuid) to authenticated;

create or replace function public.reject_quote(p_quote_id uuid)
returns public.quotes
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  actor uuid;
  quote_row public.quotes;
  request public.work_requests;
begin
  actor := (select auth.uid());
  if actor is null then
    raise exception 'not authenticated';
  end if;

  select * into quote_row
  from public.quotes
  where id = p_quote_id
  for update;

  if quote_row.id is null then
    raise exception 'quote not found';
  end if;

  select * into request
  from public.work_requests
  where id = quote_row.work_request_id
  for update;

  if not (
    request.created_by_user_id = actor
    or request.individual_user_id = actor
    or (
      request.organization_id is not null
      and exists (
        select 1
        from public.organization_memberships as membership
        where membership.organization_id = request.organization_id
          and membership.user_id = actor
      )
    )
  ) then
    raise exception 'not authorized';
  end if;

  if quote_row.status = 'rejected' then
    return quote_row;
  end if;

  if quote_row.status = 'sent' and quote_row.valid_until is not null and quote_row.valid_until < current_date then
    update public.quotes
    set status = 'expired'
    where id = quote_row.id
    returning * into quote_row;
    raise exception 'quote has expired';
  end if;

  if quote_row.status <> 'sent' then
    raise exception 'quote cannot be rejected';
  end if;

  update public.quotes
  set
    status = 'rejected',
    rejected_at = now(),
    rejected_by_user_id = actor
  where id = quote_row.id
  returning * into quote_row;

  return quote_row;
end;
$$;

comment on function public.reject_quote(uuid) is
  'Customer rejection of a sent quote. Idempotent. Does not create a project.';

revoke all on function public.reject_quote(uuid) from public, anon;
grant execute on function public.reject_quote(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- Customer: accept contract/SOW acknowledgment
-- ---------------------------------------------------------------------------
create or replace function public.accept_contract(p_contract_id uuid)
returns public.contracts
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  actor uuid;
  contract_row public.contracts;
  project_row public.projects;
begin
  actor := (select auth.uid());
  if actor is null then
    raise exception 'not authenticated';
  end if;

  select * into contract_row
  from public.contracts
  where id = p_contract_id
  for update;

  if contract_row.id is null then
    raise exception 'contract not found';
  end if;

  select * into project_row
  from public.projects
  where id = contract_row.project_id;

  if not public.can_access_work_request(project_row.work_request_id) then
    raise exception 'not authorized';
  end if;

  if public.is_platform_admin() and not (
    project_row.individual_user_id = actor
    or exists (
      select 1
      from public.organization_memberships as membership
      where membership.organization_id = project_row.organization_id
        and membership.user_id = actor
    )
  ) then
    raise exception 'not authorized';
  end if;

  if contract_row.status = 'accepted' then
    return contract_row;
  end if;

  if contract_row.status <> 'issued' then
    raise exception 'contract cannot be accepted';
  end if;

  update public.contracts
  set
    status = 'accepted',
    accepted_at = now(),
    accepted_by_user_id = actor
  where id = contract_row.id
  returning * into contract_row;

  return contract_row;
end;
$$;

comment on function public.accept_contract(uuid) is
  'Platform acknowledgment of an issued Contract/SOW. Not a qualified electronic signature. Idempotent.';

revoke all on function public.accept_contract(uuid) from public, anon;
grant execute on function public.accept_contract(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- Admin: project status
-- ---------------------------------------------------------------------------
create or replace function public.admin_update_project_status(
  p_project_id uuid,
  p_status text
)
returns public.projects
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  current public.projects;
begin
  perform public.assert_platform_admin();

  if p_status not in ('planned', 'active', 'on_hold', 'completed', 'cancelled') then
    raise exception 'invalid project status';
  end if;

  select * into current
  from public.projects
  where id = p_project_id
  for update;

  if current.id is null then
    raise exception 'project not found';
  end if;

  update public.projects
  set
    status = p_status,
    started_at = case
      when p_status = 'active' and current.started_at is null then now()
      else current.started_at
    end,
    completed_at = case
      when p_status = 'completed' then coalesce(current.completed_at, now())
      when p_status in ('planned', 'active', 'on_hold') then null
      else current.completed_at
    end
  where id = current.id
  returning * into current;

  return current;
end;
$$;

revoke all on function public.admin_update_project_status(uuid, text) from public, anon;
grant execute on function public.admin_update_project_status(uuid, text) to authenticated;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.work_requests enable row level security;
alter table public.work_requests force row level security;
alter table public.quotes enable row level security;
alter table public.quotes force row level security;
alter table public.quote_line_items enable row level security;
alter table public.quote_line_items force row level security;
alter table public.projects enable row level security;
alter table public.projects force row level security;
alter table public.contracts enable row level security;
alter table public.contracts force row level security;

revoke all on table public.work_requests from public, anon, authenticated;
revoke all on table public.quotes from public, anon, authenticated;
revoke all on table public.quote_line_items from public, anon, authenticated;
revoke all on table public.projects from public, anon, authenticated;
revoke all on table public.contracts from public, anon, authenticated;

grant select, insert on table public.work_requests to authenticated;
grant select on table public.quotes to authenticated;
grant select on table public.quote_line_items to authenticated;
grant select on table public.projects to authenticated;
grant select on table public.contracts to authenticated;

create policy work_requests_select_related
  on public.work_requests
  for select
  to authenticated
  using (
    public.is_platform_admin()
    or created_by_user_id = (select auth.uid())
    or individual_user_id = (select auth.uid())
    or (
      organization_id is not null
      and exists (
        select 1
        from public.organization_memberships as membership
        where membership.organization_id = work_requests.organization_id
          and membership.user_id = (select auth.uid())
      )
    )
  );

create policy work_requests_insert_own
  on public.work_requests
  for insert
  to authenticated
  with check (
    created_by_user_id = (select auth.uid())
    and (
      (
        individual_user_id = (select auth.uid())
        and organization_id is null
        and exists (
          select 1
          from public.individual_accounts as individual
          where individual.user_id = (select auth.uid())
        )
      )
      or (
        individual_user_id is null
        and organization_id is not null
        and exists (
          select 1
          from public.organization_memberships as membership
          where membership.organization_id = work_requests.organization_id
            and membership.user_id = (select auth.uid())
        )
      )
    )
  );

create policy quotes_select_related
  on public.quotes
  for select
  to authenticated
  using (
    public.can_access_work_request(work_request_id)
    and (public.is_platform_admin() or status <> 'draft')
  );

create policy quote_line_items_select_related
  on public.quote_line_items
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.quotes as quote
      where quote.id = quote_line_items.quote_id
    )
  );

create policy projects_select_related
  on public.projects
  for select
  to authenticated
  using (public.can_access_work_request(work_request_id));

create policy contracts_select_related
  on public.contracts
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.projects as project
      where project.id = contracts.project_id
        and public.can_access_work_request(project.work_request_id)
    )
    and (public.is_platform_admin() or status <> 'draft')
  );
