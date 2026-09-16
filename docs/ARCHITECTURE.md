# Flash One architecture (V1)

This document describes the **current** Flash One codebase after Build Completion 5/5.

## Product surfaces

- Marketing site (`/`, `/services`, `/solutions`, `/ai`, `/company`, `/contact`) — locked public pages
- Customer workspace (`/app/*`)
- Developer workspace (`/app/developer/*`) — assignment-scoped
- Admin operations (`/admin/*`)
- Public store catalog (`/store`)
- Payment entry (`/pay/[publicId]`)

## Core domains

Identity (Auth) ≠ CRM contact.
Money is integer minor units only.
Quote ≠ Invoice ≠ Payment Request ≠ Payment ≠ Allocation ≠ Receipt ≠ Ledger ≠ Reconciliation.

## Security invariants (preserve)

- Payment privileged ingest uses server secret key only where required
- Payment idempotency and mismatch handling remain authoritative in Postgres
- Ledger immutability; invoice allocation truth; receipt/refund/payout truth
- AI cannot perform trusted financial/admin writes
- Organization ownership and developer isolation via RLS / FORCE RLS
- Integration secrets stay in environment storage (never shown in UI)
- Development payment/AI providers require explicit development gates

## Data access

Supabase Auth + SSR clients. Table access is RLS-first. Sensitive admin reads (for example audit events) use SECURITY DEFINER RPCs after `assert_platform_admin()`.

## Platform controls (Phase 4+)

Integrations registry, AI conversations, automations/outbox, imports, incidents, releases, settings, email foundation, launch readiness.

## Deferred before Production

- **F-MIG-001** — migration history must be resolved before Production (do not edit historical migrations; do not replay from zero in this phase)
- External provider credentials and live E2E
- Owner-verified company/legal data
- Backups/PITR verification
- Final forensic audit

See also: `docs/PLATFORM_ARCHITECTURE.md`, `docs/DATABASE_ARCHITECTURE.md`, `docs/PAYMENT_ARCHITECTURE.md`, `docs/FINANCIAL_ARCHITECTURE.md`.
