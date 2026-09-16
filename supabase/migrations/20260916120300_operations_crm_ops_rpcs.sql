-- Phase 3 team, tasks, documents, communications, cases, notes, storage, RLS.

create or replace function public.admin_assign_project_team(
  p_project_public_id text,
  p_member_kind text,
  p_member_public_id text,
  p_role_label text
)
returns public.project_team_assignments
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  actor uuid;
  project uuid;
  current public.project_team_assignments;
  employee uuid; freelancer uuid; partner uuid; developer uuid;
  recipient uuid;
begin
  actor := public.assert_platform_admin();
  select id into project from public.projects where public_id = p_project_public_id;
  if project is null then raise exception 'project not found'; end if;
  employee := null; freelancer := null; partner := null; developer := null; recipient := null;
  if p_member_kind = 'employee' then
    select id, user_id into employee, recipient from public.employees where public_id = p_member_public_id;
    if employee is null then raise exception 'employee not found'; end if;
  elsif p_member_kind = 'freelancer' then
    select id into freelancer from public.freelancers where public_id = p_member_public_id;
    if freelancer is null then raise exception 'freelancer not found'; end if;
  elsif p_member_kind = 'partner' then
    select id into partner from public.partner_companies where public_id = p_member_public_id;
    if partner is null then raise exception 'partner not found'; end if;
  elsif p_member_kind = 'developer' then
    select user_id into developer from public.developer_profiles where public_id = p_member_public_id;
    if developer is null then raise exception 'developer not found'; end if;
    recipient := developer;
  else
    raise exception 'invalid team member';
  end if;
  insert into public.project_team_assignments (
    project_id, member_kind, role_label, employee_id, freelancer_id, partner_id, developer_user_id, assigned_by_user_id
  ) values (
    project, p_member_kind, p_role_label, employee, freelancer, partner, developer, actor
  ) returning * into current;
  if p_member_kind = 'developer' then
    perform public.admin_assign_project_developer(project, developer);
  end if;
  if recipient is not null then
    perform public.internal_create_notification(
      recipient, 'project_assignment', 'Project assignment',
      'You were assigned to a Flash One project.', 'project', p_project_public_id
    );
  end if;
  perform public.internal_record_operational_activity(
    'team_assigned', 'project', p_project_public_id, 'Team member assigned', actor
  );
  return current;
end;
$$;

revoke all on function public.admin_assign_project_team(text, text, text, text) from public, anon;
grant execute on function public.admin_assign_project_team(text, text, text, text) to authenticated;

create or replace function public.admin_end_project_team(p_public_id text)
returns public.project_team_assignments
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  actor uuid;
  current public.project_team_assignments;
begin
  actor := public.assert_platform_admin();
  update public.project_team_assignments
  set status = 'ended', ended_at = now()
  where public_id = p_public_id and status = 'active'
  returning * into current;
  if current.id is null then raise exception 'assignment not found'; end if;
  if current.member_kind = 'developer' then
    perform public.admin_unassign_project_developer(current.project_id, current.developer_user_id);
  end if;
  return current;
end;
$$;

revoke all on function public.admin_end_project_team(text) from public, anon;
grant execute on function public.admin_end_project_team(text) to authenticated;

create or replace function public.admin_set_project_task_assignee(
  p_task_public_id text,
  p_assignee_kind text,
  p_assignee_public_id text
)
returns public.project_tasks
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  actor uuid;
  current public.project_tasks;
  employee uuid; freelancer uuid; developer uuid; recipient uuid;
  project_public text;
