-- Flash One account / onboarding foundation
-- Application relationships after authentication.
-- Does not grant platform admin. Does not add payments or projects.

-- ---------------------------------------------------------------------------
-- account_onboarding: missing row means not_started
-- ---------------------------------------------------------------------------
create table public.account_onboarding (
  user_id uuid primary key references auth.users (id) on delete cascade,
  status text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint account_onboarding_status_check
    check (status in ('not_started', 'in_progress', 'completed'))
);

comment on table public.account_onboarding is
  'Application-owned initial onboarding state. Absence of a row means not_started. Not an auth role.';

comment on column public.account_onboarding.status is
  'not_started | in_progress | completed. Independent of platform admin.';

create trigger account_onboarding_set_updated_at
  before update on public.account_onboarding
  for each row
  execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- individual_accounts: client/individual relationship only
-- Display name remains on public.profiles.
-- ---------------------------------------------------------------------------
create table public.individual_accounts (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

comment on table public.individual_accounts is
  'Records that the person uses Flash One as an individual client. Does not duplicate profiles.';

-- ---------------------------------------------------------------------------
-- organizations
-- ---------------------------------------------------------------------------
create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  public_id text not null default ('org_' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 20)),
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint organizations_name_length_check
    check (char_length(name) between 1 and 120),
  constraint organizations_public_id_format_check
    check (public_id ~ '^org_[a-f0-9]{20}$'),
  constraint organizations_public_id_key unique (public_id)
);

comment on table public.organizations is
  'Business/company entity. Domain ownership is via organization_memberships, not platform admin.';

comment on column public.organizations.id is
  'Internal UUID primary key. Never a public sequential identifier.';

comment on column public.organizations.public_id is
  'Public identifier for future URLs/APIs. Separate from InternalId.';

create trigger organizations_set_updated_at
  before update on public.organizations
  for each row
  execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- organization_memberships
-- ---------------------------------------------------------------------------
create table public.organization_memberships (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null,
  created_at timestamptz not null default now(),
  constraint organization_memberships_role_check
    check (role in ('owner', 'member')),
  constraint organization_memberships_org_user_key unique (organization_id, user_id)
);

comment on table public.organization_memberships is
  'Domain membership. owner is organization ownership, never platform admin.';

create index organization_memberships_user_id_idx
  on public.organization_memberships (user_id);

create index organization_memberships_organization_id_idx
  on public.organization_memberships (organization_id);

-- ---------------------------------------------------------------------------
-- developer_profiles
-- ---------------------------------------------------------------------------
create table public.developer_profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  public_id text not null default ('dev_' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 20)),
  display_name text not null,
  headline text,
  bio text,
  availability_status text not null default 'available',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint developer_profiles_display_name_length_check
    check (char_length(display_name) between 1 and 120),
  constraint developer_profiles_headline_length_check
    check (headline is null or char_length(headline) between 1 and 160),
  constraint developer_profiles_bio_length_check
    check (bio is null or char_length(bio) between 1 and 1000),
  constraint developer_profiles_availability_check
    check (availability_status in ('available', 'limited', 'unavailable')),
  constraint developer_profiles_public_id_format_check
    check (public_id ~ '^dev_[a-f0-9]{20}$'),
  constraint developer_profiles_public_id_key unique (public_id)
);

comment on table public.developer_profiles is
  'Minimal developer identity. Not a marketplace, contract, or payment record.';

comment on column public.developer_profiles.public_id is
  'Public identifier for future URLs/APIs. Separate from InternalId.';

create trigger developer_profiles_set_updated_at
  before update on public.developer_profiles
  for each row
  execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Atomic organization + owner membership
-- ---------------------------------------------------------------------------
create or replace function public.create_organization(p_name text)
returns public.organizations
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  actor uuid;
  trimmed text;
  created public.organizations;
begin
  actor := (select auth.uid());
  if actor is null then
    raise exception 'not authenticated';
  end if;

  trimmed := left(trim(coalesce(p_name, '')), 120);
  if trimmed = '' then
    raise exception 'organization name is required';
  end if;

  insert into public.organizations (name)
  values (trimmed)
  returning * into created;

  insert into public.organization_memberships (organization_id, user_id, role)
  values (created.id, actor, 'owner');

  return created;
end;
$$;

comment on function public.create_organization(text) is
  'Creates an organization and owner membership in one transaction. Does not grant platform admin.';

revoke all on function public.create_organization(text) from public, anon;
grant execute on function public.create_organization(text) to authenticated;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.account_onboarding enable row level security;
alter table public.account_onboarding force row level security;
alter table public.individual_accounts enable row level security;
alter table public.individual_accounts force row level security;
alter table public.organizations enable row level security;
alter table public.organizations force row level security;
alter table public.organization_memberships enable row level security;
alter table public.organization_memberships force row level security;
alter table public.developer_profiles enable row level security;
alter table public.developer_profiles force row level security;

revoke all on table public.account_onboarding from public, anon, authenticated;
revoke all on table public.individual_accounts from public, anon, authenticated;
revoke all on table public.organizations from public, anon, authenticated;
revoke all on table public.organization_memberships from public, anon, authenticated;
revoke all on table public.developer_profiles from public, anon, authenticated;

grant select, insert, update (status) on table public.account_onboarding to authenticated;
grant select, insert on table public.individual_accounts to authenticated;
grant select, update (name) on table public.organizations to authenticated;
grant select on table public.organization_memberships to authenticated;
grant select, insert, update (
  display_name,
  headline,
  bio,
  availability_status
) on table public.developer_profiles to authenticated;

create policy account_onboarding_select_own
  on public.account_onboarding
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy account_onboarding_insert_own
  on public.account_onboarding
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy account_onboarding_update_own
  on public.account_onboarding
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy individual_accounts_select_own
  on public.individual_accounts
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy individual_accounts_insert_own
  on public.individual_accounts
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy organization_memberships_select_own
  on public.organization_memberships
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy organizations_select_member
  on public.organizations
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.organization_memberships as membership
      where membership.organization_id = organizations.id
        and membership.user_id = (select auth.uid())
    )
  );

create policy organizations_update_owner
  on public.organizations
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.organization_memberships as membership
      where membership.organization_id = organizations.id
        and membership.user_id = (select auth.uid())
        and membership.role = 'owner'
    )
  )
  with check (
    exists (
      select 1
      from public.organization_memberships as membership
      where membership.organization_id = organizations.id
        and membership.user_id = (select auth.uid())
        and membership.role = 'owner'
    )
  );

create policy developer_profiles_select_own
  on public.developer_profiles
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy developer_profiles_insert_own
  on public.developer_profiles
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy developer_profiles_update_own
  on public.developer_profiles
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
