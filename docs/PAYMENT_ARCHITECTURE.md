# Flash One Payment Architecture

This is Major Phase 5 of 6. It adds a provider-independent payment platform
on top of the Phase 4 financial foundation. It does not capture production
money and does not deploy.

Invoice ≠ Payment ≠ Allocation ≠ Receipt ≠ Ledger ≠ Reconciliation.
A Payment Request is not a Payment. A Payment Attempt is not a Payment.
A browser return URL is not financial proof.

This platform is designed for fault isolation and graceful degradation.
It does not claim literal 100% uptime.

## Status legend

- **IMPLEMENTED** — code and schema exist in development
- **CONFIGURATION REQUIRED** — adapter exists; secrets or account capability
  are not present
- **DEFERRED** — intentionally not built

## Payment Core

**IMPLEMENTED.**

Checkout goes through `create_payment_attempt()` then a provider adapter.
The browser may create a Payment Request and Payment Attempt. It must
never possess a credential that can tell the financial core that a
provider confirmed payment.

Trust boundary:

1. Provider webhook or the development-only server confirm path
2. Server-only handler verifies authenticity (or development gates)
3. Privileged server client calls `ingest_verified_provider_event()`
4. That function calls `finalize_confirmed_payment()`

`ingest_provider_event` (ingest-key based) is not executable by
`anon`, `authenticated`, `PUBLIC`, or `service_role`. Direct PostgREST
ingest is closed.

`finalize_confirmed_payment()` atomically:

1. Locks the Payment Attempt (`FOR UPDATE`)
2. Returns the existing canonical Payment if one already exists for
   the attempt
3. Deduplicates via the provider event row (`provider`,
   `external_event_id`)
4. Creates at most one succeeded Payment per non-null
   `payment_attempt_id` (database unique constraint)
5. Links attempt and request
6. Allocates to an invoice when safe
7. Issues a receipt (idempotent per payment)
8. Posts ledger `payment_received` (and allocation events through the
   existing allocation helper)
9. Completes the payment request only when the confirmed amount and
   currency match the attempt and the request is still active
10. Creates a reconciliation item for the provider event

Amount or currency mismatch preserves the provider event and records a
Payment with status `review_required` at the provider-reported amount.
It does not mark the request completed, does not allocate to an invoice,
does not mark a Store order paid, does not issue an ordinary success
receipt, and does not post `payment_received` as commercial success.

If confirmed money cannot allocate (invoice already paid, concurrent
attempt), the Payment is still recorded and flagged for review.

## Provider registry

**IMPLEMENTED.**

Table `payment_providers`. No secrets. Codes:

- paypal
- stripe
- wise
- worldfirst
- usdt
- development_test

Each row has display name, operational state, eligibility, capabilities,
supported currencies, and notes.

## Operational states

**IMPLEMENTED.**

`enabled` · `maintenance` · `disabled` · `configuration_required`

A provider that is not `enabled`, or whose adapter is not checkout-ready,
does not appear as a working checkout method.

## Capability model

**IMPLEMENTED** as JSON on each provider.

Possible capabilities: checkout, payment_link, bank_transfer_instructions,
webhook, status_lookup, refund, partial_refund, currencies, business_only,
guest_payment.

Optional adapter methods are capability-gated. Refunds are not exposed in
the UI.

## Isolation and kill switch

**IMPLEMENTED.**

Adapters are independent modules under `lib/server/payments/providers/`.
Platform Admin can change one provider's state without touching others.
`admin_set_provider_state` is the kill switch. Enable is refused in the
admin UI when required configuration is missing.

The development test provider cannot be enabled when
`payment_runtime_settings.environment` is not `development`.

## Secret / config architecture

**IMPLEMENTED.**

Secrets belong in environment variables (gitignored `.env.local`). They are
never stored in the database, never sent to the browser, and never logged
by webhook handlers. `.env.example` lists names only.

`PAYPAL_MODE` is reserved for later sandbox vs live selection. Production
credential values are not created in this phase.

Runtime environment is `payment_runtime_settings.environment`. Development
is the current value. Production must set `production` before any live
provider is enabled.

## Payment Request schema

**IMPLEMENTED.** Table `payment_requests`.

Public ID `PRQ-` + 12 hex. UUID is not exposed.

Statuses: draft, active, completed, expired, cancelled.

Amount modes: `fixed` and `customer_entered` (min/max). Client amounts are
not trusted.

Invoice-linked requests default to invoice amount due and cannot request
more than due. Standalone requests require a customer, business, or guest
email plus currency and amount/range.

Guest payment collects name and email only. No account, address, DOB, or
ID. Guest rows do not weaken authenticated RLS.

Service codes are a controlled list. A snapshot is stored at create time
and is not rewritten after payment.

## Payment Attempt schema

**IMPLEMENTED.** Table `payment_attempts`.

Public ID `PAT-` + 12 hex.

Statuses: created, pending, redirected, processing, succeeded, failed,
cancelled, expired, review_required.