begin
  actor := public.assert_platform_admin();
  employee := null; freelancer := null; developer := null; recipient := null;
  if p_assignee_kind = 'employee' then
    select id, user_id into employee, recipient from public.employees where public_id = p_assignee_public_id;
    if employee is null then raise exception 'employee not found'; end if;
  elsif p_assignee_kind = 'freelancer' then
    select id into freelancer from public.freelancers where public_id = p_assignee_public_id;
    if freelancer is null then raise exception 'freelancer not found'; end if;
  elsif p_assignee_kind = 'developer' then
    select user_id into developer from public.developer_profiles where public_id = p_assignee_public_id;
    if developer is null then raise exception 'developer not found'; end if;
    recipient := developer;
  elsif p_assignee_kind is not null and p_assignee_kind <> '' then
    raise exception 'invalid assignee';
  end if;
  update public.project_tasks
  set
    assignee_kind = nullif(p_assignee_kind, ''),
    assignee_employee_id = employee,
    assignee_freelancer_id = freelancer,
    assignee_developer_user_id = developer
  where public_id = p_task_public_id
  returning * into current;
  if current.id is null then raise exception 'task not found'; end if;
  if recipient is not null then
    select public_id into project_public from public.projects where id = current.project_id;
    perform public.internal_create_notification(
      recipient, 'task_assignment', 'Task assignment',
      'A project task was assigned to you.', 'task', current.public_id
    );
  end if;
  return current;
end;
$$;

revoke all on function public.admin_set_project_task_assignee(text, text, text) from public, anon;
grant execute on function public.admin_set_project_task_assignee(text, text, text) to authenticated;

create or replace function public.admin_upsert_operational_task(
  p_public_id text,
  p_title text,
  p_description text,
  p_status text,
  p_priority text,
  p_due_at timestamptz,
  p_project_public_id text,
  p_customer_public_id text,
  p_invoice_public_id text,
  p_case_public_id text,
  p_assignee_employee_public_id text
)
returns public.operational_tasks
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  actor uuid;
  current public.operational_tasks;
  project uuid; customer uuid; invoice uuid; support uuid; employee uuid;
  title_text text;
begin
  actor := public.assert_platform_admin();
  title_text := left(trim(coalesce(p_title, '')), 160);
  if title_text = '' then raise exception 'invalid task'; end if;
  select id into project from public.projects where public_id = nullif(p_project_public_id, '');
  select user_id into customer from public.individual_accounts where public_id = nullif(p_customer_public_id, '');
  select id into invoice from public.invoices where public_id = nullif(p_invoice_public_id, '');
  select id into support from public.support_cases where public_id = nullif(p_case_public_id, '');
  select id into employee from public.employees where public_id = nullif(p_assignee_employee_public_id, '');
  if p_public_id is null or btrim(p_public_id) = '' then
    insert into public.operational_tasks (
      title, description, status, priority, due_at, completed_at, project_id, individual_user_id,
      invoice_id, support_case_id, assignee_employee_id, created_by_user_id
    ) values (
      title_text, nullif(left(trim(coalesce(p_description, '')), 4000), ''),
      coalesce(nullif(p_status, ''), 'todo'), coalesce(nullif(p_priority, ''), 'normal'),
      p_due_at, case when p_status = 'completed' then now() else null end,
      project, customer, invoice, support, employee, actor
    ) returning * into current;
  else
    update public.operational_tasks
    set
      title = title_text,
      description = nullif(left(trim(coalesce(p_description, '')), 4000), ''),
      status = coalesce(nullif(p_status, ''), status),
      priority = coalesce(nullif(p_priority, ''), priority),
      due_at = p_due_at,
      completed_at = case when coalesce(nullif(p_status, ''), status) = 'completed' then coalesce(completed_at, now()) else null end,
      project_id = project,
      individual_user_id = customer,
      invoice_id = invoice,
      support_case_id = support,
      assignee_employee_id = employee
    where public_id = p_public_id
    returning * into current;
    if current.id is null then raise exception 'task not found'; end if;
  end if;
  return current;
end;
$$;

revoke all on function public.admin_upsert_operational_task(text, text, text, text, text, timestamptz, text, text, text, text, text) from public, anon;
grant execute on function public.admin_upsert_operational_task(text, text, text, text, text, timestamptz, text, text, text, text, text) to authenticated;

create or replace function public.register_operational_document(
  p_title text,
  p_document_type text,
  p_entity_kind text,
  p_entity_public_id text,
  p_original_filename text,
  p_claimed_mime text,
  p_size_bytes bigint,
  p_internal_notes text
)
returns public.operational_documents
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  actor uuid;
  created public.operational_documents;
  storage_name text;
