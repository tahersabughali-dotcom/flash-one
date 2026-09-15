# Flash One Store, AI, Automation, and Notifications

This is Major Phase 6 of 6 — V1 platform completion. It does not deploy
and does not add production secrets.

Store ≠ Payment ≠ Invoice ≠ Project.
AI chat ≠ project conversation.
Automation ≠ financial truth.
Notifications are in-app only.

Status legend: **IMPLEMENTED** · **CONFIGURATION REQUIRED** · **DEFERRED**

## Store

**IMPLEMENTED.**

Tables: `store_products`, `store_product_prices`, `store_orders`,
`store_order_items`. Public IDs `PRD-` and `ORD-`. Slugs are validated.
Only `active` and `customer_visible` products appear on `/store`.

Pricing is explicit per currency (GBP/USD/EUR). No FX. Missing currency
means not for sale in that currency. Server recalculates price from the
database. Client-submitted unit prices are ignored.

`quote_required` products have no fabricated price and route to a work
request. V1 does not auto-create invoices for store orders.

Checkout creates a Store Order (`pending_payment`) then a Payment Request
and reuses Phase 5 Payment Core. Paid state is set only when the payment
request completes from a confirmed payment. Admin cannot mark an order
paid from Store UI.

Guest checkout collects name and email. Durable guest `ORD-` retrieval is
**DEFERRED**. Authenticated customers use `/app/orders`.

Fulfillment is manual: paid → processing → completed.

## AI

**CONFIGURATION REQUIRED** for live providers. **IMPLEMENTED** architecture
and a development-only deterministic adapter.

Tables: `ai_providers`, `ai_conversations` (`AIC-`), `ai_messages` (`AIM-`).
Assistant rows cannot be inserted by the client as the user. AI cannot
mark payments, invoices, ledger, or admin roles.

`/app/ai` is the product workspace. Marketing `/ai` is unchanged.

If no provider is configured, the page says AI is not configured. No fake
generated responses. A structured suggestion becomes a work request only
after explicit confirmation through the existing work request domain.

Development adapter: `development_test`, gated by runtime environment
`development`, `FLASH_ONE_ENABLE_DEV_AI_PROVIDER=true`, and
`NODE_ENV !== 'production'`.

Env names only: `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`,
`FLASH_ONE_ENABLE_DEV_AI_PROVIDER`.

## Automation

**IMPLEMENTED** as a conservative foundation.

`domain_outbox_events` is internal. `automation_rules` are Platform Admin
only. Actions are allowlisted: `create_notification`,
`create_admin_follow_up`, and development-only `development_fail`.

No SQL, JavaScript, shell, or HTTP from configuration. Automation cannot
create succeeded payments, allocate, refund, or change invoices.

Runs are unique per `(rule_id, event_id)`. Failure is recorded and does
not roll back the source payment/order/request. No infinite retries.

V1 seeded rules notify on `work_request.submitted` and `store_order.paid`.

## Notifications

**IMPLEMENTED.** Table `notifications` (`NTF-`). Own inbox only. Not email,
SMS, or WhatsApp. `/app/notifications` with a real unread count.

## Failure isolation

If AI is unavailable, Store, projects, invoices, and payments continue.
If automation fails, the originating domain record remains correct.
If Store is unused, work request and payment flows remain operational.

## Public navigation

`/store` exists independently. It is not added to the locked marketing
header. `/pay` remains independent. `/ai` marketing page is unchanged.

## Deferred

Real AI credentials, AI privacy/retention, RAG, advanced tools, workers,
scheduled automations, email/SMS/WhatsApp/push, license delivery,
subscriptions, inventory, discounts, VAT calculation, guest durable order
retrieval, store invoice automation, production catalog, production
providers, verified legal/contact data.
