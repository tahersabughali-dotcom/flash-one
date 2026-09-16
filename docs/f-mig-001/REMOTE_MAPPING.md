# Local ↔ remote Development migration mapping

Remote source: linked Development `list_migrations` (legacy history).  
Local source: `supabase/migrations/*` (canonical).

## Direct 1:1 (early chain)

| Local version | Local name | Remote version | Remote name |
|---|---|---|---|
| 20260914200000 | foundation | 20260914200000 | foundation |
| 20260914203852 | auth_foundation | 20260914203852 | auth_foundation |
| 20260915090000 | account_foundation | 20260915090000 | account_foundation |
| 20260915120000 | work_request_project_workflow | 20260915120000 | work_request_project_workflow |
| 20260915121000 | work_request_public_id_execute | 20260915121000 | work_request_public_id_execute |
| 20260915123000 | fix_quote_customer_authorization | 20260915123000 | fix_quote_customer_authorization |
| 20260915140000 | project_delivery_workspace | 20260915140000 | project_delivery_workspace |
| 20260915141000 | revoke_delivery_trigger_execute | 20260915141000 | revoke_delivery_trigger_execute |
| 20260915150000 | relationship_operations_portals | 20260915150000 | relationship_operations_portals |
| 20260915151000 | invitation_crypto_search_path | 20260915151000 | invitation_crypto_search_path |
| 20260915160000 | financial_foundation | 20260915160000 | financial_foundation |

## Fragmented remote → single local (proven by name family + schema outcome)

### `20260915170000_payment_platform.sql`

Remote chunks (ordered):  
`20260915161316` payment_platform … through `20260915171734` payment_platform_finalize_reload  
(including intermediate `20260915170000` payment_platform and allocate/admin/create/finalize/ingest/rls chunks).

### `20260915180000_platform_completion.sql`

Remote: `20260915173518` … `20260915175046` platform_completion\*  
(including `platform_completion_domain_triggers` which created outbox/payment triggers later reconciled locally via `20260916160000_*`).

### `20260915200000_payment_ingest_trust_boundary.sql`

Remote: `20260915185257` payment_ingest_trust_boundary + `20260915185705` payment_finalize_store_outbox_hooks

### `20260915210000_wave2_high_integrity.sql`

Remote: `20260915192447` wave2_high_integrity + `20260915192515` wave2_finalize_mismatch_review + `20260915192527` wave2_ai_assistant_trust

### Wave3 locals

| Local | Remote |
|---|---|
| 20260915220000_wave3_medium_reliability | 20260915195006 |
| 20260915220100_wave3_medium_outbox_indexes | 20260915195106 |
| 20260915220200_wave3_medium_org_notifications | 20260915195147 |
| 20260915220300_wave3_medium_enum_files_indexes | 20260915195205 |
| 20260915220400_wave3_drop_duplicate_notification_index | 20260915195319 |

### `20260916100000_financial_commercial_completion.sql`

Remote: `20260916063924` … `20260916064028` financial_commercial_completion_*

### Operations CRM locals (`20260916120000`–`20400`)

Remote: `20260916075034` … `20260916075508` operations_crm_*

### Integrations locals (`20260916130000`–`30500`)

Remote: `20260916085025` … `20260916090711` integrations_*

### Phase 5 / audit

| Local | Remote |
|---|---|
| 20260916140000_v1_build_completion | 20260916093617 v1_build_completion |
| 20260916150000_final_audit_remediation | 20260916102628 final_audit_remediation |
| 20260916160000_f_mig_001_domain_trigger_reconciliation | *(schema already present via legacy chunks; optional idempotent apply)* |

## Counts

- Local canonical files: **35**
- Remote Development migration rows: **84** (plus any later adds)

Mapping is many remote → one local for consolidated modules; not filename-cosmetic equality.
