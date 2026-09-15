# Flash One Database Architecture

This is the current database foundation.

A non-production Supabase project has the approved foundation migration
applied. Production databases must not be used from this repository yet.

Project identifiers and credentials belong in gitignored `.env.local`.
Do not commit project refs, API keys, or connection strings.

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
- Applied to the verified non-production project in this phase
- Remote history version must match the local filename timestamp
  (`20260915180000` is the platform completion Store/AI/Automation/Notifications
  canonical local file; development applied it as named chunks)
  (`20260915170000` is the payment platform;
  `20260915160000` is the financial foundation;
  `20260915151000` is the invitation pgcrypto search_path correction;
  `20260915150000` is the relationship/operations portals migration;
  `20260915141000` is the delivery trigger-execute revoke;
  `20260915140000` remains the project delivery workspace migration;
  earlier workflow files `20260915120000`, `20260915121000`, and
  `20260915123000` remain unchanged)
- Not applied to production
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

## Account / onboarding tables

See `docs/ACCOUNT_ARCHITECTURE.md`. Added in `20260915090000_account_foundation.sql`:

- `account_onboarding`
- `individual_accounts`
- `organizations`
- `organization_memberships`
- `developer_profiles`

RLS is enabled and forced. Authenticated policies are ownership/membership
scoped. There is no `USING (true)` / `WITH CHECK (true)` authenticated
policy. Organization insert uses `create_organization(p_name)` so owner
membership is created in the same transaction.

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
- One labeled `foundation.validation` system row may remain from
  non-production validation; it is append-only and must not be deleted
  by weakening the design

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

Runtime queries belong under `lib/server/database/`.

`createServerDatabaseClient()` uses:

- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY`

Both are server-only. They are not `NEXT_PUBLIC_*`.

The publishable-key client is subject to RLS and table grants. It cannot
read or write `audit_events`. That is intentional.

A service-role / secret key is not wired. Privileged audit inserts remain
outside the application client until a later dedicated phase.

If env vars are missing, the helper returns `null`. It does not throw
during build.

Generated types live in `lib/server/database/database.types.ts`.
Do not hand-edit that file.

Do not import `@/lib/server` from public marketing pages or Client
Components.

## Work request / project workflow tables

See `docs/WORKFLOW_ARCHITECTURE.md`. Added in
`20260915120000_work_request_project_workflow.sql`:

- `work_requests`
- `quotes`
- `quote_line_items`
- `projects`
- `contracts`

Amounts are integer minor units. Quote acceptance is not payment.

## Project delivery tables

See `docs/DELIVERY_ARCHITECTURE.md`. Added in
`20260915140000_project_delivery_workspace.sql`:

- `project_tasks`
- `project_files`
- `deliverables`
- `deliverable_files`
- `conversations`
- `conversation_messages`
- `project_activity`

Private Storage bucket `project-files`. Not `audit_events`.

## What is not built yet

- Production database connection
- Service-role application client
- Payments, invoices, ledger
- Auth lifecycle audit writes (deferred; no service-role path)

## Next

Review this non-production connection, then continue authentication
review. Do not connect production until that review is complete.
