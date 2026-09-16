-- Phase 4 import, incident, release, email, AI audience RPCs.

create or replace function public.admin_create_import_batch(
  p_import_type text,
  p_filename text,
  p_rows jsonb
)
returns public.import_batches
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  actor uuid;
  current public.import_batches;
  row_item jsonb;
  row_number integer := 0;
  error_total integer := 0;
  status_text text;
begin
  actor := public.assert_platform_admin();
  if jsonb_typeof(p_rows) is distinct from 'array' then
    raise exception 'invalid import rows';
  end if;
  if jsonb_array_length(p_rows) > 500 then
    raise exception 'import is limited to 500 rows';
  end if;
  insert into public.import_batches (
    import_type, source, filename, status, row_count, created_by_user_id
  ) values (
    p_import_type,
    'upload',
    nullif(left(trim(coalesce(p_filename, '')), 180), ''),
    'uploaded',
    0,
    actor
  ) returning * into current;

  for row_item in select jsonb_array_elements(p_rows)
  loop
    row_number := row_number + 1;
    status_text := coalesce(row_item->>'validation_status', 'pending');
    if status_text = 'invalid' then
      error_total := error_total + 1;
    end if;
    insert into public.import_batch_rows (
      batch_id, row_number, raw_values, validation_status, validation_error, duplicate_of_row
    ) values (
      current.id,
      row_number,
      coalesce(row_item->'values', '{}'::jsonb),
      status_text,
      nullif(left(trim(coalesce(row_item->>'validation_error', '')), 400), ''),
      nullif(row_item->>'duplicate_of_row', '')::integer
    );
  end loop;

  update public.import_batches
  set
    row_count = row_number,
    error_count = error_total,
    status = case when row_number = 0 then 'failed' else 'preview' end,
    review_state = 'needs_review'
  where id = current.id
  returning * into current;

  perform public.admin_record_audit_event(
    'import.create',
    'import_batch',
    current.id,
    jsonb_build_object('public_id', current.public_id, 'type', current.import_type)
  );
  return current;
end;
$$;

revoke all on function public.admin_create_import_batch(text, text, jsonb) from public, anon;
grant execute on function public.admin_create_import_batch(text, text, jsonb) to authenticated;

create or replace function public.admin_review_import_batch(
  p_public_id text,
  p_decision text
)
returns public.import_batches
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  actor uuid;
  current public.import_batches;
begin
  actor := public.assert_platform_admin();
  select * into current from public.import_batches where public_id = p_public_id for update;
  if current.id is null then
    raise exception 'import not found';
  end if;
  if p_decision = 'reject' then
    update public.import_batches
    set status = 'rejected', review_state = 'rejected'
    where id = current.id
    returning * into current;
  elsif p_decision = 'approve' then
    if current.import_type in ('bank_statement', 'provider_transactions') then
      raise exception 'bank and provider files cannot become financial records from import';
    end if;
    update public.import_batches
    set
      status = 'approved',
      review_state = 'approved_preview',
      approved_at = now(),
      approved_by_user_id = actor
    where id = current.id
    returning * into current;
  elsif p_decision = 'apply' then
    if current.status is distinct from 'approved' then
      raise exception 'import must be approved before apply';
    end if;
    if current.import_type in ('bank_statement', 'provider_transactions') then
      raise exception 'bank and provider files cannot become financial records from import';
    end if;
    update public.import_batches
    set
      status = 'applied',
      review_state = 'applied_non_financial',
      applied_at = now(),
      notes = coalesce(notes || ' ', '') || 'Preview acknowledged. No sales, payments, or ledger entries were created.'
    where id = current.id
    returning * into current;
  else
    raise exception 'invalid import decision';
  end if;
  perform public.admin_record_audit_event(
    'import.review',
    'import_batch',
    current.id,
    jsonb_build_object('public_id', current.public_id, 'decision', p_decision)
  );
  return current;
end;
$$;

revoke all on function public.admin_review_import_batch(text, text) from public, anon;
grant execute on function public.admin_review_import_batch(text, text) to authenticated;

create or replace function public.admin_upsert_incident(
  p_public_id text,
  p_title text,
  p_severity text,
  p_status text,
  p_affected_module text,
  p_description text,
  p_resolved_at timestamptz
)
returns public.incidents
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  actor uuid;
  current public.incidents;
  title_text text;
