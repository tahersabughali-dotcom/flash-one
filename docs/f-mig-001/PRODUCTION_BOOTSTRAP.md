# Production bootstrap procedure (do not execute now)

Future empty Production only. Owner approval required. Not Development.

1. **Create** a new empty Supabase Production project (separate from Development).
2. **Extensions / settings:** ensure `pgcrypto` (provided by Supabase), Auth, Storage enabled as default empty project.
3. **Environment:** configure Production env vars in the host — never commit secrets; no `FLASH_ONE_ENABLE_DEV_*`.
4. **Apply canonical migrations:** apply every file in `supabase/migrations/` **in filename order** (CLI `supabase db push` against the **new empty** Production project, or equivalent ordered apply). Do not copy Development data.
5. **Verify schema:** compare table/RLS/FORCE/policy/trigger/function fingerprints to Development application schema (see F-MIG-001 replay baseline). Confirm `20260916150000_final_audit_remediation` and `20260916160000_f_mig_001_domain_trigger_reconciliation` effects present.
6. **Auth:** Production Auth URL/redirects, leaked-password protection, cookie domains.
7. **Storage:** confirm private buckets `project-files` and `operational-documents`; no Development objects copied.
8. **Secrets:** service-role / secret key scoped to Production only.
9. **Provider credentials:** configure PayPal/Stripe/etc. **only after** schema + Auth + Storage are verified; set `payment_runtime_settings.environment=production`; disable `development_test`.
10. **Smoke / security / financial tests** on Production (no live customer traffic yet).
11. **Enable live traffic** only after checklist sign-off (`docs/PRODUCTION_CHECKLIST.md`).

## Explicit non-goals of documenting this procedure

- Do not create Production now
- Do not deploy now
- Do not configure live providers now
