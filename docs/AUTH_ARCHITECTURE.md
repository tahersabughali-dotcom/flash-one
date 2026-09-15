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

`/forgot-password` requests a Supabase Auth recovery email with
`resetPasswordForEmail()`. The public response does not reveal whether the
address has an account.

The recovery email returns to `/auth/callback` on the current development
origin. That route exchanges the PKCE authorization code (or a recovery
`token_hash`) and then sends the user to `/reset-password`.

`/reset-password` updates the password with `auth.updateUser({ password })`
only when a verified recovery session and a short-lived recovery cookie are
both present. After a successful update the recovery session is signed out
and the user signs in again with the new password.

No custom reset-token tables. No service-role in this flow.

**Status: PENDING END-TO-END VALIDATION.** Request, API, and UI were tested.
The owner postponed opening the real recovery email and completing the
password-change loop. Do not treat this flow as fully validated. Include it
in the future final audit checklist (`docs/ACCOUNT_ARCHITECTURE.md`).

## Public website

`/login` and `/register` exist but are not added to PublicHeader.
