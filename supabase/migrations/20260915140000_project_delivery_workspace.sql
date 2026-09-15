-- Flash One project delivery workspace
-- Tasks, private files, deliverables, conversations, project activity.
-- Not payments, invoices, or electronic signatures.

-- ---------------------------------------------------------------------------
-- Access helpers
-- ---------------------------------------------------------------------------
create or replace function public.can_access_project(p_project_id uuid)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select exists (
    select 1
    from public.projects as project
    where project.id = p_project_id
      and public.can_access_work_request(project.work_request_id)
  );
$$;

comment on function public.can_access_project(uuid) is
  'True when auth.uid() may access the project via work-request ownership/membership or platform admin.';

revoke all on function public.can_access_project(uuid) from public, anon;
grant execute on function public.can_access_project(uuid) to authenticated;

create or replace function public.is_project_customer(p_project_id uuid)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select coalesce(
    (
      select public.actor_is_request_customer(request, (select auth.uid()))
      from public.projects as project
      join public.work_requests as request
        on request.id = project.work_request_id
      where project.id = p_project_id
    ),
    false
  );
$$;

comment on function public.is_project_customer(uuid) is
  'True when auth.uid() is a customer actor for the project. Platform admin is not sufficient.';

revoke all on function public.is_project_customer(uuid) from public, anon;
grant execute on function public.is_project_customer(uuid) to authenticated;

create or replace function public.normalize_upload_filename(p_name text)
returns text
language plpgsql
immutable
set search_path = pg_catalog, public
as $$
declare
  base text;
  cleaned text;
begin
  base := regexp_replace(coalesce(p_name, ''), '[\\/]+', '/', 'g');
  base := regexp_replace(base, '^.*/', '');
  base := trim(base);
  cleaned := regexp_replace(base, '[^A-Za-z0-9._-]', '_', 'g');
  cleaned := regexp_replace(cleaned, '_+', '_', 'g');
  cleaned := left(cleaned, 120);
  if cleaned !~* '^[A-Za-z0-9][A-Za-z0-9._-]*\.(pdf|png|jpe?g|webp|txt|csv|zip|docx|xlsx)$' then
    raise exception 'unsupported filename';
  end if;
  return cleaned;
end;
$$;

revoke all on function public.normalize_upload_filename(text) from public, anon;
grant execute on function public.normalize_upload_filename(text) to authenticated;

create or replace function public.canonical_upload_mime(p_filename text)
returns text
language sql
immutable
set search_path = pg_catalog, public
as $$
  select case lower(regexp_replace(p_filename, '.*\.', ''))
    when 'pdf' then 'application/pdf'
    when 'png' then 'image/png'
    when 'jpg' then 'image/jpeg'
    when 'jpeg' then 'image/jpeg'
    when 'webp' then 'image/webp'
    when 'txt' then 'text/plain'
    when 'csv' then 'text/csv'
    when 'zip' then 'application/zip'
    when 'docx' then 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    when 'xlsx' then 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    else null
  end;
$$;

revoke all on function public.canonical_upload_mime(text) from public, anon;
grant execute on function public.canonical_upload_mime(text) to authenticated;

