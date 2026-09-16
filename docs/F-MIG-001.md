# F-MIG-001 — Migration history Production blocker

## Current proven state (Final Master Audit)

- **Local canonical files:** ~33 SQL files under `supabase/migrations/` with dated names such as `20260916140000_v1_build_completion.sql`.
- **Remote Development `supabase_migrations.schema_migrations`:** many more fragmented version rows (MCP `apply_migration` historically applied large local files as multiple timestamped chunks, e.g. `20260916093617` / `v1_build_completion`).
- **Result:** a new empty environment cannot replay remote history 1:1 against local files without a deliberate reconciliation strategy.
- **Schema content** on Development is broadly functional for V1, but **history divergence remains an OPEN PRODUCTION BLOCKER**.

## Must NOT do

- Edit historical applied migrations
- Destroy Development to “clean” history
- Install Docker solely for this audit
- Assume Production can `supabase db push` blindly from the current divergent history

## Required remediation before Production

1. Snapshot / backup Development schema (pg_dump schema-only + data if needed).
2. Create a **fresh Production Supabase project**.
3. Choose ONE reproducible apply path:
   - **Preferred:** squash or generate a verified baseline schema for Production from the current known-good Development schema (reviewed), then continue with forward-only migrations thereafter; **or**
   - Reconcile local migration filenames/versions to a single ordered chain that applies cleanly to an empty database, then apply that chain to Production only after dry-run on a disposable clone.
4. Record the chosen strategy in `docs/PRODUCTION_CHECKLIST.md` before go-live.
5. Never use Development `payment_runtime_settings.environment=development` / `development_test` enabled as Production state.

## Related audit note

Phase 5 local file `20260916140000_v1_build_completion.sql` was only **partially** present on Development at audit time (`mark_all_notifications_read` yes; malware columns / customer case RPC / refunds customer policy missing until `20260916150000_final_audit_remediation.sql` is applied).
