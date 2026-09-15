# Flash One Platform Architecture

This document describes the current architecture boundary. It is not a product
specification. SQL foundation exists in the repository; there is no connected
database, authentication, or payments.

## 1. Public website boundary

The approved Public Website V1 is locked:

- `/`
- `/services`
- `/solutions`
- `/ai`
- `/company`
- `/contact`

These pages live at the App Router root. They must not be moved into a route
group in this phase. Their visual design, copy, and public navigation stay
unchanged.

Marketing copy remains in `data/`. Public UI remains in `components/`.

`PublicHeader` and `PublicFooter` must not link to `/app` or `/admin`.

## 2. Platform route boundary

Future platform URLs are grouped under `app/(platform)/`.

The route group name does not appear in the URL.

| URL | File | Purpose |
| --- | --- | --- |
| `/app` | `app/(platform)/app/page.tsx` | Authenticated platform home |
| `/admin` | `app/(platform)/admin/page.tsx` | Platform admin (separate from account relationships) |
| `/onboarding` | `app/(platform)/onboarding/page.tsx` | Account foundation onboarding |

Account relationships live in `modules/account/`. See
`docs/ACCOUNT_ARCHITECTURE.md`. They never grant `/admin`.

These pages are not production product surfaces. They have no login, no user
data, and no fake metrics.

Public pages were intentionally not moved into `app/(marketing)/`.

## 3. Modules structure

```
modules/
  core/            platform primitives (errors, validation, identifiers, audit)
  auth/            authentication (who is the user)
  account/         onboarding and account relationships (how they use Flash One)
  work-requests/   customer work requests
  quotes/          commercial quotes and line items
  projects/        delivery projects after quote acceptance
  contracts/       contract/SOW acknowledgment records
  shared/          small cross-domain constants safe for any layer
```

See `docs/WORKFLOW_ARCHITECTURE.md` for the work-request → quote → project
lifecycle. Payments remain a later sibling module.

Do not dump domain logic into `components/` or `data/`.

## 4. Server / client boundary

- **Server-only:** `lib/server/`
- **Client files:** keep using `"use client"` only where interactivity is
  required (today: public Header and HashScroll)
- **Default:** Server Components

Never import `@/lib/server` from a Client Component.

Database clients belong under `lib/server/database/`.
Do not import `@/lib/server` from public marketing pages.

The existing `@/*` path alias is the only alias. Do not add more.

## 5. Database boundary

One physical Postgres database is the intended target.

Logical isolation comes from modules, table ownership, stable IDs, migrations,
and RLS — not from one database per module.

SQL foundation lives in `supabase/migrations/`. See
`docs/DATABASE_ARCHITECTURE.md`.

A non-production server client exists under `lib/server/database/`.
It is not used by `/`, `/app`, or `/admin` in this phase.

## 6. Future authentication boundary

Authentication will protect `/app` and `/admin`.

`/login` and `/register` exist as platform auth routes and are not in
the public Header/Footer.

Admin authorization comes from `user_platform_roles`, not from Auth
metadata. See `docs/AUTH_ARCHITECTURE.md`.

## 7. Future payments boundary

Payments must sit behind a provider-independent Payment Core.

Adapters (PayPal, Stripe, Wise, WorldFirst, and others) come later.

No payment packages, checkout routes, or webhooks exist yet.

## 8. Error, validation, and audit principles

- **Errors:** `AppError` carries an internal `message` and a client-safe
  `safeMessage`. `toPublicError()` never returns stack traces or raw provider
  errors.
- **Validation:** all future user input is validated at the server boundary
  before business logic. Zod is not installed until a real endpoint needs it.
- **Identifiers:** internal IDs are opaque and stable. They are not sequential
  public numbers. Public IDs, if added later, are a separate type.
- **Audit:** `AuditEvent` is the application contract. `public.audit_events`
  is the SQL table. Platform routes do not query it yet.

## 9. Intentionally not implemented

- Authentication, middleware, roles
- Payments and webhooks
- Service-role application client
- Route Handlers and Server Actions
- Contact forms
- Fake dashboards, fake customers, fake metrics
- CMS for the public website
