# Local canonical migration inventory

Ordered by filename. Repository is authoritative for new environments.

| # | Version | File | Purpose |
|---:|---|---|---|
| 1 | 20260914200000 | foundation.sql | pgcrypto, audit_events, set_updated_at helpers |
| 2 | 20260914203852 | auth_foundation.sql | profiles, roles, handle_new_user |
| 3 | 20260915090000 | account_foundation.sql | individuals/orgs membership onboarding |
| 4 | 20260915120000 | work_request_project_workflow.sql | work requests → projects workflow |
| 5 | 20260915121000 | work_request_public_id_execute.sql | public_id execute grants |
| 6 | 20260915123000 | fix_quote_customer_authorization.sql | quote customer auth fix |
| 7 | 20260915140000 | project_delivery_workspace.sql | delivery workspace + project files storage |
| 8 | 20260915141000 | revoke_delivery_trigger_execute.sql | revoke unsafe execute |
| 9 | 20260915150000 | relationship_operations_portals.sql | invitations/portals |
| 10 | 20260915151000 | invitation_crypto_search_path.sql | invitation search_path harden |
| 11 | 20260915160000 | financial_foundation.sql | invoices/payments/ledger foundation |
| 12 | 20260915170000 | payment_platform.sql | payment requests/attempts/providers/allocate |
| 13 | 20260915180000 | platform_completion.sql | store/AI/outbox/automation/notifications |
| 14 | 20260915200000 | payment_ingest_trust_boundary.sql | privileged ingest trust boundary |
| 15 | 20260915210000 | wave2_high_integrity.sql | high-integrity financial/AI fixes |
| 16 | 20260915220000 | wave3_medium_reliability.sql | medium reliability |
| 17 | 20260915220100 | wave3_medium_outbox_indexes.sql | outbox indexes + process_pending_outbox |
| 18 | 20260915220200 | wave3_medium_org_notifications.sql | org notifications |
| 19 | 20260915220300 | wave3_medium_enum_files_indexes.sql | enum/files indexes |
| 20 | 20260915220400 | wave3_drop_duplicate_notification_index.sql | drop duplicate index |
| 21 | 20260916100000 | financial_commercial_completion.sql | commercial financial completion |
| 22 | 20260916120000 | operations_crm_completion.sql | CRM/ops tables |
| 23 | 20260916120100 | operations_crm_rpcs.sql | CRM people RPCs |
| 24 | 20260916120200 | operations_crm_finance_rpcs.sql | CRM finance RPCs |
| 25 | 20260916120300 | operations_crm_ops_rpcs.sql | CRM ops RPCs |
| 26 | 20260916120400 | operations_crm_rls.sql | CRM RLS + operational-documents bucket |
| 27 | 20260916130000 | integrations_platform_controls.sql | platform controls |
| 28 | 20260916130100 | integrations_platform_tables.sql | integrations tables |
| 29 | 20260916130200 | integrations_automation_triggers.sql | automation triggers |
| 30 | 20260916130300 | integrations_platform_rpcs.sql | platform RPCs |
| 31 | 20260916130400 | integrations_ops_rpcs.sql | ops RPCs |
| 32 | 20260916130500 | integrations_platform_rls.sql | integrations RLS |
| 33 | 20260916140000 | v1_build_completion.sql | Phase 5 / V1 build completion |
| 34 | 20260916150000 | final_audit_remediation.sql | post-audit HIGH remediation |
| 35 | 20260916160000 | f_mig_001_domain_trigger_reconciliation.sql | F-MIG-001 missing trigger restore |

## Notes

- Files 12–13 and later large modules have **fragmented remote equivalents** on Development (see `REMOTE_MAPPING.md`).
- No duplicate canonical files; remote chunks are legacy equivalents, not second sources of truth.
