# Flash One Authentication Architecture

Authentication answers "who is this user?". It does not model customers,
businesses, developers, or payments.

## Provider

Supabase Auth, email and password only.

Session handling uses `@supabase/ssr` cookies:

- Browser client: `lib/supabase/browser.ts`
- Session server client: `lib/supabase/server.ts`
- Non-session database client: `lib/server/database/client.ts`
- Session refresh: `proxy.ts` via `lib/supabase/update-session.ts`

Authorization is re-checked in Server Components with `getClaims()`.

## Identity vs authorization

- `auth.users` is the identity store (Supabase Auth)
- `public.profiles` is the application display profile
- `public.user_platform_roles` is server-controlled authorization

A person can later hold multiple business relationships. Those belong in
future modules, not Auth metadata.

Registration does not collect account intent. That belongs to onboarding.

## Profile creation

After `auth.users` insert, `public.handle_new_user()`:

1. Inserts `profiles` with `full_name` from signup metadata (fallback `User`)
2. Inserts `user_platform_roles` with `member`

It never grants `admin`.

## Admin assignment

No user can self-register as admin.

To grant admin in DEVELOPMENT, a privileged database operator runs:

```sql
insert into public.user_platform_roles (user_id, role)
values ('<auth-user-uuid>', 'admin');
```

Use the person's `auth.users.id`. Do not hardcode emails in application
source. Do not make the first registered user admin automatically.

Until that row exists, `/admin` shows "Not authorized" for signed-in users.

## Audit logging

`audit_events` remains server-only with no policies.

This phase does not wire a service-role write path, so Auth lifecycle
events (`auth.registered`, `auth.login`, `auth.logout`) are deferred.
Do not grant browser INSERT on `audit_events`.

## Password reset

Not implemented in this phase. Next Auth subphase:

- `/forgot-password`
- `/reset-password`

using Supabase Auth recovery. No fake reset flow.

## Public website

`/login` and `/register` exist but are not added to PublicHeader.
