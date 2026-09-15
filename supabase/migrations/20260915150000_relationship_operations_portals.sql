-- Flash One relationship and operations portals.
-- Identity remains separate from business relationships.
-- Not invoices, payments, or a public developer marketplace.

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------
create or replace function public.is_organization_member(p_organization_id uuid)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select coalesce(
    p_organization_id is not null
    and (select auth.uid()) is not null
    and exists (
      select 1
      from public.organization_memberships as membership
      where membership.organization_id = p_organization_id
        and membership.user_id = (select auth.uid())
    ),
    false
  );
$$;

revoke all on function public.is_organization_member(uuid) from public, anon;
grant execute on function public.is_organization_member(uuid) to authenticated;

create or replace function public.is_organization_owner(p_organization_id uuid)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select coalesce(
    p_organization_id is not null
    and (select auth.uid()) is not null
    and exists (
      select 1
      from public.organization_memberships as membership
      where membership.organization_id = p_organization_id
        and membership.user_id = (select auth.uid())
        and membership.role = 'owner'
    ),
    false
  );
$$;

revoke all on function public.is_organization_owner(uuid) from public, anon;
grant execute on function public.is_organization_owner(uuid) to authenticated;

create or replace function public.is_safe_https_url(p_url text)
returns boolean
language sql
immutable
set search_path = pg_catalog, public
as $$
  select
    p_url is not null
    and char_length(p_url) between 12 and 300
    and lower(p_url) like 'https://%'
    and lower(p_url) not like 'javascript:%'
    and lower(p_url) not like 'data:%'
    and p_url !~* '[[:space:]]';
$$;

revoke all on function public.is_safe_https_url(text) from public, anon;
grant execute on function public.is_safe_https_url(text) to authenticated;

-- ---------------------------------------------------------------------------
-- Individual public IDs
-- ---------------------------------------------------------------------------
alter table public.individual_accounts
  add column if not exists public_id text;

update public.individual_accounts
set public_id = public.random_public_id('CUS-')
where public_id is null;

alter table public.individual_accounts
  alter column public_id set default public.random_public_id('CUS-'),
  alter column public_id set not null;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'individual_accounts_public_id_format_check'
  ) then
    alter table public.individual_accounts
      add constraint individual_accounts_public_id_format_check
        check (public_id ~ '^CUS-[A-F0-9]{12}$');
  end if;
  if not exists (
    select 1 from pg_constraint where conname = 'individual_accounts_public_id_key'
  ) then
    alter table public.individual_accounts
      add constraint individual_accounts_public_id_key unique (public_id);
  end if;
end
$$;

comment on column public.individual_accounts.public_id is
  'Public customer relationship identifier. Not an auth user UUID. Future offline CRM records can exist without auth.users.';

-- ---------------------------------------------------------------------------
-- Organization optional profile fields
-- ---------------------------------------------------------------------------
alter table public.organizations
  add column if not exists website text,
  add column if not exists country text,
  add column if not exists description text;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'organizations_website_check'
  ) then
    alter table public.organizations
      add constraint organizations_website_check
        check (website is null or public.is_safe_https_url(website));
  end if;
  if not exists (
    select 1 from pg_constraint where conname = 'organizations_country_length_check'
  ) then
    alter table public.organizations
      add constraint organizations_country_length_check
        check (country is null or char_length(country) between 2 and 80);
  end if;
  if not exists (
    select 1 from pg_constraint where conname = 'organizations_description_length_check'
  ) then
    alter table public.organizations
      add constraint organizations_description_length_check
        check (description is null or char_length(description) between 1 and 1000);
  end if;
end
$$;

grant update (name, website, country, description) on table public.organizations to authenticated;

-- ---------------------------------------------------------------------------
-- Developer profile extras
-- ---------------------------------------------------------------------------
alter table public.developer_profiles
  add column if not exists country text,
  add column if not exists timezone text;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'developer_profiles_country_length_check'
  ) then
    alter table public.developer_profiles
      add constraint developer_profiles_country_length_check
        check (country is null or char_length(country) between 2 and 80);
  end if;
  if not exists (
    select 1 from pg_constraint where conname = 'developer_profiles_timezone_length_check'
  ) then
    alter table public.developer_profiles
      add constraint developer_profiles_timezone_length_check
        check (timezone is null or char_length(timezone) between 2 and 80);
  end if;
end
$$;

grant update (display_name, headline, bio, availability_status, country, timezone)
  on table public.developer_profiles to authenticated;