begin
  actor := public.assert_platform_admin();
  storage_name := gen_random_uuid()::text || '-' || left(trim(p_original_filename), 80);
  insert into public.operational_documents (
    title, document_type, entity_kind, entity_public_id, original_filename,
    storage_path, mime_type, size_bytes, uploaded_by_user_id, internal_notes
  ) values (
    left(trim(p_title), 160), p_document_type, coalesce(nullif(p_entity_kind, ''), 'other'),
    nullif(p_entity_public_id, ''), left(trim(p_original_filename), 120),
    'internal/' || actor::text || '/' || storage_name,
    left(trim(coalesce(p_claimed_mime, 'application/octet-stream')), 120),
    p_size_bytes, actor,
    nullif(left(trim(coalesce(p_internal_notes, '')), 4000), '')
  ) returning * into created;
  return created;
end;
$$;

revoke all on function public.register_operational_document(text, text, text, text, text, text, bigint, text) from public, anon;
grant execute on function public.register_operational_document(text, text, text, text, text, text, bigint, text) to authenticated;

create or replace function public.admin_record_communication(
  p_channel text,
  p_source_kind text,
  p_title text,
  p_body text,
  p_occurred_at timestamptz,
  p_entity_kind text,
  p_entity_public_id text,
  p_customer_public_id text,
  p_organization_public_id text,
  p_project_public_id text
)
returns public.operational_communications
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  actor uuid;
  current public.operational_communications;
  customer uuid; org uuid; project uuid;
  source_text text;
begin
  actor := public.assert_platform_admin();
  source_text := coalesce(nullif(p_source_kind, ''), 'manual_record');
  if p_channel <> 'platform_conversation' then
    source_text := 'manual_record';
  end if;
  select user_id into customer from public.individual_accounts where public_id = nullif(p_customer_public_id, '');
  select id into org from public.organizations where public_id = nullif(p_organization_public_id, '');
  select id into project from public.projects where public_id = nullif(p_project_public_id, '');
  insert into public.operational_communications (
    channel, source_kind, title, body, occurred_at, entity_kind, entity_public_id,
    individual_user_id, organization_id, project_id, recorded_by_user_id
  ) values (
    p_channel, source_text, left(trim(p_title), 160),
    nullif(left(trim(coalesce(p_body, '')), 8000), ''),
    coalesce(p_occurred_at, now()),
    nullif(p_entity_kind, ''), nullif(p_entity_public_id, ''),
    customer, org, project, actor
  ) returning * into current;
  perform public.internal_record_operational_activity(
    'communication_recorded', coalesce(current.entity_kind, 'other'),
    coalesce(current.entity_public_id, current.public_id),
    'Communication recorded', actor
  );
  return current;
end;
$$;

revoke all on function public.admin_record_communication(text, text, text, text, timestamptz, text, text, text, text, text) from public, anon;
grant execute on function public.admin_record_communication(text, text, text, text, timestamptz, text, text, text, text, text) to authenticated;

create or replace function public.admin_upsert_support_case(
  p_public_id text,
  p_title text,
  p_case_type text,
  p_priority text,
  p_status text,
  p_description text,
  p_customer_public_id text,
  p_organization_public_id text,
  p_project_public_id text,
  p_order_public_id text,
  p_invoice_public_id text,
  p_assigned_employee_public_id text,
  p_customer_visible boolean
)
returns public.support_cases
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  actor uuid;
  current public.support_cases;
  previous_status text;
  customer uuid; org uuid; project uuid; order_id uuid; invoice uuid; employee uuid;
  recipient uuid;