begin
  actor := public.assert_platform_admin();
  title_text := left(trim(coalesce(p_title, '')), 160);
  if title_text = '' then
    raise exception 'invalid incident';
  end if;
  if p_public_id is null or btrim(p_public_id) = '' then
    insert into public.incidents (
      title, severity, status, affected_module, description, created_by_user_id, resolved_at
    ) values (
      title_text,
      coalesce(nullif(p_severity, ''), 'medium'),
      coalesce(nullif(p_status, ''), 'open'),
      left(trim(coalesce(p_affected_module, 'platform')), 80),
      nullif(left(trim(coalesce(p_description, '')), 4000), ''),
      actor,
      p_resolved_at
    ) returning * into current;
  else
    update public.incidents
    set
      title = title_text,
      severity = coalesce(nullif(p_severity, ''), severity),
      status = coalesce(nullif(p_status, ''), status),
      affected_module = left(trim(coalesce(p_affected_module, affected_module)), 80),
      description = nullif(left(trim(coalesce(p_description, '')), 4000), ''),
      resolved_at = case
        when coalesce(nullif(p_status, ''), status) in ('resolved', 'closed')
          then coalesce(p_resolved_at, resolved_at, now())
        else p_resolved_at
      end
    where public_id = p_public_id
    returning * into current;
    if current.id is null then
      raise exception 'incident not found';
    end if;
  end if;
  perform public.admin_record_audit_event(
    'incident.upsert',
    'incident',
    current.id,
    jsonb_build_object('public_id', current.public_id)
  );
  return current;
end;
$$;

revoke all on function public.admin_upsert_incident(text, text, text, text, text, text, timestamptz)
  from public, anon;
grant execute on function public.admin_upsert_incident(text, text, text, text, text, text, timestamptz)
  to authenticated;

create or replace function public.admin_create_release_record(
  p_version_name text,
  p_environment_label text,
  p_commit_reference text,
  p_notes text,
  p_released_at timestamptz
)
returns public.release_records
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  actor uuid;
  current public.release_records;
  version_text text;
begin
  actor := public.assert_platform_admin();
  version_text := left(trim(coalesce(p_version_name, '')), 80);
  if version_text = '' then
    raise exception 'invalid release record';
  end if;
  insert into public.release_records (
    version_name, environment_label, status, commit_reference, notes, released_at, created_by_user_id
  ) values (
    version_text,
    coalesce(nullif(p_environment_label, ''), 'unknown'),
    'recorded',
    nullif(left(trim(coalesce(p_commit_reference, '')), 80), ''),
    nullif(left(trim(coalesce(p_notes, '')), 4000), ''),
    p_released_at,
    actor
  ) returning * into current;
  perform public.admin_record_audit_event(
    'release.create',
    'release_record',
    current.id,
    jsonb_build_object('public_id', current.public_id)
  );
  return current;
end;
$$;

revoke all on function public.admin_create_release_record(text, text, text, text, timestamptz)
  from public, anon;
grant execute on function public.admin_create_release_record(text, text, text, text, timestamptz)
  to authenticated;

create or replace function public.admin_queue_email_message(
  p_template_code text,
  p_recipient_user_id uuid,
  p_recipient_email text,
  p_subject text,
  p_related_entity_kind text,
  p_related_entity_public_id text
)
returns public.email_messages
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  actor uuid;
  current public.email_messages;
begin
  actor := public.assert_platform_admin();
  insert into public.email_messages (
    template_code,
    recipient_user_id,
    recipient_email,
    subject,
    status,
    related_entity_kind,
    related_entity_public_id,
    error_summary,
    created_by_user_id
  ) values (
    p_template_code,
    p_recipient_user_id,
    nullif(left(trim(coalesce(p_recipient_email, '')), 160), ''),
    left(trim(coalesce(p_subject, 'Flash One notice')), 180),
    'unavailable',
    nullif(p_related_entity_kind, ''),
    nullif(p_related_entity_public_id, ''),
    'Email provider is not configured. Message was not sent.',
    actor
  ) returning * into current;
  return current;
end;
$$;

revoke all on function public.admin_queue_email_message(text, uuid, text, text, text, text)
  from public, anon;
grant execute on function public.admin_queue_email_message(text, uuid, text, text, text, text)
  to authenticated;

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
  purpose_text text;
  audience_text text;
begin
  actor := (select auth.uid());
  if actor is null then
    raise exception 'not authenticated';
  end if;
  purpose_text := coalesce(nullif(btrim(p_purpose), ''), 'project_idea');
  audience_text := 'customer';
  if purpose_text = 'admin_assistance' then
    perform public.assert_platform_admin();
    audience_text := 'admin';
  elsif purpose_text = 'project_assistance' then
    if not exists (select 1 from public.developer_profiles where user_id = actor)
      and not public.is_platform_admin()
    then
      raise exception 'not authorized';
    end if;
    audience_text := case when public.is_platform_admin() then 'admin' else 'developer' end;
  end if;
  select count(*) into recent
  from public.ai_conversations
  where user_id = actor
    and created_at > now() - interval '1 hour';
  if recent >= 20 then
    raise exception 'ai could not be started';
  end if;
  insert into public.ai_conversations (user_id, purpose, audience)
  values (actor, purpose_text, audience_text)
  returning * into created;
  return created;
end;
$$;

revoke all on function public.create_ai_conversation(text) from public, anon;
grant execute on function public.create_ai_conversation(text) to authenticated;