-- ---------------------------------------------------------------------------
-- project_tasks
-- ---------------------------------------------------------------------------
create table public.project_tasks (
  id uuid primary key default gen_random_uuid(),
  public_id text not null default public.random_public_id('TSK-'),
  project_id uuid not null references public.projects (id) on delete restrict,
  title text not null,
  description text,
  status text not null default 'todo',
  priority text not null default 'normal',
  due_at timestamptz,
  completed_at timestamptz,
  customer_visible boolean not null default false,
  created_by_user_id uuid references auth.users (id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint project_tasks_title_length_check
    check (char_length(title) between 1 and 160),
  constraint project_tasks_description_length_check
    check (description is null or char_length(description) between 1 and 4000),
  constraint project_tasks_status_check
    check (status in ('todo', 'in_progress', 'blocked', 'completed', 'cancelled')),
  constraint project_tasks_priority_check
    check (priority in ('low', 'normal', 'high', 'urgent')),
  constraint project_tasks_public_id_format_check
    check (public_id ~ '^TSK-[A-F0-9]{12}$'),
  constraint project_tasks_public_id_key unique (public_id)
);

comment on table public.project_tasks is
  'Project task. Not a deliverable. customer_visible must be true for customer SELECT. Future assignee columns can join on project_id.';

create trigger project_tasks_set_updated_at
  before update on public.project_tasks
  for each row
  execute function public.set_updated_at();

create index project_tasks_project_id_idx on public.project_tasks (project_id);

-- ---------------------------------------------------------------------------
-- project_files
-- ---------------------------------------------------------------------------
create table public.project_files (
  id uuid primary key default gen_random_uuid(),
  public_id text not null default public.random_public_id('FIL-'),
  project_id uuid not null references public.projects (id) on delete restrict,
  uploaded_by_user_id uuid not null references auth.users (id) on delete restrict,
  original_filename text not null,
  storage_bucket text not null default 'project-files',
  storage_path text not null,
  mime_type text not null,
  size_bytes bigint not null,
  visibility text not null,
  confirmed_at timestamptz,
  created_at timestamptz not null default now(),
  constraint project_files_filename_length_check
    check (char_length(original_filename) between 1 and 120),
  constraint project_files_size_check
    check (size_bytes between 1 and 20971520),
  constraint project_files_visibility_check
    check (visibility in ('customer', 'internal')),
  constraint project_files_bucket_check
    check (storage_bucket = 'project-files'),
  constraint project_files_public_id_format_check
    check (public_id ~ '^FIL-[A-F0-9]{12}$'),
  constraint project_files_public_id_key unique (public_id),
  constraint project_files_storage_path_key unique (storage_path)
);

comment on table public.project_files is
  'Project file metadata. Binary objects live in private Storage bucket project-files. A file is not a deliverable.';

create index project_files_project_id_idx on public.project_files (project_id);

-- ---------------------------------------------------------------------------
-- deliverables
-- ---------------------------------------------------------------------------
create table public.deliverables (
  id uuid primary key default gen_random_uuid(),
  public_id text not null default public.random_public_id('DLV-'),
  project_id uuid not null references public.projects (id) on delete restrict,
  title text not null,
  description text,
  status text not null default 'draft',
  version integer not null,
  file_snapshot jsonb not null default '[]'::jsonb,
  change_request_note text,
  submitted_at timestamptz,
  accepted_at timestamptz,
  accepted_by_user_id uuid references auth.users (id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint deliverables_title_length_check
    check (char_length(title) between 1 and 160),
  constraint deliverables_description_length_check
    check (description is null or char_length(description) between 1 and 4000),
  constraint deliverables_status_check
    check (status in ('draft', 'submitted', 'accepted', 'changes_requested', 'superseded')),
  constraint deliverables_version_positive_check
    check (version >= 1),
  constraint deliverables_change_note_length_check
    check (change_request_note is null or char_length(change_request_note) between 1 and 2000),
  constraint deliverables_public_id_format_check
    check (public_id ~ '^DLV-[A-F0-9]{12}$'),
  constraint deliverables_public_id_key unique (public_id),
  constraint deliverables_project_version_key unique (project_id, version)
);

comment on table public.deliverables is
  'Formal customer delivery record. Not a task, file, invoice, or payment. Accepted rows are not silently mutated.';

create trigger deliverables_set_updated_at
  before update on public.deliverables
  for each row
  execute function public.set_updated_at();

create unique index deliverables_one_submitted_per_project_idx
  on public.deliverables (project_id)
  where status = 'submitted';

create index deliverables_project_id_idx on public.deliverables (project_id);

create table public.deliverable_files (
  deliverable_id uuid not null references public.deliverables (id) on delete cascade,
  file_id uuid not null references public.project_files (id) on delete restrict,
  position integer not null,
  constraint deliverable_files_position_check check (position >= 1),
  constraint deliverable_files_pkey primary key (deliverable_id, file_id),
  constraint deliverable_files_position_key unique (deliverable_id, position)
);

comment on table public.deliverable_files is
  'Links a deliverable to existing project_files. Does not duplicate binary objects.';

-- ---------------------------------------------------------------------------
-- conversations / messages
-- ---------------------------------------------------------------------------
create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  public_id text not null default public.random_public_id('CNV-'),
  project_id uuid not null references public.projects (id) on delete restrict,
  status text not null default 'open',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint conversations_status_check
    check (status in ('open', 'closed')),
  constraint conversations_public_id_format_check
    check (public_id ~ '^CNV-[A-F0-9]{12}$'),
  constraint conversations_public_id_key unique (public_id),
  constraint conversations_project_id_key unique (project_id)
);

comment on table public.conversations is
  'One primary V1 conversation per project. Not internal admin notes.';

create trigger conversations_set_updated_at
  before update on public.conversations
  for each row
  execute function public.set_updated_at();

create table public.conversation_messages (
  id uuid primary key default gen_random_uuid(),
  public_id text not null default public.random_public_id('MSG-'),
  conversation_id uuid not null references public.conversations (id) on delete restrict,
  sender_user_id uuid not null references auth.users (id) on delete restrict,
  sender_kind text not null,
  body text not null,
  created_at timestamptz not null default now(),
  constraint conversation_messages_sender_kind_check
    check (sender_kind in ('customer', 'staff')),
  constraint conversation_messages_body_length_check
    check (char_length(body) between 1 and 4000),
  constraint conversation_messages_public_id_format_check
    check (public_id ~ '^MSG-[A-F0-9]{12}$'),
  constraint conversation_messages_public_id_key unique (public_id)
);

comment on table public.conversation_messages is
  'Immutable V1 project messages. sender_kind is assigned from auth, not caller input.';

create index conversation_messages_conversation_id_idx
  on public.conversation_messages (conversation_id, created_at);

-- ---------------------------------------------------------------------------
-- project_activity (workspace timeline, not audit_events)
-- ---------------------------------------------------------------------------
create table public.project_activity (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete restrict,
  event_type text not null,
  actor_user_id uuid references auth.users (id) on delete restrict,
  visibility text not null,
  label text not null,
  created_at timestamptz not null default now(),
  constraint project_activity_visibility_check
    check (visibility in ('customer', 'internal')),
  constraint project_activity_label_length_check
    check (char_length(label) between 1 and 200),
  constraint project_activity_event_type_check
    check (event_type in (
      'project_created',
      'project_status_changed',
      'task_completed',
      'file_uploaded',
      'deliverable_submitted',
      'deliverable_accepted',
      'changes_requested',
      'message_sent'
    ))
);

comment on table public.project_activity is
  'Customer/admin project timeline. Real domain events only. Not public.audit_events.';

create index project_activity_project_id_idx
  on public.project_activity (project_id, created_at desc);

create or replace function public.record_project_activity(
  p_project_id uuid,
  p_event_type text,
  p_visibility text,
  p_label text
)
returns void
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  insert into public.project_activity (
    project_id,
    event_type,
    actor_user_id,
    visibility,
    label
  )
  values (
    p_project_id,
    p_event_type,
    (select auth.uid()),
    p_visibility,
    left(trim(p_label), 200)
  );
end;
$$;

revoke all on function public.record_project_activity(uuid, text, text, text)
  from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- Message identity trigger
-- ---------------------------------------------------------------------------
create or replace function public.conversation_messages_assign_sender()
returns trigger
language plpgsql
security invoker
set search_path = pg_catalog, public
as $$
begin
  if (select auth.uid()) is null then
    raise exception 'not authenticated';
  end if;
  new.sender_user_id := (select auth.uid());
  if public.is_platform_admin() then
    new.sender_kind := 'staff';
  else
    new.sender_kind := 'customer';
  end if;
  new.body := trim(new.body);
  return new;
end;
$$;

create trigger conversation_messages_assign_sender
  before insert on public.conversation_messages
  for each row
  execute function public.conversation_messages_assign_sender();

create or replace function public.conversation_messages_prevent_mutation()
returns trigger
language plpgsql
security invoker
set search_path = pg_catalog, public
as $$
begin
  raise exception 'messages are immutable';
end;
$$;

create trigger conversation_messages_prevent_update
  before update on public.conversation_messages
  for each row
  execute function public.conversation_messages_prevent_mutation();

create trigger conversation_messages_prevent_delete
  before delete on public.conversation_messages
  for each row
  execute function public.conversation_messages_prevent_mutation();

create or replace function public.conversation_messages_after_insert()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  project uuid;
begin
  select conversation.project_id into project
  from public.conversations as conversation
  where conversation.id = new.conversation_id;

  perform public.record_project_activity(
    project,
    'message_sent',
    'customer',
    'Message sent'
  );
  return new;
end;
$$;

create trigger conversation_messages_after_insert
  after insert on public.conversation_messages
  for each row
  execute function public.conversation_messages_after_insert();

-- ---------------------------------------------------------------------------
-- Project insert: conversation + activity
-- ---------------------------------------------------------------------------
create or replace function public.projects_after_insert_workspace()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  insert into public.conversations (project_id)
  values (new.id)
  on conflict (project_id) do nothing;

  perform public.record_project_activity(
    new.id,
    'project_created',
    'customer',
    'Project created'
  );
  return new;
end;
$$;

create trigger projects_after_insert_workspace
  after insert on public.projects
  for each row
  execute function public.projects_after_insert_workspace();

create or replace function public.projects_after_status_change()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  if new.status is distinct from old.status then
    perform public.record_project_activity(
      new.id,
      'project_status_changed',
      'customer',
      'Project status updated'
    );
  end if;
  return new;
end;
$$;

create trigger projects_after_status_change
  after update on public.projects
  for each row
  execute function public.projects_after_status_change();

-- ---------------------------------------------------------------------------
-- Workspace functions
-- ---------------------------------------------------------------------------
create or replace function public.ensure_project_conversation(p_project_id uuid)
returns public.conversations
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  created public.conversations;
begin
  if (select auth.uid()) is null then
    raise exception 'not authenticated';
  end if;
  if not public.can_access_project(p_project_id) then
    raise exception 'not authorized';
  end if;

  insert into public.conversations (project_id)
  values (p_project_id)
  on conflict (project_id) do update
    set project_id = excluded.project_id
  returning * into created;

  return created;
end;
$$;

comment on function public.ensure_project_conversation(uuid) is
  'Idempotent primary conversation for a project. One row per project_id.';

revoke all on function public.ensure_project_conversation(uuid) from public, anon;
grant execute on function public.ensure_project_conversation(uuid) to authenticated;

create or replace function public.admin_create_project_task(
  p_project_id uuid,
  p_title text,
  p_description text,
  p_status text,
  p_priority text,
  p_due_at timestamptz,
  p_customer_visible boolean
)
returns public.project_tasks
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  actor uuid;
  created public.project_tasks;
  title_text text;
  desc_text text;
begin
  actor := public.assert_platform_admin();
  if not exists (select 1 from public.projects where id = p_project_id) then
    raise exception 'project not found';
  end if;

  title_text := left(trim(coalesce(p_title, '')), 160);
  desc_text := nullif(left(trim(coalesce(p_description, '')), 4000), '');
  if title_text = '' then
    raise exception 'invalid task';
  end if;
  if p_status not in ('todo', 'in_progress', 'blocked', 'completed', 'cancelled') then
    raise exception 'invalid task status';
  end if;
  if p_priority not in ('low', 'normal', 'high', 'urgent') then
    raise exception 'invalid task priority';
  end if;

  insert into public.project_tasks (
    project_id,
    title,
    description,
    status,
    priority,
    due_at,
    completed_at,
    customer_visible,
    created_by_user_id
  )
  values (
    p_project_id,
    title_text,
    desc_text,
    p_status,
    p_priority,
    p_due_at,
    case when p_status = 'completed' then now() else null end,
    coalesce(p_customer_visible, false),
    actor
  )
  returning * into created;

  if created.status = 'completed' then
    perform public.record_project_activity(
      p_project_id,
      'task_completed',
      case when created.customer_visible then 'customer' else 'internal' end,
      'Task completed'
    );
  end if;

  return created;
end;
$$;

revoke all on function public.admin_create_project_task(uuid, text, text, text, text, timestamptz, boolean)
  from public, anon;
grant execute on function public.admin_create_project_task(uuid, text, text, text, text, timestamptz, boolean)
  to authenticated;

create or replace function public.admin_update_project_task(
  p_task_id uuid,
  p_title text,
  p_description text,
  p_status text,
  p_priority text,
  p_due_at timestamptz,
  p_customer_visible boolean
)
returns public.project_tasks
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  current public.project_tasks;
  title_text text;
  desc_text text;
  previous_status text;
begin
  perform public.assert_platform_admin();

  select * into current from public.project_tasks where id = p_task_id for update;
  if current.id is null then
    raise exception 'task not found';
  end if;
  previous_status := current.status;

  title_text := left(trim(coalesce(p_title, current.title)), 160);
  desc_text := nullif(left(trim(coalesce(p_description, '')), 4000), '');
  if title_text = '' then
    raise exception 'invalid task';
  end if;
  if p_status not in ('todo', 'in_progress', 'blocked', 'completed', 'cancelled') then
    raise exception 'invalid task status';
  end if;
  if p_priority not in ('low', 'normal', 'high', 'urgent') then
    raise exception 'invalid task priority';
  end if;

  update public.project_tasks
  set
    title = title_text,
    description = desc_text,
    status = p_status,
    priority = p_priority,
    due_at = p_due_at,
    completed_at = case
      when p_status = 'completed' then coalesce(current.completed_at, now())
      else null
    end,
    customer_visible = coalesce(p_customer_visible, false)
  where id = current.id
  returning * into current;

  if p_status = 'completed' and previous_status is distinct from 'completed' then
    perform public.record_project_activity(
      current.project_id,
      'task_completed',
      case when current.customer_visible then 'customer' else 'internal' end,
      'Task completed'
    );
  end if;

  return current;
end;
$$;

revoke all on function public.admin_update_project_task(uuid, text, text, text, text, timestamptz, boolean)
  from public, anon;
grant execute on function public.admin_update_project_task(uuid, text, text, text, text, timestamptz, boolean)
  to authenticated;

create or replace function public.register_project_file(
  p_project_id uuid,
  p_original_filename text,
  p_claimed_mime text,
  p_size_bytes bigint,
  p_visibility text
)
returns public.project_files
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  actor uuid;
  visibility text;
  filename text;
  mime text;
  file_id uuid;
  created public.project_files;
begin
  actor := (select auth.uid());
  if actor is null then
    raise exception 'not authenticated';
  end if;
  if not exists (select 1 from public.projects where id = p_project_id) then
    raise exception 'project not found';
  end if;

  if public.is_platform_admin() then
    visibility := coalesce(nullif(p_visibility, ''), 'internal');
  else
    if not public.is_project_customer(p_project_id) then
      raise exception 'not authorized';
    end if;
    visibility := 'customer';
  end if;

  if visibility not in ('customer', 'internal') then
    raise exception 'invalid visibility';
  end if;
  if p_size_bytes is null or p_size_bytes < 1 or p_size_bytes > 20971520 then
    raise exception 'invalid file size';
  end if;

  filename := public.normalize_upload_filename(p_original_filename);
  mime := public.canonical_upload_mime(filename);
  if mime is null then
    raise exception 'unsupported file type';
  end if;
  if p_claimed_mime is not null
     and trim(p_claimed_mime) <> ''
     and lower(trim(p_claimed_mime)) is distinct from mime
     and lower(trim(p_claimed_mime)) is distinct from 'application/octet-stream' then
    raise exception 'unsupported file type';
  end if;

  file_id := gen_random_uuid();
  insert into public.project_files (
    id,
    project_id,
    uploaded_by_user_id,
    original_filename,
    storage_bucket,
    storage_path,
    mime_type,
    size_bytes,
    visibility
  )
  values (
    file_id,
    p_project_id,
    actor,
    filename,
    'project-files',
    visibility || '/' || p_project_id::text || '/' || file_id::text || '/' || filename,
    mime,
    p_size_bytes,
    visibility
  )
  returning * into created;

  return created;
end;
$$;

revoke all on function public.register_project_file(uuid, text, text, bigint, text)
  from public, anon;
grant execute on function public.register_project_file(uuid, text, text, bigint, text)
  to authenticated;

create or replace function public.confirm_project_file_upload(p_file_id uuid)
returns public.project_files
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  actor uuid;
  current public.project_files;
begin
  actor := (select auth.uid());
  if actor is null then
    raise exception 'not authenticated';
  end if;

  select * into current from public.project_files where id = p_file_id for update;
  if current.id is null then
    raise exception 'file not found';
  end if;

  if not public.is_platform_admin() then
    if current.uploaded_by_user_id is distinct from actor
       or not public.is_project_customer(current.project_id) then
      raise exception 'not authorized';
    end if;
  end if;

  if current.confirmed_at is not null then
    return current;
  end if;

  if not exists (
    select 1
    from storage.objects as object
    where object.bucket_id = current.storage_bucket
      and object.name = current.storage_path
  ) then
    raise exception 'upload not found';
  end if;

  update public.project_files
  set confirmed_at = now()
  where id = current.id
  returning * into current;

  perform public.record_project_activity(
    current.project_id,
    'file_uploaded',
    case when current.visibility = 'customer' then 'customer' else 'internal' end,
    'File uploaded'
  );

  return current;
end;
$$;

revoke all on function public.confirm_project_file_upload(uuid) from public, anon;
grant execute on function public.confirm_project_file_upload(uuid) to authenticated;

create or replace function public.admin_create_deliverable(
  p_project_id uuid,
  p_title text,
  p_description text
)
returns public.deliverables
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  created public.deliverables;
  next_version integer;
  title_text text;
  desc_text text;
begin
  perform public.assert_platform_admin();
  if not exists (select 1 from public.projects where id = p_project_id) then
    raise exception 'project not found';
  end if;
  title_text := left(trim(coalesce(p_title, '')), 160);
  desc_text := nullif(left(trim(coalesce(p_description, '')), 4000), '');
  if title_text = '' then
    raise exception 'invalid deliverable';
  end if;

  select coalesce(max(version), 0) + 1 into next_version
  from public.deliverables
  where project_id = p_project_id;

  insert into public.deliverables (
    project_id,
    title,
    description,
    status,
    version
  )
  values (
    p_project_id,
    title_text,
    desc_text,
    'draft',
    next_version
  )
  returning * into created;

  return created;
end;
$$;

revoke all on function public.admin_create_deliverable(uuid, text, text) from public, anon;
grant execute on function public.admin_create_deliverable(uuid, text, text) to authenticated;

create or replace function public.admin_set_deliverable_files(
  p_deliverable_id uuid,
  p_file_ids uuid[]
)
returns public.deliverables
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  current public.deliverables;
  file_id uuid;
  pos integer := 0;
begin
  perform public.assert_platform_admin();
  select * into current from public.deliverables where id = p_deliverable_id for update;
  if current.id is null then
    raise exception 'deliverable not found';
  end if;
  if current.status <> 'draft' then
    raise exception 'deliverable files are frozen';
  end if;

  delete from public.deliverable_files where deliverable_id = current.id;

  if p_file_ids is not null then
    foreach file_id in array p_file_ids
    loop
      if not exists (
        select 1
        from public.project_files as project_file
        where project_file.id = file_id
          and project_file.project_id = current.project_id
          and project_file.confirmed_at is not null
          and project_file.visibility = 'customer'
      ) then
        raise exception 'invalid deliverable file';
      end if;
      pos := pos + 1;
      insert into public.deliverable_files (deliverable_id, file_id, position)
      values (current.id, file_id, pos);
    end loop;
  end if;

  return current;
end;
$$;

revoke all on function public.admin_set_deliverable_files(uuid, uuid[]) from public, anon;
grant execute on function public.admin_set_deliverable_files(uuid, uuid[]) to authenticated;

create or replace function public.admin_submit_deliverable(p_deliverable_id uuid)
returns public.deliverables
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  current public.deliverables;
  snapshot jsonb;
begin
  perform public.assert_platform_admin();
  select * into current from public.deliverables where id = p_deliverable_id for update;
  if current.id is null then
    raise exception 'deliverable not found';
  end if;
  if current.status <> 'draft' then
    raise exception 'deliverable cannot be submitted';
  end if;

  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'public_id', project_file.public_id,
        'filename', project_file.original_filename,
        'mime_type', project_file.mime_type,
        'size_bytes', project_file.size_bytes
      )
      order by link.position
    ),
    '[]'::jsonb
  )
  into snapshot
  from public.deliverable_files as link
  join public.project_files as project_file on project_file.id = link.file_id
  where link.deliverable_id = current.id;

  update public.deliverables
  set status = 'superseded'
  where project_id = current.project_id
    and id <> current.id
    and status in ('submitted', 'changes_requested');

  update public.deliverables
  set
    status = 'submitted',
    submitted_at = now(),
    file_snapshot = snapshot
  where id = current.id
  returning * into current;

  perform public.record_project_activity(
    current.project_id,
    'deliverable_submitted',
    'customer',
    'Deliverable submitted'
  );

  return current;
