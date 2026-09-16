# Integrations

Admin UI: `/admin/integrations` and `/admin/integrations/[code]`.

Configured ≠ healthy. Secrets are never displayed.

## Supported registry entries (V1)

| Code | Capability summary | Env names (values never shown) |
| --- | --- | --- |
| PayPal | Checkout when officially wired | `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, `PAYPAL_WEBHOOK_ID`, `PAYPAL_MODE` |
| Stripe | Checkout when officially wired | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` |
| Wise | Not generic checkout | `WISE_API_TOKEN` |
| WorldFirst | Not generic checkout | `WORLDFIRST_API_TOKEN` |
| USDT | Config/UI only; no custody | `USDT_TRON_ADDRESS`, `USDT_ETHEREUM_ADDRESS` |
| OpenAI | AI chat when configured | `OPENAI_API_KEY` |
| Anthropic | AI chat when configured | `ANTHROPIC_API_KEY` |
| Email | Transactional foundation | `EMAIL_PROVIDER`, `EMAIL_API_KEY`, `EMAIL_FROM_ADDRESS` |

## Failure behavior

Missing configuration returns unavailable / fail-closed results. No fake checkout, refund, payout, AI reply, or email-sent success.

## Webhooks

Payment webhooks live under `/api/payments/webhooks/*` for providers that support them. Development synthetic confirmation is gated and never Production.

## Documentation boundary

Do not invent undocumented API behavior. Where credentials are absent, adapters keep an explicit integration boundary.
