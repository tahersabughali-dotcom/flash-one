-- Phase 3 RPCs, storage, and RLS. Forward only.

create or replace function public.admin_record_audit_event(
  p_action text,
  p_entity_type text,
  p_entity_id uuid,
  p_metadata jsonb
)
returns void
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  actor uuid;
begin
  actor := public.assert_platform_admin();
  insert into public.audit_events (
    occurred_at, actor_type, actor_id, action, entity_type, entity_id, metadata
  ) values (
    now(), 'admin', actor, left(trim(p_action), 80), left(trim(p_entity_type), 80), p_entity_id, coalesce(p_metadata, '{}'::jsonb)
  );
end;
$$;

revoke all on function public.admin_record_audit_event(text, text, uuid, jsonb) from public, anon;
grant execute on function public.admin_record_audit_event(text, text, uuid, jsonb) to authenticated;

create or replace function public.internal_record_operational_activity(
  p_event_type text,
  p_entity_kind text,
  p_entity_public_id text,
  p_summary text,
  p_actor uuid
)
returns void
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  insert into public.operational_activity (
    event_type, entity_kind, entity_public_id, summary, actor_user_id
  ) values (
    left(trim(p_event_type), 80),
    left(trim(p_entity_kind), 40),
    left(trim(p_entity_public_id), 40),
    left(trim(p_summary), 400),
    p_actor
  );
end;
$$;

revoke all on function public.internal_record_operational_activity(text, text, text, text, uuid)
  from public, anon, authenticated;

create or replace function public.admin_upsert_employee(
  p_public_id text,
  p_display_name text,
  p_email text,
  p_job_title text,
  p_department text,
  p_status text,
  p_start_date date,
  p_user_id uuid,
  p_internal_notes text
)
returns public.employees
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  actor uuid;
  current public.employees;
  name_text text;
begin
  actor := public.assert_platform_admin();
  name_text := left(trim(coalesce(p_display_name, '')), 120);
  if name_text = '' then
    raise exception 'invalid employee';
  end if;
  if p_public_id is null or btrim(p_public_id) = '' then
    insert into public.employees (
      display_name, email, job_title, department, status, start_date, user_id, internal_notes, created_by_user_id
    ) values (
      name_text,
      nullif(left(trim(coalesce(p_email, '')), 160), ''),
      nullif(left(trim(coalesce(p_job_title, '')), 120), ''),
      nullif(left(trim(coalesce(p_department, '')), 120), ''),
      coalesce(nullif(p_status, ''), 'active'),
      p_start_date,
      p_user_id,
      nullif(left(trim(coalesce(p_internal_notes, '')), 4000), ''),
      actor
    ) returning * into current;
  else
    update public.employees
    set
      display_name = name_text,
      email = nullif(left(trim(coalesce(p_email, '')), 160), ''),
      job_title = nullif(left(trim(coalesce(p_job_title, '')), 120), ''),
      department = nullif(left(trim(coalesce(p_department, '')), 120), ''),
      status = coalesce(nullif(p_status, ''), status),
      start_date = p_start_date,
      user_id = p_user_id,
      internal_notes = nullif(left(trim(coalesce(p_internal_notes, '')), 4000), '')
    where public_id = p_public_id
    returning * into current;
    if current.id is null then
      raise exception 'employee not found';
    end if;
  end if;
  perform public.admin_record_audit_event('employee.upsert', 'employee', current.id, jsonb_build_object('public_id', current.public_id));
  perform public.internal_record_operational_activity('employee_upserted', 'employee', current.public_id, 'Employee record saved', actor);
  return current;
end;
$$;

revoke all on function public.admin_upsert_employee(text, text, text, text, text, text, date, uuid, text) from public, anon;
grant execute on function public.admin_upsert_employee(text, text, text, text, text, text, date, uuid, text) to authenticated;

create or replace function public.admin_upsert_freelancer(
  p_public_id text,
  p_display_name text,
  p_email text,
  p_specialty text,
  p_country text,
  p_status text,
  p_developer_public_id text,
  p_internal_notes text
)
returns public.freelancers
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  actor uuid;
  current public.freelancers;
  developer uuid;
  name_text text;