end;
$$;

revoke all on function public.admin_submit_deliverable(uuid) from public, anon;
grant execute on function public.admin_submit_deliverable(uuid) to authenticated;

create or replace function public.accept_deliverable(p_deliverable_id uuid)
returns public.deliverables
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  actor uuid;
  current public.deliverables;
begin
  actor := (select auth.uid());
  if actor is null then
    raise exception 'not authenticated';
  end if;
  if public.is_platform_admin() then
    raise exception 'not authorized';
  end if;

  select * into current from public.deliverables where id = p_deliverable_id for update;
  if current.id is null then
    raise exception 'deliverable not found';
  end if;
  if not public.is_project_customer(current.project_id) then
    raise exception 'not authorized';
  end if;

  if current.status = 'accepted' then
    return current;
  end if;
  if current.status <> 'submitted' then
    raise exception 'deliverable cannot be accepted';
  end if;

  update public.deliverables
  set
    status = 'accepted',
    accepted_at = now(),
    accepted_by_user_id = actor
  where id = current.id
  returning * into current;

  perform public.record_project_activity(
    current.project_id,
    'deliverable_accepted',
    'customer',
    'Deliverable accepted'
  );

  return current;
end;
$$;

revoke all on function public.accept_deliverable(uuid) from public, anon;
grant execute on function public.accept_deliverable(uuid) to authenticated;

