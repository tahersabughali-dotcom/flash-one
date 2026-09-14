-- Flash One authentication foundation
-- Adds profiles and platform authorization only.
-- Does not recreate audit_events or business tables.
-- Admin is never self-assigned. member is the default platform role.

-- ---------------------------------------------------------------------------
-- profiles: one application profile per auth.users row
-- ---------------------------------------------------------------------------
create table public.profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_full_name_length_check
    check (char_length(full_name) between 1 and 120)
);

comment on table public.profiles is
  'Application-owned identity profile. One row per auth user. Not a business/customer record.';

comment on column public.profiles.user_id is
  'Internal UUID primary key. References auth.users.id. Not a public sequential ID.';

comment on column public.profiles.full_name is
  'Display name supplied at registration. Not an authorization field.';

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row
  execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- user_platform_roles: server-controlled authorization
-- ---------------------------------------------------------------------------
create table public.user_platform_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null,
  created_at timestamptz not null default now(),
  constraint user_platform_roles_role_check
    check (role in ('member', 'admin')),
  constraint user_platform_roles_user_role_key unique (user_id, role)
);

comment on table public.user_platform_roles is
  'Server-controlled platform authorization. Users cannot assign admin to themselves.';

comment on column public.user_platform_roles.role is
  'member is the default. admin is assigned only by a privileged database operator.';

create index user_platform_roles_user_id_idx
  on public.user_platform_roles (user_id);

-- ---------------------------------------------------------------------------
-- New-user trigger: profile + member role only. Never grants admin.
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  supplied_name text;
begin
  supplied_name := left(trim(coalesce(new.raw_user_meta_data->>'full_name', '')), 120);

  insert into public.profiles (user_id, full_name)
  values (new.id, case when supplied_name = '' then 'User' else supplied_name end);

  insert into public.user_platform_roles (user_id, role)
  values (new.id, 'member');

  return new;
end;
$$;

comment on function public.handle_new_user() is
  'Creates a profile and member role after auth.users insert. Does not grant admin.';

revoke all on function public.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- RLS: deny by default. No USING (true) / WITH CHECK (true).
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.profiles force row level security;

alter table public.user_platform_roles enable row level security;
alter table public.user_platform_roles force row level security;

revoke all on table public.profiles from public, anon, authenticated;
revoke all on table public.user_platform_roles from public, anon, authenticated;

grant select on table public.profiles to authenticated;
grant insert (user_id, full_name) on table public.profiles to authenticated;
grant update (full_name) on table public.profiles to authenticated;

grant select on table public.user_platform_roles to authenticated;

create policy profiles_select_own
  on public.profiles
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy profiles_insert_own
  on public.profiles
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy profiles_update_own
  on public.profiles
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy user_platform_roles_select_own
  on public.user_platform_roles
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

-- No insert/update/delete policies on user_platform_roles.
-- Authenticated users cannot assign, escalate, or remove roles.
