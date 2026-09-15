# Flash One Account Architecture

Onboarding and account relationships answer **how this person wants to use
Flash One**. Authentication still answers **who the user is**.

These are not the same thing. Account relationships never grant platform
admin.

## Password recovery checkpoint

Password recovery was implemented in the previous phase and is preserved:

- `/forgot-password`
- `/reset-password`
- `/auth/callback`

**Status: PENDING END-TO-END VALIDATION**

Recovery request, API, and UI were tested successfully. The owner postponed
opening the real recovery email and completing the password-change loop.
This phase did not retest that loop. Do not treat recovery as fully
validated.

## Deferred items register

These are known and intentionally not implemented in this checkpoint.
They are NON-BLOCKING unless a later audit finds a real security defect.

- [ ] Password recovery: owner must open the legitimate recovery email,
      follow the link, set a new password, and sign in with that password
      (**PENDING END-TO-END VALIDATION**)
- [ ] Additional-relationship UI after the first onboarding path
- [ ] Organization member invitations
- [ ] Organization owner name editing
- [ ] Developer profile editing after onboarding
- [ ] Supabase leaked-password protection review
- [ ] Intentional `create_organization` SECURITY DEFINER advisor warning
      (see Organization creation consistency)
- [ ] Index usefulness / performance review when traffic exists
- [ ] Guest/public work requests
- [ ] VAT/tax configuration for quotes
- [ ] Approved legal contract templates
- [ ] Work-request email notifications

## Future final audit checklist

Include the deferred items above in the later full-system audit. Do not
treat password recovery as fully validated until the email-link loop is
completed.

## Identity vs relationship

| Concern | Store |
| --- | --- |
| Who is the user? | `auth.users`, `profiles`, session |
| Platform admin? | `user_platform_roles.admin` only |
| Individual / client? | `individual_accounts` |
| Business / company? | `organizations` + `organization_memberships` |
| Developer / freelancer? | `developer_profiles` |
| Finished first onboarding? | `account_onboarding` |

`developer`, `business`, and `client` are **not** equivalent to `admin`.

Creating a company never grants `/admin`.

## Individual-model decision

Display name, email, and identity stay on Auth + `profiles`.

A dedicated `individual_accounts` row records the **client/individual
relationship** without duplicating profile fields. That keeps Individual +
Developer (or Individual + Business) possible later. A single irreversible
`profiles.account_type = 'client'` column is not used.

## Organizations

Minimal business entity: `id`, `public_id`, `name`, `created_at`,
`updated_at`.

No bank, tax, VAT, Companies House, KYC, or financial fields.

`id` is an InternalId (UUID). `public_id` is a PublicId (`org_` + 20 hex).
Sequential database identifiers are not exposed.

## Organization membership

Users connect through `organization_memberships`.

Roles are only `owner` and `member`. This is domain ownership, not
enterprise permissions and not platform admin.

The creator of an organization becomes `owner` in the same transaction as
the organization insert, via `public.create_organization(p_name)`.

## Developer profiles

Minimal identity: `user_id`, `public_id`, `display_name`, `headline`, `bio`,
`availability_status`, timestamps.

No skills marketplace, rates, portfolio, payments, commissions, contracts,
ratings, or KYC.

`public_id` uses `dev_` + 20 hex.

## Onboarding status

`account_onboarding.status` is application-owned and database-backed:

- missing row → `not_started`
- `not_started`
- `in_progress`
- `completed`

It is not Auth metadata.

`/app` redirects to `/onboarding` when status is not `completed`.
`/admin` does not depend on onboarding.

Onboarding writes use INSERT, then UPDATE on unique conflict. They do not
use PostgREST upsert, which requires UPDATE on every inserted column.

## Multi-relationship strategy

The first screen asks for one starting path. The schema does not lock a
person to that path.

A user may later hold Individual + Developer, Business membership +
Developer, or memberships in multiple organizations. Additional-path UI is
deferred.

## Organization creation consistency

`create_organization(p_name text)` is `SECURITY DEFINER` so organization
insert and owner membership happen in one transaction without an
authenticated `INSERT` policy on those tables.

Confirmed controls:

- `auth.uid()` is required; unauthenticated calls fail
- Owner identity is only `auth.uid()`, never a caller-supplied user id
- Organization + owner membership are created atomically
- `search_path` is fixed to `pg_catalog, public`
- `EXECUTE` is revoked from `PUBLIC` and `anon`, then granted to
  `authenticated`
- The only argument is a trimmed organization name; it is not SQL
- The function does not write `user_platform_roles` and does not grant
  platform admin

Supabase security advisors warn that authenticated users can execute this
`SECURITY DEFINER` function. That warning is **intentional**. The function
is the supported creation path. Defer advisor cleanup to the final
security audit unless a later review finds a real defect.

There is no authenticated INSERT policy on `organizations` or
`organization_memberships`. No service-role key is used.

## Routes

| URL | Access |
| --- | --- |
| `/onboarding` | Authenticated. Unauthenticated users go to `/login`. Completed users go to `/app`. |
| `/onboarding/individual` | Authenticated |
| `/onboarding/business` | Authenticated |
| `/onboarding/developer` | Authenticated |
| `/app` | Authenticated and onboarding completed |

Public marketing navigation is unchanged.

## What this module does not include

Payments, invoices, projects, quotes, contracts, ledger, store,
communications, or a dashboard with fake metrics.
