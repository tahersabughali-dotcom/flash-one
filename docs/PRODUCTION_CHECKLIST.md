# Production checklist

**Do not execute this checklist as part of Build Completion 5/5.**
Owner approval is required before Production deployment.

## Database

- [ ] Production Supabase project created (separate from Development)
- [ ] Migration strategy agreed
- [ ] **F-MIG-001 resolved** (MUST RESOLVE BEFORE PRODUCTION)
- [ ] Forward migrations applied cleanly
- [ ] RLS / FORCE RLS verified on new tables
- [ ] Backups enabled
- [ ] PITR enabled / verified
- [ ] Restore drill recorded (last verified restore)

## Authentication

- [ ] Auth URL / redirect URLs for Production domain
- [ ] Password recovery mailbox E2E tested
- [ ] Leaked-password protection configured (plan/dashboard item)
- [ ] Session cookie domains correct

## Secrets & environment

- [ ] All Production secrets set in host (never committed)
- [ ] No Development gates enabled (`FLASH_ONE_ENABLE_DEV_*` false/absent)
- [ ] Service-role / secret key scoped and rotated if needed

## Payments

- [ ] PayPal Production credentials + webhook endpoint verified
- [ ] Stripe Production credentials + webhook verified
- [ ] Wise/WorldFirst only if actually used (capability-truthful)
- [ ] USDT only if used (no custody keys)
- [ ] Fail-closed behavior confirmed when a provider is disabled

## AI / Email / Files

- [ ] AI provider Production key
- [ ] Email provider + from address + domain authentication
- [ ] Storage buckets private
- [ ] Malware scanner configured or explicitly deferred with `unavailable` status

## Company & legal

- [ ] Verified company legal fields entered (no invention)
- [ ] Privacy / Terms / Cookie content verified before public links appear
- [ ] Brand website remains flashone.uk / www.flashone.uk

## Domain / hosting

- [ ] Domain / DNS
- [ ] Vercel (or host) Production project
- [ ] HTTPS and canonical host

## Testing before go-live

- [ ] Smoke tests (auth, customer journey, pay entry, admin ops)
- [ ] Responsive checks
- [ ] Security regression on payment ingest / RLS
- [ ] Financial regression (allocation, receipt, refund display)
- [ ] Development fixture cleanup strategy executed safely

## Explicit non-goals of this checklist run

- No Production deploy from Build Completion phase
- No final forensic audit substitution
- No invented credentials or company data
