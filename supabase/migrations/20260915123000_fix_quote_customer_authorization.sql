-- Fix quote/contract customer authorization.
-- PL/pgSQL `IF NOT (a = actor OR ...)` skips the deny path when a nullable
-- owner column is NULL, because `NULL = uuid` is NULL. Cross-organization
-- quote acceptance was possible. Treat unknown as false.

create or replace function public.actor_is_request_customer(
  p_request public.work_requests,
  p_actor uuid
)
returns boolean
language sql
stable
security invoker
set search_path = pg_catalog, public
as $$
  select coalesce(
    p_actor is not null
    and (
      p_request.created_by_user_id = p_actor
      or p_request.individual_user_id = p_actor
      or (
        p_request.organization_id is not null
        and exists (
          select 1
          from public.organization_memberships as membership
          where membership.organization_id = p_request.organization_id
            and membership.user_id = p_actor
        )
      )
    ),
    false
  );
$$;

comment on function public.actor_is_request_customer(public.work_requests, uuid) is
  'Customer-relationship check for trusted workflow functions. Never returns NULL. Does not treat platform admin as a customer.';

revoke all on function public.actor_is_request_customer(public.work_requests, uuid) from public, anon, authenticated;

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

  if not public.actor_is_request_customer(request, actor) then
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

  if not public.actor_is_request_customer(request, actor) then
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

revoke all on function public.reject_quote(uuid) from public, anon;
grant execute on function public.reject_quote(uuid) to authenticated;

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
  request public.work_requests;
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

  select * into request
  from public.work_requests
  where id = project_row.work_request_id;

  if not public.actor_is_request_customer(request, actor) then
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
  'Platform acknowledgment of an issued Contract/SOW by a customer relationship actor. Not a qualified electronic signature. Idempotent. Platform admin is not sufficient.';

revoke all on function public.accept_contract(uuid) from public, anon;
grant execute on function public.accept_contract(uuid) to authenticated;
