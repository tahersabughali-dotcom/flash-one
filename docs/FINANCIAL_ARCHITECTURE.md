# Flash One Financial Architecture

This is Major Phase 4 of 6. It adds the internal financial recording
foundation. It does not capture real money and does not integrate payment
providers.

## Domain separation

These remain different entities:

| Entity | Meaning |
| --- | --- |
| Quote | Commercial offer |
| Contract / SOW | Platform acknowledgment of accepted terms |
| Project | Delivery record |
| Invoice | Commercial request for payment |
| Invoice line | Snapshot economics on that invoice |
| Payment | Record that money was received |
| Payment allocation | How a payment was applied to invoices |
| Receipt | Evidence Flash One recorded money received |
| Ledger entry | Append-only operational financial event |
| Reconciliation item | Future provider/bank item to compare with payments |

Quote acceptance is not payment. Project completion is not payment.
Deliverable acceptance is not payment. Invoice issuance is not payment.
A bank/provider transaction is not automatically a sale.

Paid invoice state is derived from allocated payment value.

Provider checkout lives in `docs/PAYMENT_ARCHITECTURE.md`. A provider event
is not automatically a sale. Browser return URLs are not financial proof.

## Money

Authoritative amounts are integer **minor units** in `bigint` columns.
Every amount has an explicit currency. V1 currencies:

- GBP: 100 minor units per major unit
- USD: 100
- EUR: 100

`currency_minor_units(text)` returns 100 for those codes and null otherwise.
Do not assume every future currency has two decimals. JavaScript `number` is
used only after `Number.isSafeInteger` validation. FX conversion is not
implemented. Different currencies cannot be combined.

Tax/VAT remains `0`. Flash One is not claiming VAT registration. Documents
must not print a VAT number or tax registration number.

## Invoice ownership

An invoice belongs to **either** an `individual_accounts` customer **or** an
organization, never both. Auth is not the CRM. Future historical/offline
clients remain possible in the schema; V1 still uses those relationship
tables.

## Invoice identifiers

- Internal UUID stays private.
- `public_id` is unpredictable `INV-` + 12 hex. It is not the legal invoice
  number. Organization invitations historically also used `INV-`; they are a
  different table.
- `invoice_number` is assigned atomically at issue from `invoice_number_seq`
  as `FO-INV-YYYY-000001`. Year is the UTC issue year. The sequence is global
  and never reused. Drafts have a public ID only. Issued numbers are never
  renumbered.

## Invoice lifecycle

Stored statuses: `draft`, `issued`, `partially_paid`, `paid`, `void`.

`overdue` is derived in the UI when status is issued or partially paid, a due
date has passed, and amount due is greater than zero. Rows are not mutated
merely because time passed.

Amount due = `total_minor - amount_paid_minor`. `amount_paid_minor` is kept
in sync from allocation sums.

## Quote → invoice

Admin may create a draft from an accepted quote. Line items, owner, and
currency are copied into the invoice. The invoice is then independent.
Later quote changes do not rewrite invoice history. Quote acceptance never
issues an invoice automatically.

## Snapshots and immutability

At issue, `customer_snapshot` stores display name, public ID, currency,
amounts, issue date, due date, and issued lines. `billing_snapshot` stores
only verified brand data: issuer Flash One and domain flashone.uk. No
invented registered office, VAT number, or bank details.

After issue, commercial fields and line items cannot be silently rewritten.
Corrections require void (Phase 4) or a future credit note / replacement
invoice. Credit notes are deferred.

Void is admin-only, preserves the row, records `voided_at` / actor / optional
reason, cannot be applied to drafts or invoices with allocations, cannot later
become paid, and does not reuse the invoice number. Allocation reversal is
deferred, so void currently requires zero allocations.

## Payments

Phase 4 supports `source_type = manual` only. Provider and provider_reference
must be null. Statuses exist for Phase 5 (`pending`, `succeeded`, `failed`,
`cancelled`, `refunded`, `partially_refunded`) but manual records are created
as `succeeded`. Only platform admin may create them. They are labelled
manual development records, never disguised as PayPal, Stripe, Wise,
WorldFirst, or USDT.

