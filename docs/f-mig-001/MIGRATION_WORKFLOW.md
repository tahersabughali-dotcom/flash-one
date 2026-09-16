# Future migration workflow (post F-MIG-001)

## Authority reminder

- **Canonical for new DBs:** `supabase/migrations/*.sql` in git.
- **Development remote history:** legacy fragmented rows — leave them.

## Adding a new migration tomorrow

1. Create **one** new dated file under `supabase/migrations/` (e.g. `20260917HHMMSS_description.sql`).
2. Apply that **same SQL** to Development via Supabase MCP `apply_migration` (or CLI against the linked Dev project) **once**.
3. For future Production (built from canonical chain): the new file applies naturally after the full historical chain.
4. Do **not** maintain two SQL implementations.

## Dangerous commands against Development

| Command | Risk |
|---|---|
| `supabase db reset` | Destroys Development data — **forbidden** |
| `supabase db push` (blind) | May treat unmatched local versions as pending and re-apply schema destructively |
| Bulk `migration repair --status applied` without mapping | History lies; future drift |

## Safe CLI posture for Development

Until a deliberate, documented repair session is approved:

1. Prefer **MCP `apply_migration`** (or Dashboard SQL) for **new forward** migrations only.
2. Do not link+push the entire local chain against Development.
3. If CLI repair is ever used: mark **only** local versions that are proven covered by remote legacy chunks as `applied`, history-only, after reviewing `REMOTE_MAPPING.md`. Record every repair command in git docs.

## Isolated replay (verification)

```bash
npm install --no-save @electric-sql/pglite
node scripts/f-mig-001/replay-canonical.mjs
```

Must remain green before Production bootstrap.
