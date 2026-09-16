# AI

Customer/product surface: `/app/ai` (marketing `/ai` remains locked and unchanged).

## Behavior

- Conversations and messages are stored when architecture permits
- Without a configured provider, UI shows unavailable — no fabricated assistant replies
- Structured suggestions require explicit user confirmation before becoming work requests
- AI cannot mark payments, allocate invoices, change roles, or write ledger truth

## Providers

Env: `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`.
Development adapter: `development_test` gated by development runtime + `FLASH_ONE_ENABLE_DEV_AI_PROVIDER` and never Production.

## Admin

`/admin/settings/ai` and integration readiness for AI codes.