Public ID: `PAY-` + 12 hex.

A payment may remain unallocated. Unallocated amount is payment amount minus
allocation sum. Matching a reconciliation item does not create a payment.

## Allocations

`payment_allocations` is many-to-many. Unique `(payment_id, invoice_id)`.
`admin_allocate_payment` locks both rows and enforces:

- same currency
- matching owners
- succeeded payment
- not draft/void invoice
- positive amount
- not beyond payment remaining
- not beyond invoice amount due

Retry with the same payment, invoice, and amount returns the existing row
(idempotent). A different amount for the same pair is denied. Overpayment
through allocation is denied. Partial payments are supported.

Invoice status after allocation:

- allocated 0 → issued
- 0 < allocated < total → partially_paid
- allocated >= total → paid, `paid_at` recorded

## Receipts

One receipt per succeeded payment (`unique payment_id`). Retry of
`admin_issue_receipt` returns the existing receipt. Pending/failed/cancelled
payments cannot get a receipt. Manual payment recording issues a receipt in
the same transaction.

- `public_id`: unpredictable grouped `RCP-XXXX-XXXX-XXXX-XXXX`
- `receipt_number`: sequential `FO-RCP-YYYY-000001` from `receipt_number_seq`

Customer view shows amount, currency, date/time, receipt number, and related
invoice numbers when truthful. No internal UUIDs, ledger IDs, or provider
webhook IDs.

## Ledger

`financial_ledger_entries` is an operational append-only ledger. It is not
`audit_events` and not `project_activity`. It is not statutory double-entry
accounting. UPDATE/DELETE are blocked by trigger. Ordinary authenticated
actors have SELECT only for platform admin. Events in Phase 4:

- `manual_payment_recorded` / direction `in`
- `payment_allocated` / direction `allocation` (not a second cash-in)

Corrections later should use reversal/adjustment rows, not silent updates.

## Reconciliation

Foundation only. No bank API, no provider API, no statement import.
Phase 4 items are `source_type = manual_dev`. Statuses: unmatched,
suggested, matched, reconciled, ignored. Admin may match a succeeded payment
when currency and amount are equal. Matching does not create a payment or a
sale. Confirming records actor and timestamp.

Future bank import workflow (deferred): upload → extract → deduplicate →
classify → match → suggest → human approval → reconcile → audit.

## Authorization

Financial mutations require `user_platform_roles.admin` via
`assert_platform_admin()`. Organization owner, developer, and customer cannot
create financial records.

Customers and organization members may SELECT issued invoices and receipts
they own. Developer project assignment grants **zero** financial access.
Ledger and reconciliation are admin-only.

FORCE RLS on all financial tables. No `USING (true)`. No INSERT/UPDATE/DELETE
grants to `authenticated`; writes go through SECURITY DEFINER functions with
fixed `search_path`, PUBLIC/anon execute revoked, and internal `auth.uid()`
checks.

Customer portal listing additionally filters by the signed-in user's
individual or membership relationship so a dual-hat platform admin does not
see other customers' documents on `/app/invoices` or `/app/receipts`.

## PDF

No PDF engine was added. Issued invoice and receipt views are print-friendly.
Final PDF generation is deferred and must use the immutable snapshot.

## Phase 5 and later

Phase 5 owns payment providers, payment requests, webhooks, and provider
transaction records. Schema leaves room for refund / partial refund /
reversal statuses. Do not treat this ledger as official accounts, a balance
sheet, or a tax return.

## Deferred

- Verified legal invoice identity block
- Final invoice PDF / receipt PDF
- Credit notes
- Refund workflows
- Bank statement import
- FX
- Additional currencies / minor-unit edge cases
- Tax/VAT configuration
- Accounting export / statutory accounting
- Customer billing addresses
- Email invoice/receipt delivery
- Allocation reversal
- Password recovery remains PENDING END-TO-END VALIDATION