begin
  actor := public.assert_platform_admin();
  select user_id into customer from public.individual_accounts where public_id = nullif(p_customer_public_id, '');
  select id into org from public.organizations where public_id = nullif(p_organization_public_id, '');
  select id into project from public.projects where public_id = nullif(p_project_public_id, '');
  select id into order_id from public.store_orders where public_id = nullif(p_order_public_id, '');
  select id into invoice from public.invoices where public_id = nullif(p_invoice_public_id, '');
  select id, user_id into employee, recipient from public.employees where public_id = nullif(p_assigned_employee_public_id, '');
  if p_public_id is null or btrim(p_public_id) = '' then
    previous_status := null;
    insert into public.support_cases (
      title, case_type, priority, status, description, individual_user_id, organization_id,
      project_id, store_order_id, invoice_id, assigned_employee_id, customer_visible, created_by_user_id,
      resolved_at
    ) values (
      left(trim(p_title), 160), p_case_type, coalesce(nullif(p_priority, ''), 'normal'),
      coalesce(nullif(p_status, ''), 'open'),
      nullif(left(trim(coalesce(p_description, '')), 8000), ''),
      customer, org, project, order_id, invoice, employee, coalesce(p_customer_visible, false), actor,
      case when coalesce(nullif(p_status, ''), 'open') in ('resolved', 'closed') then now() else null end
    ) returning * into current;
    insert into public.support_case_events (case_id, event_type, summary, created_by_user_id)
    values (current.id, 'created', 'Case created', actor);
  else
    select status into previous_status from public.support_cases where public_id = p_public_id;
    update public.support_cases
    set
      title = left(trim(p_title), 160),
      case_type = p_case_type,
      priority = coalesce(nullif(p_priority, ''), priority),
      status = coalesce(nullif(p_status, ''), status),
      description = nullif(left(trim(coalesce(p_description, '')), 8000), ''),
      individual_user_id = customer,
      organization_id = org,
      project_id = project,
      store_order_id = order_id,
      invoice_id = invoice,
      assigned_employee_id = employee,
      customer_visible = coalesce(p_customer_visible, customer_visible),
      resolved_at = case
        when coalesce(nullif(p_status, ''), status) in ('resolved', 'closed') then coalesce(resolved_at, now())
        else null
      end
    where public_id = p_public_id
    returning * into current;
    if current.id is null then raise exception 'case not found'; end if;
    if previous_status is distinct from current.status then
      insert into public.support_case_events (case_id, event_type, summary, created_by_user_id)
      values (current.id, 'status_changed', 'Status changed to ' || current.status, actor);
    end if;
  end if;
  if recipient is not null then
    perform public.internal_create_notification(
      recipient, 'case_update', 'Case assignment',
      'A support case was assigned to you.', 'case', current.public_id
    );
  end if;
  if current.customer_visible and current.individual_user_id is not null then
    perform public.internal_create_notification(
      current.individual_user_id, 'case_update', 'Support case update',
      'There is an update on your support case.', 'case', current.public_id
    );
  end if;
  return current;
end;
$$;

revoke all on function public.admin_upsert_support_case(text, text, text, text, text, text, text, text, text, text, text, text, boolean) from public, anon;
grant execute on function public.admin_upsert_support_case(text, text, text, text, text, text, text, text, text, text, text, text, boolean) to authenticated;

create or replace function public.admin_add_internal_note(
  p_entity_kind text,
  p_entity_public_id text,
  p_content text
)
returns public.internal_notes
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  actor uuid;
  current public.internal_notes;
begin
  actor := public.assert_platform_admin();
  insert into public.internal_notes (entity_kind, entity_public_id, content, created_by_user_id)
  values (p_entity_kind, p_entity_public_id, left(trim(p_content), 8000), actor)
  returning * into current;
  if p_entity_kind = 'case' then
    insert into public.support_case_events (case_id, event_type, summary, created_by_user_id)
    select id, 'note', 'Internal note added', actor
    from public.support_cases where public_id = p_entity_public_id;
  end if;
  return current;
end;
$$;

revoke all on function public.admin_add_internal_note(text, text, text) from public, anon;
grant execute on function public.admin_add_internal_note(text, text, text) to authenticated;

create or replace function public.can_access_support_case(p_case_id uuid)
returns boolean
language plpgsql
stable
security definer
set search_path = pg_catalog, public
as $$
declare
  current public.support_cases;
  actor uuid;
begin
  actor := (select auth.uid());
  if actor is null then
    return false;
  end if;
  if public.is_platform_admin() then
    return true;
  end if;
  select * into current from public.support_cases where id = p_case_id;
  if current.id is null or not current.customer_visible then
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

revoke all on function public.can_access_support_case(uuid) from public, anon;
grant execute on function public.can_access_support_case(uuid) to authenticated;
