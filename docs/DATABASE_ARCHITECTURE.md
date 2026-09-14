# Flash One Database Architecture

This is the current database foundation. It is SQL in the repository only.
It is not connected to a live Postgres or Supabase project.

## One Postgres

Flash One uses **one managed PostgreSQL database**.

Future modules (Auth, Customers, Projects, Payments, and others) own their
tables through migrations and `modules/` boundaries. They do not get their
own physical database.

`public` is the starting schema. Additional Postgres schemas are not created
in this phase.

## Migrations

Versioned SQL lives in:

```
supabase/migrations/
```

Rules:

- One timestamped file per change (`YYYYMMDDHHmmss_name.sql`)
- Deterministic, reviewable, non-destructive
- Applied later against a real project — **not** from this phase
- No Prisma or Drizzle

## UUID convention

- Internal primary keys are `uuid`
- Defaults use Postgres `gen_random_uuid()` (UUIDv4 via `pgcrypto`)
- Sequential integers are not internal entity IDs
- Future public/reference codes (receipt numbers, slugs) are a separate column
  or type, never the primary key

`gen_random_uuid()` is used because it is native on PostgreSQL / Supabase and
needs no extra extension. Time-ordered UUIDv7 can be considered later if the
database provides it without a third-party extension.

TypeScript `InternalId` / `PublicId` match this rule.

## Timestamps

- Use `timestamptz`
- Store UTC
- `created_at` — row insert time
- `updated_at` — last mutation (via `public.set_updated_at()` when a table is mutable)
- `occurred_at` — when an event happened (audit)

`audit_events` has `occurred_at` and `created_at`. It does not use `updated_at`.

## RLS strategy

Deny by default.

`audit_events` has RLS enabled **and forced**, with **no policies**. `anon` and
`authenticated` are revoked when those roles exist.

That means the PostgREST Data API cannot read or write this table even if the
table is in `public`. Roles with `BYPASSRLS` (`postgres` / `service_role` when
added later) can still access it from server code.

Do not add `USING (true)` or `WITH CHECK (true)` policies.

Do not put `service_role` keys in `NEXT_PUBLIC_*` or browser code.

## Audit strategy

`public.audit_events` is append-only.

Intended immutability model (no invented application role names yet):

- INSERT is the only intended write
- UPDATE and DELETE are blocked by `prevent_audit_mutation()` triggers
- RLS is enabled and forced, with no policies
- Table privileges are revoked from `PUBLIC`, and from `anon` /
  `authenticated` when those roles exist
- Future application roles, when they exist, should receive INSERT
  (and SELECT if needed) only — never UPDATE or DELETE
- No fake rows are inserted by the application in this phase

### TypeScript mapping

| TypeScript (`AuditEvent`) | Postgres (`audit_events`) |
| --- | --- |
| `actor.kind` | `actor_type` |
| `actor.id` | `actor_id` |
| `action` | `action` |
| `entityType` | `entity_type` |
| `entityId` | `entity_id` |
| `occurredAt` | `occurred_at` |
| `metadata` | `metadata` |
| `requestId` | `request_id` |
| (row identity) | `id` |
| (insert time) | `created_at` |

`actor_type` values: `system`, `anonymous`, `user`, `admin`, `service`.

## Server-only data access

Runtime queries belong under `lib/server/database/` when a client exists.

This phase only defines row types and a mapper. There is no connected client
and no environment variable is read at runtime.

## What is not built yet

- Remote Supabase project link
- Database connection / env vars
- Auth, users, profiles, roles
- Customers, businesses, projects
- Payments, invoices, ledger
- Generated `Database` types
- Production or remote migrations

## Next

Connect a non-production Postgres/Supabase project, apply this migration
there, then add authentication.