create table if not exists public.developer_skills (
  id uuid primary key default gen_random_uuid(),
  developer_user_id uuid not null references public.developer_profiles (user_id) on delete cascade,
  skill text not null,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  constraint developer_skills_skill_length_check
    check (char_length(skill) between 1 and 40)
);

create unique index if not exists developer_skills_user_skill_key
  on public.developer_skills (developer_user_id, lower(skill));

create table if not exists public.developer_links (
  id uuid primary key default gen_random_uuid(),
  developer_user_id uuid not null references public.developer_profiles (user_id) on delete cascade,
  label text not null,
  url text not null,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  constraint developer_links_label_length_check
    check (char_length(label) between 1 and 80),
  constraint developer_links_url_check
    check (public.is_safe_https_url(url))
);

comment on table public.developer_skills is
  'Per-developer skill labels. Not a global marketplace taxonomy.';
comment on table public.developer_links is
  'https portfolio links only. No HTML embeds.';

-- ---------------------------------------------------------------------------
-- Organization invitations
-- ---------------------------------------------------------------------------
create table if not exists public.organization_invitations (
  id uuid primary key default gen_random_uuid(),
  public_id text not null default public.random_public_id('INV-'),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  invited_email text not null,
  role text not null default 'member',
  token_hash bytea not null,
  status text not null default 'pending',
  expires_at timestamptz not null,
  accepted_at timestamptz,
  accepted_by_user_id uuid references auth.users (id) on delete restrict,
  revoked_at timestamptz,
  created_by_user_id uuid not null references auth.users (id) on delete restrict,
  created_at timestamptz not null default now(),
  constraint organization_invitations_email_length_check
    check (char_length(invited_email) between 3 and 254),
  constraint organization_invitations_role_check
    check (role = 'member'),
  constraint organization_invitations_status_check
    check (status in ('pending', 'accepted', 'revoked', 'expired')),
  constraint organization_invitations_public_id_format_check
    check (public_id ~ '^INV-[A-F0-9]{12}$'),
  constraint organization_invitations_public_id_key unique (public_id),
  constraint organization_invitations_token_hash_key unique (token_hash)
);

create index if not exists organization_invitations_organization_id_idx
  on public.organization_invitations (organization_id, created_at desc);

comment on table public.organization_invitations is
  'Hashed invite tokens. Email delivery is deferred. Raw tokens are never stored.';

-- ---------------------------------------------------------------------------
-- Project developer assignments
-- ---------------------------------------------------------------------------
create table if not exists public.project_developer_assignments (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete restrict,
  developer_user_id uuid not null references public.developer_profiles (user_id) on delete restrict,
  assignment_role text not null default 'developer',
  status text not null default 'active',
  assigned_at timestamptz not null default now(),
  unassigned_at timestamptz,
  assigned_by_user_id uuid not null references auth.users (id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint project_developer_assignments_role_check
    check (assignment_role = 'developer'),
  constraint project_developer_assignments_status_check
    check (status in ('active', 'ended'))
);

create trigger project_developer_assignments_set_updated_at
  before update on public.project_developer_assignments
  for each row
  execute function public.set_updated_at();

create unique index if not exists project_developer_assignments_active_key
  on public.project_developer_assignments (project_id, developer_user_id)
  where status = 'active';

create index if not exists project_developer_assignments_developer_idx
  on public.project_developer_assignments (developer_user_id, status);

comment on table public.project_developer_assignments is
  'Admin-only developer assignment. Employees/freelancers/partners can join later on project_id.';

-- Recreate assigned-developer helper now that the table exists.
create or replace function public.is_assigned_project_developer(p_project_id uuid)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select coalesce(
    p_project_id is not null
    and (select auth.uid()) is not null
    and exists (
      select 1
      from public.project_developer_assignments as assignment
      where assignment.project_id = p_project_id
        and assignment.developer_user_id = (select auth.uid())
        and assignment.status = 'active'
    ),
    false
  );
$$;

-- ---------------------------------------------------------------------------
-- File visibility: project_team
-- ---------------------------------------------------------------------------
alter table public.project_files
  drop constraint if exists project_files_visibility_check;

alter table public.project_files
  add constraint project_files_visibility_check
    check (visibility in ('customer', 'project_team', 'internal'));

-- ---------------------------------------------------------------------------
-- Conversation sender: developer
-- ---------------------------------------------------------------------------
alter table public.conversation_messages
  drop constraint if exists conversation_messages_sender_kind_check;

alter table public.conversation_messages
  add constraint conversation_messages_sender_kind_check
    check (sender_kind in ('customer', 'staff', 'developer'));

create or replace function public.conversation_messages_assign_sender()
returns trigger
language plpgsql
security invoker
set search_path = pg_catalog, public
as $$
declare
  project uuid;
begin
  if (select auth.uid()) is null then
    raise exception 'not authenticated';
  end if;
  new.sender_user_id := (select auth.uid());
  select conversation.project_id into project
  from public.conversations as conversation
  where conversation.id = new.conversation_id;
  if public.is_platform_admin() then
    new.sender_kind := 'staff';
  elsif public.is_project_customer(project) then
    new.sender_kind := 'customer';
  elsif public.is_assigned_project_developer(project) then
    new.sender_kind := 'developer';
  else
    raise exception 'not authorized';
  end if;
  new.body := trim(new.body);
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Workspace function updates
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
  if not (
    public.can_access_project(p_project_id)
    or public.is_assigned_project_developer(p_project_id)
  ) then
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
  elsif public.is_project_customer(p_project_id) then
    visibility := 'customer';
  elsif public.is_assigned_project_developer(p_project_id) then
    visibility := 'project_team';
  else
    raise exception 'not authorized';
  end if;

  if visibility not in ('customer', 'project_team', 'internal') then
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
    if current.uploaded_by_user_id is distinct from actor then
      raise exception 'not authorized';
    end if;
    if not (
      public.is_project_customer(current.project_id)
      or public.is_assigned_project_developer(current.project_id)
    ) then
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
    case
      when current.visibility = 'customer' then 'customer'
      else 'internal'
    end,
    'File uploaded'
  );

  return current;