begin
  actor := public.assert_platform_admin();
  name_text := left(trim(coalesce(p_display_name, '')), 120);
  if name_text = '' then
    raise exception 'invalid freelancer';
  end if;
  developer := null;
  if p_developer_public_id is not null and btrim(p_developer_public_id) <> '' then
    select user_id into developer from public.developer_profiles where public_id = p_developer_public_id;
    if developer is null then
      raise exception 'developer not found';
    end if;
  end if;
  if p_public_id is null or btrim(p_public_id) = '' then
    insert into public.freelancers (
      display_name, email, specialty, country, status, developer_user_id, internal_notes, created_by_user_id
    ) values (
      name_text,
      nullif(left(trim(coalesce(p_email, '')), 160), ''),
      nullif(left(trim(coalesce(p_specialty, '')), 160), ''),
      nullif(left(trim(coalesce(p_country, '')), 80), ''),
      coalesce(nullif(p_status, ''), 'active'),
      developer,
      nullif(left(trim(coalesce(p_internal_notes, '')), 4000), ''),
      actor
    ) returning * into current;
  else
    update public.freelancers
    set
      display_name = name_text,
      email = nullif(left(trim(coalesce(p_email, '')), 160), ''),
      specialty = nullif(left(trim(coalesce(p_specialty, '')), 160), ''),
      country = nullif(left(trim(coalesce(p_country, '')), 80), ''),
      status = coalesce(nullif(p_status, ''), status),
      developer_user_id = developer,
      internal_notes = nullif(left(trim(coalesce(p_internal_notes, '')), 4000), '')
    where public_id = p_public_id
    returning * into current;
    if current.id is null then
      raise exception 'freelancer not found';
    end if;
  end if;
  perform public.admin_record_audit_event('freelancer.upsert', 'freelancer', current.id, jsonb_build_object('public_id', current.public_id));
  return current;
end;
$$;

revoke all on function public.admin_upsert_freelancer(text, text, text, text, text, text, text, text) from public, anon;
grant execute on function public.admin_upsert_freelancer(text, text, text, text, text, text, text, text) to authenticated;

create or replace function public.admin_upsert_partner(
  p_public_id text,
  p_name text,
  p_relationship_type text,
  p_capabilities text,
  p_website text,
  p_country text,
  p_status text,
  p_internal_notes text
)
returns public.partner_companies
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  actor uuid;
  current public.partner_companies;
  name_text text;
begin
  actor := public.assert_platform_admin();
  name_text := left(trim(coalesce(p_name, '')), 160);
  if name_text = '' then
    raise exception 'invalid partner';
  end if;
  if p_public_id is null or btrim(p_public_id) = '' then
    insert into public.partner_companies (
      name, relationship_type, capabilities, website, country, status, internal_notes, created_by_user_id
    ) values (
      name_text,
      p_relationship_type,
      nullif(left(trim(coalesce(p_capabilities, '')), 4000), ''),
      nullif(left(trim(coalesce(p_website, '')), 200), ''),
      nullif(left(trim(coalesce(p_country, '')), 80), ''),
      coalesce(nullif(p_status, ''), 'active'),
      nullif(left(trim(coalesce(p_internal_notes, '')), 4000), ''),
      actor
    ) returning * into current;
  else
    update public.partner_companies
    set
      name = name_text,
      relationship_type = p_relationship_type,
      capabilities = nullif(left(trim(coalesce(p_capabilities, '')), 4000), ''),
      website = nullif(left(trim(coalesce(p_website, '')), 200), ''),
      country = nullif(left(trim(coalesce(p_country, '')), 80), ''),
      status = coalesce(nullif(p_status, ''), status),
      internal_notes = nullif(left(trim(coalesce(p_internal_notes, '')), 4000), '')
    where public_id = p_public_id
    returning * into current;
    if current.id is null then
      raise exception 'partner not found';
    end if;
  end if;
  perform public.admin_record_audit_event('partner.upsert', 'partner', current.id, jsonb_build_object('public_id', current.public_id));
  return current;
end;
$$;

revoke all on function public.admin_upsert_partner(text, text, text, text, text, text, text, text) from public, anon;
grant execute on function public.admin_upsert_partner(text, text, text, text, text, text, text, text) to authenticated;

create or replace function public.admin_upsert_supplier(
  p_public_id text,
  p_name text,
  p_supplier_type text,
  p_status text,
  p_internal_notes text
)
returns public.suppliers
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  actor uuid;
  current public.suppliers;
  name_text text;