create or replace function public.request_deliverable_changes(
  p_deliverable_id uuid,
  p_note text
)
returns public.deliverables
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  actor uuid;
  current public.deliverables;
  note text;
  conversation uuid;
begin
  actor := (select auth.uid());
  if actor is null then
    raise exception 'not authenticated';
  end if;
  if public.is_platform_admin() then
    raise exception 'not authorized';
  end if;

  note := left(trim(coalesce(p_note, '')), 2000);
  if note = '' then
    raise exception 'change request note required';
  end if;

  select * into current from public.deliverables where id = p_deliverable_id for update;
  if current.id is null then
    raise exception 'deliverable not found';
  end if;
  if not public.is_project_customer(current.project_id) then
    raise exception 'not authorized';
  end if;
  if current.status <> 'submitted' then
    raise exception 'deliverable cannot request changes';
  end if;

  update public.deliverables
  set
    status = 'changes_requested',
    change_request_note = note
  where id = current.id
  returning * into current;

  perform public.ensure_project_conversation(current.project_id);
  select id into conversation from public.conversations where project_id = current.project_id;
  insert into public.conversation_messages (conversation_id, body)
  values (conversation, 'Requested changes: ' || note);

  perform public.record_project_activity(
    current.project_id,
    'changes_requested',
    'customer',
    'Changes requested'
  );

  return current;