end;
$$;

-- ---------------------------------------------------------------------------
-- Invitation / membership / assignment functions
-- ---------------------------------------------------------------------------
create or replace function public.create_organization_invitation(
  p_organization_id uuid,
  p_email text
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  actor uuid;
  email text;
  raw_token text;
  created public.organization_invitations;
begin
  actor := (select auth.uid());
  if actor is null then
    raise exception 'not authenticated';
  end if;
  if not public.is_organization_owner(p_organization_id) then
    raise exception 'not authorized';
  end if;

  email := lower(trim(coalesce(p_email, '')));
  if email !~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$' then
    raise exception 'invalid email';
  end if;

  raw_token := encode(gen_random_bytes(32), 'hex');
  insert into public.organization_invitations (
    organization_id,
    invited_email,
    role,
    token_hash,
    expires_at,
    created_by_user_id
  )
  values (
    p_organization_id,
    email,
    'member',
    digest(convert_to(raw_token, 'UTF8'), 'sha256'),
    now() + interval '7 days',
    actor
  )
  returning * into created;

  return jsonb_build_object(
    'public_id', created.public_id,
    'token', raw_token,
    'expires_at', created.expires_at
  );
end;
$$;

revoke all on function public.create_organization_invitation(uuid, text) from public, anon;
grant execute on function public.create_organization_invitation(uuid, text) to authenticated;

create or replace function public.revoke_organization_invitation(p_invitation_id uuid)
returns public.organization_invitations
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  current public.organization_invitations;
begin
  if (select auth.uid()) is null then
    raise exception 'not authenticated';
  end if;

  select * into current from public.organization_invitations where id = p_invitation_id for update;
  if current.id is null then
    raise exception 'invitation not found';
  end if;
  if not public.is_organization_owner(current.organization_id) then
    raise exception 'not authorized';
  end if;
  if current.status <> 'pending' then
    return current;
  end if;

  update public.organization_invitations
  set status = 'revoked', revoked_at = now()
  where id = current.id
  returning * into current;

  return current;
end;
$$;

revoke all on function public.revoke_organization_invitation(uuid) from public, anon;
grant execute on function public.revoke_organization_invitation(uuid) to authenticated;

create or replace function public.accept_organization_invitation(p_token text)
returns public.organization_memberships
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  actor uuid;
  actor_email text;
  hashed bytea;
  current public.organization_invitations;
  membership public.organization_memberships;
begin
  actor := (select auth.uid());
  if actor is null then
    raise exception 'not authenticated';
  end if;
  if p_token is null or char_length(p_token) < 32 then
    raise exception 'invalid invitation';
  end if;

  select email into actor_email from auth.users where id = actor;
  hashed := digest(convert_to(p_token, 'UTF8'), 'sha256');

  select * into current
  from public.organization_invitations
  where token_hash = hashed
  for update;

  if current.id is null then
    raise exception 'invalid invitation';
  end if;
  if current.status = 'revoked' then
    raise exception 'invitation revoked';
  end if;
  if current.expires_at <= now() then
    update public.organization_invitations
    set status = 'expired'
    where id = current.id and status = 'pending';
    raise exception 'invitation expired';
  end if;
  if lower(trim(coalesce(actor_email, ''))) is distinct from current.invited_email then
    raise exception 'not authorized';
  end if;

  if current.status = 'accepted' then
    select * into membership
    from public.organization_memberships
    where organization_id = current.organization_id
      and user_id = actor;
    if membership.id is not null then
      return membership;
    end if;
    raise exception 'not authorized';
  end if;
  if current.status <> 'pending' then
    raise exception 'invitation cannot be accepted';
  end if;

  insert into public.organization_memberships (organization_id, user_id, role)
  values (current.organization_id, actor, 'member')
  on conflict (organization_id, user_id) do update
    set role = public.organization_memberships.role
  returning * into membership;

  update public.organization_invitations
  set
    status = 'accepted',
    accepted_at = now(),
    accepted_by_user_id = actor
  where id = current.id;

  return membership;
end;
$$;

revoke all on function public.accept_organization_invitation(text) from public, anon;
grant execute on function public.accept_organization_invitation(text) to authenticated;

create or replace function public.remove_organization_member(
  p_organization_id uuid,
  p_user_id uuid
)
returns void
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  current_role text;
begin
  if (select auth.uid()) is null then
    raise exception 'not authenticated';
  end if;
  if not public.is_organization_owner(p_organization_id) then
    raise exception 'not authorized';
  end if;
  if p_user_id = (select auth.uid()) then
    raise exception 'cannot remove self';
  end if;

  select role into current_role
  from public.organization_memberships
  where organization_id = p_organization_id
    and user_id = p_user_id
  for update;

  if current_role is null then
    return;
  end if;
  if current_role <> 'member' then
    raise exception 'cannot remove owner';
  end if;

  delete from public.organization_memberships
  where organization_id = p_organization_id
    and user_id = p_user_id
    and role = 'member';
end;
$$;

revoke all on function public.remove_organization_member(uuid, uuid) from public, anon;
grant execute on function public.remove_organization_member(uuid, uuid) to authenticated;

create or replace function public.admin_assign_project_developer(
  p_project_id uuid,
  p_developer_user_id uuid
)
returns public.project_developer_assignments
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  actor uuid;
  created public.project_developer_assignments;
begin
  actor := public.assert_platform_admin();
  if not exists (select 1 from public.projects where id = p_project_id) then
    raise exception 'project not found';
  end if;
  if not exists (
    select 1 from public.developer_profiles where user_id = p_developer_user_id
  ) then
    raise exception 'developer not found';
  end if;

  select * into created
  from public.project_developer_assignments
  where project_id = p_project_id
    and developer_user_id = p_developer_user_id
    and status = 'active'
  for update;

  if created.id is not null then
    return created;
  end if;

  insert into public.project_developer_assignments (
    project_id,
    developer_user_id,
    assignment_role,
    status,
    assigned_by_user_id
  )
  values (p_project_id, p_developer_user_id, 'developer', 'active', actor)
  returning * into created;

  return created;
end;
$$;

revoke all on function public.admin_assign_project_developer(uuid, uuid) from public, anon;
grant execute on function public.admin_assign_project_developer(uuid, uuid) to authenticated;

create or replace function public.admin_unassign_project_developer(
  p_project_id uuid,
  p_developer_user_id uuid
)
returns public.project_developer_assignments
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  current public.project_developer_assignments;
begin
  perform public.assert_platform_admin();

  select * into current
  from public.project_developer_assignments
  where project_id = p_project_id
    and developer_user_id = p_developer_user_id
    and status = 'active'
  for update;

  if current.id is null then
    select * into current
    from public.project_developer_assignments
    where project_id = p_project_id
      and developer_user_id = p_developer_user_id
    order by created_at desc
    limit 1;
    if current.id is null then
      raise exception 'assignment not found';
    end if;
    return current;
  end if;

  update public.project_developer_assignments
  set status = 'ended', unassigned_at = now()
  where id = current.id
  returning * into current;

  return current;
end;
$$;

revoke all on function public.admin_unassign_project_developer(uuid, uuid) from public, anon;
grant execute on function public.admin_unassign_project_developer(uuid, uuid) to authenticated;

create or replace function public.update_developer_profile(
  p_display_name text,
  p_headline text,
  p_bio text,
  p_availability_status text,
  p_country text,
  p_timezone text,
  p_skills text[],
  p_links jsonb
)
returns public.developer_profiles
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  actor uuid;
  current public.developer_profiles;
  skill text;
  skill_pos integer := 0;
  link jsonb;
  link_pos integer := 0;
begin
  actor := (select auth.uid());
  if actor is null then
    raise exception 'not authenticated';
  end if;

  select * into current from public.developer_profiles where user_id = actor for update;
  if current.user_id is null then
    raise exception 'developer profile not found';
  end if;

  if coalesce(array_length(p_skills, 1), 0) > 24 then
    raise exception 'too many skills';
  end if;
  if coalesce(jsonb_array_length(coalesce(p_links, '[]'::jsonb)), 0) > 8 then
    raise exception 'too many links';
  end if;

  update public.developer_profiles
  set
    display_name = left(trim(coalesce(p_display_name, '')), 120),
    headline = nullif(left(trim(coalesce(p_headline, '')), 160), ''),
    bio = nullif(left(trim(coalesce(p_bio, '')), 1000), ''),
    availability_status = p_availability_status,
    country = nullif(left(trim(coalesce(p_country, '')), 80), ''),
    timezone = nullif(left(trim(coalesce(p_timezone, '')), 80), '')
  where user_id = actor
  returning * into current;

  delete from public.developer_skills where developer_user_id = actor;
  if p_skills is not null then
    foreach skill in array p_skills
    loop
      skill := left(trim(skill), 40);
      if skill = '' then
        continue;
      end if;
      if exists (
        select 1
        from public.developer_skills as existing
        where existing.developer_user_id = actor
          and lower(existing.skill) = lower(skill)
      ) then
        continue;
      end if;
      skill_pos := skill_pos + 1;
      insert into public.developer_skills (developer_user_id, skill, position)
      values (actor, skill, skill_pos);
    end loop;
  end if;

  delete from public.developer_links where developer_user_id = actor;
  if p_links is not null then
    for link in select value from jsonb_array_elements(p_links)
    loop
      if coalesce(link->>'url', '') = '' then
        continue;
      end if;
      if not public.is_safe_https_url(link->>'url') then
        raise exception 'invalid url';
      end if;
      link_pos := link_pos + 1;
      insert into public.developer_links (
        developer_user_id,
        label,
        url,
        position
      )
      values (
        actor,
        left(trim(coalesce(link->>'label', 'Link')), 80),
        link->>'url',
        link_pos
      );
    end loop;
  end if;

  return current;
end;
$$;

revoke all on function public.update_developer_profile(text, text, text, text, text, text, text[], jsonb)
  from public, anon;
grant execute on function public.update_developer_profile(text, text, text, text, text, text, text[], jsonb)
  to authenticated;

revoke all on function public.is_assigned_project_developer(uuid) from public, anon;
grant execute on function public.is_assigned_project_developer(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- Storage policies
-- ---------------------------------------------------------------------------
drop policy if exists project_files_storage_select on storage.objects;
drop policy if exists project_files_storage_insert on storage.objects;

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
      or (
        (storage.foldername(name))[1] in ('customer', 'project_team')
        and public.is_assigned_project_developer(public.storage_project_id(name))
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
      or (
        (storage.foldername(name))[1] = 'project_team'
        and public.is_assigned_project_developer(public.storage_project_id(name))
      )
    )
  );

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.developer_skills enable row level security;
alter table public.developer_skills force row level security;
alter table public.developer_links enable row level security;
alter table public.developer_links force row level security;
alter table public.organization_invitations enable row level security;
alter table public.organization_invitations force row level security;
alter table public.project_developer_assignments enable row level security;
alter table public.project_developer_assignments force row level security;

revoke all on table public.developer_skills from public, anon, authenticated;
revoke all on table public.developer_links from public, anon, authenticated;
revoke all on table public.organization_invitations from public, anon, authenticated;
revoke all on table public.project_developer_assignments from public, anon, authenticated;

grant select on table public.developer_skills to authenticated;
grant select on table public.developer_links to authenticated;
grant select (
  id,
  public_id,
  organization_id,
  invited_email,
  role,
  status,
  expires_at,
  accepted_at,
  accepted_by_user_id,
  revoked_at,
  created_by_user_id,
  created_at
) on table public.organization_invitations to authenticated;
grant select on table public.project_developer_assignments to authenticated;

drop policy if exists individual_accounts_select_own on public.individual_accounts;
create policy individual_accounts_select_own
  on public.individual_accounts
  for select
  to authenticated
  using (
    public.is_platform_admin()
    or (select auth.uid()) = user_id
  );

drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own
  on public.profiles
  for select
  to authenticated
  using (
    public.is_platform_admin()
    or (select auth.uid()) = user_id
  );

drop policy if exists organization_memberships_select_own on public.organization_memberships;
create policy organization_memberships_select_related
  on public.organization_memberships
  for select
  to authenticated
  using (
    public.is_platform_admin()
    or (select auth.uid()) = user_id
    or public.is_organization_member(organization_id)
  );

drop policy if exists organizations_select_member on public.organizations;
create policy organizations_select_member
  on public.organizations
  for select
  to authenticated
  using (
    public.is_platform_admin()
    or public.is_organization_member(id)
  );

drop policy if exists developer_profiles_select_own on public.developer_profiles;
create policy developer_profiles_select_own
  on public.developer_profiles
  for select
  to authenticated
  using (
    public.is_platform_admin()
    or (select auth.uid()) = user_id
  );

create policy developer_skills_select_related
  on public.developer_skills
  for select
  to authenticated
  using (
    public.is_platform_admin()
    or developer_user_id = (select auth.uid())
  );

create policy developer_links_select_related
  on public.developer_links
  for select
  to authenticated
  using (
    public.is_platform_admin()
    or developer_user_id = (select auth.uid())
  );

create policy organization_invitations_select_owner
  on public.organization_invitations
  for select
  to authenticated
  using (
    public.is_platform_admin()
    or public.is_organization_owner(organization_id)
  );

create policy project_developer_assignments_select_related
  on public.project_developer_assignments
  for select
  to authenticated
  using (
    public.is_platform_admin()
    or developer_user_id = (select auth.uid())
  );

drop policy if exists projects_select_related on public.projects;
create policy projects_select_related
  on public.projects
  for select
  to authenticated
  using (
    public.can_access_work_request(work_request_id)
    or public.is_assigned_project_developer(id)
  );

drop policy if exists project_tasks_select_related on public.project_tasks;
create policy project_tasks_select_related
  on public.project_tasks
  for select
  to authenticated
  using (
    public.is_platform_admin()
    or public.is_assigned_project_developer(project_id)
    or (
      public.can_access_project(project_id)
      and customer_visible
    )
  );

drop policy if exists project_files_select_related on public.project_files;
create policy project_files_select_related
  on public.project_files
  for select
  to authenticated
  using (
    confirmed_at is not null
    and (
      public.is_platform_admin()
      or (
        public.can_access_project(project_id)
        and visibility = 'customer'
      )
      or (
        public.is_assigned_project_developer(project_id)
        and visibility in ('customer', 'project_team')
      )
    )
  );

drop policy if exists deliverables_select_related on public.deliverables;
create policy deliverables_select_related
  on public.deliverables
  for select
  to authenticated
  using (
    public.is_platform_admin()
    or (
      (
        public.can_access_project(project_id)
        or public.is_assigned_project_developer(project_id)
      )
      and status <> 'draft'
    )
  );

drop policy if exists conversations_select_related on public.conversations;
create policy conversations_select_related
  on public.conversations
  for select
  to authenticated
  using (
    public.can_access_project(project_id)
    or public.is_assigned_project_developer(project_id)
  );

drop policy if exists conversation_messages_select_related on public.conversation_messages;
create policy conversation_messages_select_related
  on public.conversation_messages
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.conversations as conversation
      where conversation.id = conversation_messages.conversation_id
        and (
          public.can_access_project(conversation.project_id)
          or public.is_assigned_project_developer(conversation.project_id)
        )
    )
  );

drop policy if exists conversation_messages_insert_related on public.conversation_messages;
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
          or public.is_assigned_project_developer(conversation.project_id)
        )
    )
  );

drop policy if exists project_activity_select_related on public.project_activity;
create policy project_activity_select_related
  on public.project_activity
  for select
  to authenticated
  using (
    (
      public.can_access_project(project_id)
      or public.is_assigned_project_developer(project_id)
    )
    and (public.is_platform_admin() or visibility = 'customer')
  );
