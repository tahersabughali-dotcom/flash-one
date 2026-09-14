-- Flash One foundation
-- One Postgres database. No business tables in this migration.
-- This file is versioned SQL only. It is not applied to any remote project
-- from this phase.

-- gen_random_uuid() is provided by pgcrypto on PostgreSQL / Supabase.
create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Shared updated_at helper
-- Attach later with:
--   create trigger <table>_set_updated_at
--     before update on <table>
--     for each row
--     execute function public.set_updated_at();
-- Not attached to audit_events (append-only).
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = pg_catalog, public
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

comment on function public.set_updated_at() is
  'Reusable BEFORE UPDATE trigger function. Sets NEW.updated_at to now() (timestamptz, UTC).';

revoke all on function public.set_updated_at() from public;

-- ---------------------------------------------------------------------------
-- Audit immutability
-- ---------------------------------------------------------------------------
create or replace function public.prevent_audit_mutation()
returns trigger
language plpgsql
set search_path = pg_catalog, public
as $$
begin
  raise exception 'audit_events is append-only and cannot be updated or deleted';
end;
$$;

comment on function public.prevent_audit_mutation() is
  'Blocks UPDATE and DELETE on public.audit_events for application roles.';

revoke all on function public.prevent_audit_mutation() from public;

-- ---------------------------------------------------------------------------
-- audit_events
-- Internal primary key is UUID, never a sequential public number.
-- actor_id has no FK: Auth tables do not exist yet.
-- ---------------------------------------------------------------------------
create table public.audit_events (
  id uuid primary key default gen_random_uuid(),
  occurred_at timestamptz not null default now(),
  actor_type text not null,
  actor_id uuid,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  request_id uuid,
  created_at timestamptz not null default now(),
  constraint audit_events_actor_type_check
    check (actor_type in ('system', 'anonymous', 'user', 'admin', 'service')),
  constraint audit_events_action_length_check
    check (char_length(action) between 1 and 128),
  constraint audit_events_entity_type_length_check
    check (char_length(entity_type) between 1 and 128),
  constraint audit_events_actor_id_consistency_check
    check (
      (actor_type in ('system', 'anonymous') and actor_id is null)
      or (actor_type in ('user', 'admin') and actor_id is not null)
      or (actor_type = 'service')
    )
);

comment on table public.audit_events is
  'Append-only platform audit log. Server-only. No public Data API access.';

comment on column public.audit_events.id is
  'Internal UUID primary key. Not a public sequential identifier.';

comment on column public.audit_events.occurred_at is
  'Event time (timestamptz, stored in UTC). Maps to AuditEvent.occurredAt.';

comment on column public.audit_events.actor_type is
  'system | anonymous | user | admin | service. Maps to AuditEvent.actor.kind.';

comment on column public.audit_events.actor_id is
  'Internal UUID of the actor when applicable. Null for system and anonymous.';

comment on column public.audit_events.action is
  'Stable action name, e.g. project.created. Maps to AuditEvent.action.';

comment on column public.audit_events.entity_type is
  'Logical entity name. Maps to AuditEvent.entityType.';

comment on column public.audit_events.entity_id is
  'Internal UUID of the entity. Maps to AuditEvent.entityId.';

comment on column public.audit_events.metadata is
  'Small JSON object of extra facts. Maps to AuditEvent.metadata.';

comment on column public.audit_events.request_id is
  'Optional request correlation UUID. Maps to AuditEvent.requestId.';

comment on column public.audit_events.created_at is
  'Row insert time (timestamptz, UTC). Distinct from occurred_at.';

create index audit_events_occurred_at_idx
  on public.audit_events (occurred_at desc);

create index audit_events_entity_idx
  on public.audit_events (entity_type, entity_id);

create index audit_events_actor_idx
  on public.audit_events (actor_type, actor_id);

create trigger audit_events_no_update
  before update on public.audit_events
  for each row
  execute function public.prevent_audit_mutation();

create trigger audit_events_no_delete
  before delete on public.audit_events
  for each row
  execute function public.prevent_audit_mutation();

-- RLS: deny by default. No policies for anon or authenticated.
-- FORCE applies RLS to the table owner too. Only BYPASSRLS roles
-- (postgres / service_role) can access until explicit policies exist.
-- Do not add USING (true) policies.
alter table public.audit_events enable row level security;
alter table public.audit_events force row level security;

revoke all on table public.audit_events from public;

do $$
begin
  if exists (select 1 from pg_roles where rolname = 'anon') then
    revoke all on table public.audit_events from anon;
  end if;

  if exists (select 1 from pg_roles where rolname = 'authenticated') then
    revoke all on table public.audit_events from authenticated;
  end if;
end $$;