An attempt is checkout state. A Payment is the confirmed financial record.
Starting checkout does not create a succeeded payment.

An internal `ingest_key_hash` may still be stored on the attempt. The
raw ingest key is not returned to browser/client code and does not
authorize financial success. Attempt `public_id` is a correlation
token only.

## Adapter contract

**IMPLEMENTED.** `modules/payment-providers/contract.ts`

Required: `isConfigured`, `isCheckoutReady`, `createCheckout`.
Optional: `verifyWebhook`, later `getStatus` / `refund`.

Return URLs are server-controlled `/pay/result/[PAT-…]` paths. Customer
input cannot set an arbitrary redirect.

## PayPal

**CONFIGURATION REQUIRED.**

Adapter and webhook route `/api/payments/webhooks/paypal` exist. Hosted
checkout is not started because sandbox credentials are absent. Webhook
verification is not live. Official PayPal Checkout is the intended future
path. No scraping. No password collection.

Env names: `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, `PAYPAL_WEBHOOK_ID`,
`PAYPAL_MODE`.

## Stripe

**CONFIGURATION REQUIRED.**

Adapter and webhook route `/api/payments/webhooks/stripe` exist. HMAC
signature verification is implemented for when `STRIPE_WEBHOOK_SECRET` is
present. Event mapping to Payment Core is not live because Checkout
Sessions are not created. Card data stays with Stripe. No unofficial SDK
was added.

Env names: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`.

## Wise

**CONFIGURATION REQUIRED / NOT VERIFIED.**

Capability foundation only: `bank_transfer_instructions`. Checkout is
false. No bank details are stored or displayed. Collection API, payment
links, and webhooks are not assumed.

Env name: `WISE_API_TOKEN`.

## WorldFirst

**CONFIGURATION REQUIRED / NOT VERIFIED.**

Business customers only. Payment Core rejects individual and guest
requests before configuration state. Checkout is false. No invented
endpoints.

Env name: `WORLDFIRST_API_TOKEN`.

## USDT

**CONFIGURATION REQUIRED.**

Networks are explicit (`TRON`, `ETHEREUM`) and none are enabled. Token
amounts use integer units at 6 decimal places (`USDT_TOKEN_SCALE =
1_000_000`). Fiat minor units are not used as the crypto source of truth.
No receiving address is displayed. Customer claims of sending USDT cannot
mark a payment succeeded.

Env names: `USDT_TRON_ADDRESS`, `USDT_ETHEREUM_ADDRESS`.

## Development test provider

**IMPLEMENTED** in development only.

Code `development_test`. Never masquerades as a real provider. Gated by
DB environment `development` **and** `FLASH_ONE_ENABLE_DEV_PAYMENT_PROVIDER=true`
**and** `NODE_ENV !== 'production'`. `next build` sets `NODE_ENV=production`,
so the adapter cannot process during production builds.

Synthetic confirmation is not a public webhook and not a public RPC.
It runs only through the trusted server checkout path:
`confirm_development_test_payment()`, which is granted to `service_role`
only, requires database `environment=development`, uses the attempt
amount/currency (not a caller-supplied amount), and is additionally
gated in application code by `NODE_ENV !== 'production'` and
`FLASH_ONE_ENABLE_DEV_PAYMENT_PROVIDER=true`. Production must fail
closed. The public `/api/payments/webhooks/development-test` route
returns 404.

## Provider events and webhooks

**IMPLEMENTED.** Table `payment_provider_events`.

Unique `(provider, external_event_id)`. Duplicate deliveries return the
existing result. Failed/cancelled outcomes do not create payments. HTTP
handlers return generic JSON and do not log full payloads, headers, or
secrets.

Webhook authenticity is provider-signature based, not browser CSRF.
Unverified events must not reach trusted finalization. PayPal and
Stripe adapters remain fail-closed until live mapping exists.

Out-of-order duplicates are absorbed by the unique event key and by
`finalize_confirmed_payment` returning the existing payment. A second
provider event for the same attempt cannot mint a second Payment.

## Guest receipt strategy

**IMPLEMENTED** for the checkout session only.

Authenticated customers continue to use Phase 4 receipt RLS.

`/pay/result/[PAT-…]` is status UX only. It does not receive a secret
that can finalize money. Durable public `RCP-` lookup is **DEFERRED**.
Knowing `RCP-…` does not make receipts world-readable.

## Rate limiting

**IMPLEMENTED** at application/SQL level: 5 guest payment requests per
email per hour; 20 attempts per request per hour. This is not enterprise
DDoS protection.

## Production readiness (DEFERRED)

- Real sandbox then live credentials
- PayPal hosted checkout + webhook verification
- Stripe Checkout Session + live event mapping
- Verified Wise / WorldFirst account capability
- Configured USDT wallet and confirmation rules
- `payment_runtime_settings.environment=production`
- Development test provider disabled
- Production database / Vercel / DNS

## Not built

Store, Flash One AI, automation engine, payroll, freelancer payouts,
partner settlements, full accounting, tax filing, production deployment.
