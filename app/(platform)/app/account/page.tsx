import Link from "next/link";
import { requireCompletedOnboarding, getProfileDisplayName } from "@/lib/server/account";
import { ACCOUNT_PATHS } from "@/modules/account";
import { AUTH_PATHS } from "@/modules/auth";
import { logoutAction } from "@/app/(auth)/actions";
import { PageHeader } from "@/components/platform/PageHeader";
import { SectionPanel } from "@/components/platform/SectionPanel";
import { AccountProfileForm } from "./profile-form";

export default async function AccountSettingsPage() {
  const { session, summary } = await requireCompletedOnboarding(ACCOUNT_PATHS.account);
  const displayName = (await getProfileDisplayName(session.userId)) ?? "";

  return (
    <main>
      <PageHeader
        eyebrow="Account"
        title="Settings"
        description="Your sign-in identity stays on the authentication account. This page only edits the display name stored in Flash One."
      />

      <SectionPanel title="Identity">
        <dl className="space-y-3 text-[15px]">
          <div>
            <dt className="text-sm text-muted">Email</dt>
            <dd className="mt-1 font-semibold text-navy-deep">{session.email ?? "Not available from this session"}</dd>
          </div>
        </dl>
        <div className="mt-6">
          <AccountProfileForm fullName={displayName} />
        </div>
      </SectionPanel>

      <SectionPanel title="Relationships">
        <ul className="space-y-2 text-[15px] text-navy">
          {summary.individual ? (
            <li>
              Individual customer
              {summary.individualPublicId ? ` · ${summary.individualPublicId}` : ""}
            </li>
          ) : null}
          {summary.organizations.map((organization) => (
            <li key={organization.publicId}>
              <Link href={ACCOUNT_PATHS.business(organization.publicId)} className="font-semibold text-blue">
                {organization.name}
              </Link>{" "}
              · {organization.role} · {organization.publicId}
            </li>
          ))}
          {summary.developer ? (
            <li>
              <Link href={ACCOUNT_PATHS.developer} className="font-semibold text-blue">
                Developer · {summary.developer.displayName}
              </Link>
            </li>
          ) : null}
        </ul>
        {summary.individual || summary.organizations.length > 0 || summary.developer ? null : (
          <p className="text-[15px] text-muted">No relationships yet.</p>
        )}
        <p className="mt-4 text-sm">
          <Link href={ACCOUNT_PATHS.relationships} className="font-semibold text-blue">
            Manage relationships
          </Link>
        </p>
      </SectionPanel>

      <SectionPanel title="Password">
        <p className="text-[15px] text-muted">
          Password changes use the existing email recovery flow. Flash One does not change passwords from this page.
        </p>
        <p className="mt-4 text-sm">
          <Link href={AUTH_PATHS.forgotPassword} className="font-semibold text-blue">
            Request a password reset
          </Link>
        </p>
      </SectionPanel>

      {summary.developer ? (
        <p className="mt-6 text-sm">
          <Link href={ACCOUNT_PATHS.developer} className="font-semibold text-blue">
            Developer profile
          </Link>
        </p>
      ) : null}

      <form action={logoutAction} className="mt-8">
        <button
          type="submit"
          className="inline-flex items-center justify-center rounded-(--radius-button) border border-line bg-white px-5 py-2.5 text-sm font-semibold text-navy"
        >
          Sign out
        </button>
      </form>
    </main>
  );
}