begin
  actor := public.assert_platform_admin();
  name_text := left(trim(coalesce(p_name, '')), 160);
  if name_text = '' then
    raise exception 'invalid supplier';
  end if;
  if p_public_id is null or btrim(p_public_id) = '' then
    insert into public.suppliers (name, supplier_type, status, internal_notes, created_by_user_id)
    values (
      name_text, p_supplier_type, coalesce(nullif(p_status, ''), 'active'),
      nullif(left(trim(coalesce(p_internal_notes, '')), 4000), ''), actor
    ) returning * into current;
  else
    update public.suppliers
    set
      name = name_text,
      supplier_type = p_supplier_type,
      status = coalesce(nullif(p_status, ''), status),
      internal_notes = nullif(left(trim(coalesce(p_internal_notes, '')), 4000), '')
    where public_id = p_public_id
    returning * into current;
    if current.id is null then
      raise exception 'supplier not found';
    end if;
  end if;
  perform public.admin_record_audit_event('supplier.upsert', 'supplier', current.id, jsonb_build_object('public_id', current.public_id));
  return current;
end;
$$;

revoke all on function public.admin_upsert_supplier(text, text, text, text, text) from public, anon;
grant execute on function public.admin_upsert_supplier(text, text, text, text, text) to authenticated;

create or replace function public.admin_upsert_contact(
  p_public_id text,
  p_display_name text,
  p_job_title text,
  p_email text,
  p_phone text,
  p_owner_kind text,
  p_owner_public_id text,
  p_status text,
  p_internal_notes text
)
returns public.contacts
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  actor uuid;
  current public.contacts;
  org uuid;
  partner uuid;
  supplier uuid;
  name_text text;
begin
  actor := public.assert_platform_admin();
  name_text := left(trim(coalesce(p_display_name, '')), 120);
  if name_text = '' then
    raise exception 'invalid contact';
  end if;
  org := null; partner := null; supplier := null;
  if p_owner_kind = 'organization' then
    select id into org from public.organizations where public_id = p_owner_public_id;
    if org is null then raise exception 'organization not found'; end if;
  elsif p_owner_kind = 'partner' then
    select id into partner from public.partner_companies where public_id = p_owner_public_id;
    if partner is null then raise exception 'partner not found'; end if;
  elsif p_owner_kind = 'supplier' then
    select id into supplier from public.suppliers where public_id = p_owner_public_id;
    if supplier is null then raise exception 'supplier not found'; end if;
  elsif p_owner_kind <> 'other' then
    raise exception 'invalid owner kind';
  end if;
  if p_public_id is null or btrim(p_public_id) = '' then
    insert into public.contacts (
      display_name, job_title, email, phone, owner_kind, organization_id, partner_id, supplier_id, status, internal_notes, created_by_user_id
    ) values (
      name_text,
      nullif(left(trim(coalesce(p_job_title, '')), 120), ''),
      nullif(left(trim(coalesce(p_email, '')), 160), ''),
      nullif(left(trim(coalesce(p_phone, '')), 40), ''),
      p_owner_kind, org, partner, supplier,
      coalesce(nullif(p_status, ''), 'active'),
      nullif(left(trim(coalesce(p_internal_notes, '')), 4000), ''),
      actor
    ) returning * into current;
  else
    update public.contacts
    set
      display_name = name_text,
      job_title = nullif(left(trim(coalesce(p_job_title, '')), 120), ''),
      email = nullif(left(trim(coalesce(p_email, '')), 160), ''),
      phone = nullif(left(trim(coalesce(p_phone, '')), 40), ''),
      owner_kind = p_owner_kind,
      organization_id = org,
      partner_id = partner,
      supplier_id = supplier,
      status = coalesce(nullif(p_status, ''), status),
      internal_notes = nullif(left(trim(coalesce(p_internal_notes, '')), 4000), '')
    where public_id = p_public_id
    returning * into current;
    if current.id is null then raise exception 'contact not found'; end if;
  end if;
  return current;
end;
$$;

revoke all on function public.admin_upsert_contact(text, text, text, text, text, text, text, text, text) from public, anon;
grant execute on function public.admin_upsert_contact(text, text, text, text, text, text, text, text, text) to authenticated;
