# Operations

Admin operates Flash One from `/admin` without routine direct database editing for V1 work.

## Major areas

Customers, organizations, developers, employees, freelancers, partners, suppliers, contacts,
services, requests, quotes, projects, tasks, cases, documents, communications, store/orders,
procurement, invoices, payment requests, payments, receipts, refunds, credit notes, adjustments,
reconciliation, ledger, expenses, payouts, referrals, commissions, reports,
AI, automations, integrations, imports, exports, incidents, releases, settings, health,
audit log, launch readiness.

## Customer support

Customers create and view visible cases under `/app/cases` (Help links to the same path).

## Automations

Conservative allowlisted actions only. Failures are recorded; financial truth is not mutated by automation.

## Imports

CSV import center supports safe generic flows. Bank statement import remains upload → parse → review → suggested match → human approval. Never auto-post sales from transfers.

## Files

Project files and operational documents are separate concepts. Malware scan states:
`not_scanned | pending | clean | rejected | unavailable`.
Without a scanner, status is `unavailable` or `not_scanned` — never falsely `clean`.

## Dev fixture cleanup (launch strategy)

Do not mass-delete Development fixtures blindly. Before Production:

1. Inventory non-immutable fixtures (catalog drafts, test orgs, fake contacts)
2. Preserve immutable financial evidence rows if any exist in shared environments
3. Prefer a dedicated Production project over cleaning a shared Development database in place
4. Document deletions performed

## F-MIG-001

**MUST RESOLVE BEFORE PRODUCTION.** Do not install Docker solely for this phase. Do not replay from zero. Do not edit historical migrations.