end;
$$;

revoke all on function public.request_deliverable_changes(uuid, text) from public, anon;
grant execute on function public.request_deliverable_changes(uuid, text) to authenticated;

-- ---------------------------------------------------------------------------
-- Storage bucket (private)
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'project-files',
  'project-files',
  false,
  20971520,
  array[
    'application/pdf',
    'image/png',
    'image/jpeg',
    'image/webp',
    'text/plain',
    'text/csv',
    'application/zip',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]
)
on conflict (id) do nothing;

create or replace function public.storage_project_id(p_object_name text)
returns uuid
language plpgsql
stable
set search_path = pg_catalog, public, storage
as $$
declare
  folder text;
begin
  folder := (storage.foldername(p_object_name))[2];
  begin
    return folder::uuid;
  exception when others then
    return null;
  end;
end;
$$;

revoke all on function public.storage_project_id(text) from public, anon;
grant execute on function public.storage_project_id(text) to authenticated;

create policy project_files_storage_select
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'project-files'
    and (
      public.is_platform_admin()
      or (
        (storage.foldername(name))[1] = 'customer'
        and public.can_access_project(public.storage_project_id(name))
      )
    )
  );

create policy project_files_storage_insert
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'project-files'
    and (
      public.is_platform_admin()
      or (
        (storage.foldername(name))[1] = 'customer'
        and public.is_project_customer(public.storage_project_id(name))
      )
    )
  );

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.project_tasks enable row level security;
alter table public.project_tasks force row level security;
alter table public.project_files enable row level security;
alter table public.project_files force row level security;
alter table public.deliverables enable row level security;
alter table public.deliverables force row level security;
alter table public.deliverable_files enable row level security;
alter table public.deliverable_files force row level security;
alter table public.conversations enable row level security;
alter table public.conversations force row level security;
alter table public.conversation_messages enable row level security;
alter table public.conversation_messages force row level security;
alter table public.project_activity enable row level security;
alter table public.project_activity force row level security;

