# Environment configuration

Names only. Never commit real values.

Copy `.env.example` to `.env.local` for local development.

## Required (core)

| Variable | Scope | Notes |
| --- | --- | --- |
| `SUPABASE_URL` | server | Project URL |
| `SUPABASE_PUBLISHABLE_KEY` | server | Publishable key |
| `NEXT_PUBLIC_SUPABASE_URL` | browser | Same URL for SSR Auth |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | browser | Publishable; RLS still applies |
| `SUPABASE_SECRET_KEY` | server | Privileged ingest only |

Legacy alias: `SUPABASE_SERVICE_ROLE_KEY` if secret key unset.

## Payments (optional — fail closed)

`PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, `PAYPAL_WEBHOOK_ID`, `PAYPAL_MODE`,
`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`,
`WISE_API_TOKEN`, `WORLDFIRST_API_TOKEN`,
`USDT_TRON_ADDRESS`, `USDT_ETHEREUM_ADDRESS`

## AI (optional — fail closed)

`OPENAI_API_KEY`, `ANTHROPIC_API_KEY`

## Email (optional — fail closed)

`EMAIL_PROVIDER`, `EMAIL_API_KEY`, `EMAIL_FROM_ADDRESS`, `EMAIL_FROM_NAME`, `EMAIL_REPLY_TO`

## Development-only gates

`FLASH_ONE_ENABLE_DEV_PAYMENT_PROVIDER`, `FLASH_ONE_ENABLE_DEV_AI_PROVIDER`

Must never be enabled in Production. Adapters also check runtime environment.

## Production-only readiness (not auto-configured)

Malware scanner provider keys, backup/PITR evidence, domain/DNS, Vercel project secrets.
