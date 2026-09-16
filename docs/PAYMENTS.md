# Payments

Authoritative architecture: `docs/PAYMENT_ARCHITECTURE.md` and `docs/FINANCIAL_ARCHITECTURE.md`.

## Entity separation

Payment Request → checkout attempt → Payment → Allocation → Receipt.
Refunds attach to Payments. Credit notes attach to Invoices.
Ledger entries are immutable evidence, not UI edits.

## Providers

- PayPal / Stripe: checkout-shaped when credentials and official wiring exist
- Wise / WorldFirst: not forced into generic checkout
- USDT: configuration and network metadata only; no private keys or seed phrases
- `development_test`: development gate only

## Customer paths

- `/pay/[publicId]` payment request entry
- `/app/payments`, `/app/invoices`, `/app/receipts`
- Store checkout creates order + payment request; paid only from confirmed payment

## Admin paths

`/admin/payment-requests`, `/admin/payments`, `/admin/receipts`, `/admin/refunds`, `/admin/credit-notes`, `/admin/reconciliation`, `/admin/ledger`, `/admin/payments/providers`

## Safety

No floating-point money math. No cross-currency sums. No fake provider success.