revoke all on table public.project_tasks from public, anon, authenticated;
revoke all on table public.project_files from public, anon, authenticated;
revoke all on table public.deliverables from public, anon, authenticated;
revoke all on table public.deliverable_files from public, anon, authenticated;
revoke all on table public.conversations from public, anon, authenticated;
revoke all on table public.conversation_messages from public, anon, authenticated;
revoke all on table public.project_activity from public, anon, authenticated;

grant select on table public.project_tasks to authenticated;
grant select on table public.project_files to authenticated;
grant select on table public.deliverables to authenticated;
grant select on table public.deliverable_files to authenticated;
grant select on table public.conversations to authenticated;
grant select, insert on table public.conversation_messages to authenticated;
grant select on table public.project_activity to authenticated;

create policy project_tasks_select_related
  on public.project_tasks
  for select
  to authenticated
  using (
    public.can_access_project(project_id)
    and (public.is_platform_admin() or customer_visible)
  );

create policy project_files_select_related
  on public.project_files
  for select
  to authenticated
  using (
    confirmed_at is not null
    and public.can_access_project(project_id)
    and (public.is_platform_admin() or visibility = 'customer')
  );

create policy deliverables_select_related
  on public.deliverables
  for select
  to authenticated
  using (
    public.can_access_project(project_id)
    and (public.is_platform_admin() or status <> 'draft')
  );

create policy deliverable_files_select_related
  on public.deliverable_files
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.deliverables as deliverable
      where deliverable.id = deliverable_files.deliverable_id
    )
  );

create policy conversations_select_related
  on public.conversations
  for select
  to authenticated
  using (public.can_access_project(project_id));

create policy conversation_messages_select_related
  on public.conversation_messages
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.conversations as conversation
      where conversation.id = conversation_messages.conversation_id
        and public.can_access_project(conversation.project_id)
    )
  );

create policy conversation_messages_insert_related
  on public.conversation_messages
  for insert
  to authenticated
  with check (
    sender_user_id = (select auth.uid())
    and exists (
      select 1
      from public.conversations as conversation
      where conversation.id = conversation_messages.conversation_id
        and conversation.status = 'open'
        and (
          public.is_platform_admin()
          or public.is_project_customer(conversation.project_id)
        )
    )
  );

create policy project_activity_select_related
  on public.project_activity
  for select
  to authenticated
  using (
    public.can_access_project(project_id)
    and (public.is_platform_admin() or visibility = 'customer')
  );

-- Existing projects get a primary conversation.
insert into public.conversations (project_id)
select project.id
from public.projects as project
on conflict (project_id) do nothing;
