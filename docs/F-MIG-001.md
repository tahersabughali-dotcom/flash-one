# F-MIG-001 — Migration reproducibility (remediated)

## Status

**CLOSED for repository canonical-chain reproducibility** after isolated empty-database replay and schema comparison (2026-09-16).

## Root cause (proven)

Large consolidated local SQL files were historically applied to linked Development via **MCP `apply_migration` in fragmented/chunked form**, producing remote `schema_migrations` versions/names that do not match local filenames 1:1.

Additionally, three domain/payment trigger functions present on Development (from remote chunks such as `platform_completion_domain_triggers` / payment finalize hooks) were **absent from the consolidated local `platform_completion` file**, so a clean replay of the pre-remediation chain under-produced triggers vs Development.

## Authority

| Environment | Authoritative history |
|---|---|
| **New empty databases (incl. future Production)** | Repository files in `supabase/migrations/` (canonical ordered chain) |
| **Linked Development** | Legacy fragmented remote `schema_migrations` rows remain; schema content is the known-good live DB. Do **not** rewrite remote history for cosmetic filename matching. |

Repository migrations are canonical for any **new** environment. Development remote history is **legacy**.

## Canonical local chain

35 SQL files under `supabase/migrations/` (see `docs/f-mig-001/LOCAL_INVENTORY.md`).

Forward reconciliation added:

- `20260916160000_f_mig_001_domain_trigger_reconciliation.sql` — restores `outbox_after_insert_process`, `payment_request_completed_store_hook`, `payment_succeeded_enqueue` + their three triggers.

## Clean replay proof

- Environment: isolated **PGlite** empty Postgres (`scripts/f-mig-001/replay-canonical.mjs`)
- Not linked Development; no Docker install required
- Bootstrap stubs only for empty-Supabase builtins (`auth`, `storage`, `pgcrypto`-compatible helpers)
- All canonical migrations applied in order — **OK**
- Results: `docs/f-mig-001/replay-results.json`

### Structural match vs Development (application schema)

| Metric | Development | Clean replay |
|---|---:|---:|
| Tables | 90 | 90 |
| RLS enabled | 90 | 90 |
| FORCE RLS | 90 | 90 |
| Policies (public+storage) | 104 | 104 |
| Triggers | 79 | 79 |
| SECURITY DEFINER (app) | 161 | 161 |
| Columns | 989 | 989 |
| Constraints | 1417 | 1417 |
| Indexes | 271 | 271 |
| Storage buckets | 2 private | 2 private |

Expected differences: migration-history rows; PGlite bootstrap stubs (`digest`/`gen_random_*`/`uuid_*`); business data rows.

## Development safety

- No Development reset, truncate, or data rewrite.
- Optional apply of `20260916160000_*` on Development is idempotent (objects already present from legacy chunks). Not required for schema equivalence.
- Do **not** run `supabase db reset` or blind `supabase db push` against Development.

## CLI / future migration safety

See `docs/f-mig-001/MIGRATION_WORKFLOW.md`.

## Production bootstrap

See `docs/f-mig-001/PRODUCTION_BOOTSTRAP.md` (do not execute until owner go-live).

## Must still not do

- Destroy Development to “clean” history
- Assume Production can `db push` against divergent Development history
- Use Development payment runtime as Production state
