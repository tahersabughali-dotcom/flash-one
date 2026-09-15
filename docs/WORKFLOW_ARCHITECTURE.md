# Flash One Work Request and Project Workflow

This is Major Phase 1 of 6. It adds the first business workflow after
authentication and account relationships.

Work Request → Quote → Acceptance → Project → Contract/SOW record.

Payments and invoices are not in this phase.

## Domain separation

| Entity | Meaning |
| --- | --- |
| Work request | Customer enquiry |
| Quote | Commercial offer for a request |
| Project | Delivery record after quote acceptance |
| Contract/SOW | Platform acknowledgment of accepted terms |
| Payment | Later phase |
| Invoice | Later phase (Major Phase 4) |

A request is not a project. A quote is not a payment. A contract is not an
invoice.

## Ownership

A work request belongs to **either** an individual relationship **or** an
organization, never both.

`created_by_user_id` is the authenticated submitter in V1. It is nullable so
a future guest enquiry can exist without an auth identity. Guest requests
are not implemented in this phase.

A developer profile does not by itself allow request submission. The same
person may submit if they also have an individual or business relationship.

## Statuses

Work request: submitted, under_review, needs_information, qualified,
declined, converted.

Quote: draft, sent, accepted, rejected, expired, superseded.

Project: planned, active, on_hold, completed, cancelled.

Contract/SOW: draft, issued, accepted, superseded.

## Quote versioning

Each `admin_issue_quote` call creates the next version for that request.
Any previously `sent` quote is set to `superseded`. Only one `sent` quote
and one `accepted` quote may exist per request. Accepted quotes are not
rewritten; a later revision is a new version.

## Money

Amounts are integer **minor units** (pence/cents) in `bigint` columns.
Currency is an explicit ISO code: GBP, USD, or EUR. Totals are computed in
Postgres. Tax is stored as `0` until VAT configuration exists. No FX.

## Quote acceptance

`accept_quote` is SECURITY DEFINER. It checks `actor_is_request_customer`
(NULL owner columns are treated as false), timestamps acceptance, converts
the request, creates exactly one project (`unique accepted_quote_id`), and
issues a Statement of Work acknowledgment with a commercial snapshot.
Retrying acceptance is idempotent.

A raw SQL `owner_id = auth.uid()` must not be used in PL/pgSQL `IF NOT`
guards, because NULL would skip the deny path.

Quote acceptance is not payment received.

## Contract/SOW

The issued SOW is a **platform acknowledgment**, not DocuSign, Adobe Sign,
or a qualified electronic signature. Legal templates, company numbers, VAT
numbers, and jurisdiction clauses are deferred.

Accepted commercial snapshots and accepted contract rows are not silently
mutated; later changes must be a new version.

## Admin authorization

Platform admin is only `user_platform_roles.admin`. Admin writes go through
database functions that call `assert_platform_admin()`. Business owner and
developer are not admin.

## Public ID helper

`random_public_id(prefix)` is granted to `authenticated` so customer
`work_requests` inserts can evaluate the column default. The function
returns a random string only. Quotes, projects, and contracts are created
by trusted database functions, not by customer INSERT.

## Deferred in this phase

- Guest/public work requests
- VAT/tax configuration
- Email notifications
- Tasks, files, delivery (Major Phase 2)
- Payments (later)
- Invoices (Major Phase 4)
- Pagination and advanced filters
- Approved legal contract templates

Existing deferred items from Account Foundation remain, including password
recovery **PENDING END-TO-END VALIDATION**.
