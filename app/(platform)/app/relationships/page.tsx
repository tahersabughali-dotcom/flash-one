import Link from "next/link";
import { requireCompletedOnboarding, getProfileDisplayName } from "@/lib/server/account";
import { ACCOUNT_PATHS } from "@/modules/account";
import { AdditionalRelationshipForms } from "./additional-forms";

export default async function RelationshipsPage() {
  const { session, summary } = await requireCompletedOnboarding(ACCOUNT_PATHS.relationships);
  const displayName = await getProfileDisplayName(session.userId);

  return (
    <main>
      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-navy/50">
        Relationships
      </p>
      <h1 className="mt-3 text-3xl font-extrabold tracking-[-0.04em] text-navy-deep">
        Your relationships
      </h1>
      <p className="mt-4 text-[15px] leading-relaxed text-muted">
        Flash One keeps identity separate from how you work with us. You can hold
        more than one relationship at the same time.
      </p>
      {displayName ? <p className="mt-2 text-sm text-muted">{displayName}</p> : null}

      <ul className="mt-8 space-y-3">
        {summary.individual ? (
          <li className="rounded-(--radius-panel) border border-white/70 bg-white/80 p-5 shadow-(--shadow-soft)">
            <p className="text-xs font-semibold tracking-[0.14em] text-navy/50">
              {summary.individualPublicId}
            </p>
            <p className="mt-2 font-extrabold text-navy-deep">Individual customer</p>
          </li>
        ) : null}
        {summary.organizations.map((organization) => (
          <li key={organization.publicId}>
            <Link
              href={ACCOUNT_PATHS.business(organization.publicId)}
              className="block rounded-(--radius-panel) border border-white/70 bg-white/80 p-5 shadow-(--shadow-soft)"
            >
              <p className="text-xs font-semibold tracking-[0.14em] text-navy/50">
                {organization.publicId}
              </p>
              <p className="mt-2 font-extrabold text-navy-deep">{organization.name}</p>
              <p className="mt-1 text-sm text-muted">Business · {organization.role}</p>
            </Link>
          </li>
        ))}
        {summary.developer ? (
          <li>
            <Link
              href={ACCOUNT_PATHS.developer}
              className="block rounded-(--radius-panel) border border-white/70 bg-white/80 p-5 shadow-(--shadow-soft)"
            >
              <p className="text-xs font-semibold tracking-[0.14em] text-navy/50">
                {summary.developer.publicId}
              </p>
              <p className="mt-2 font-extrabold text-navy-deep">{summary.developer.displayName}</p>
              <p className="mt-1 text-sm text-muted">Developer</p>
            </Link>
          </li>
        ) : null}
      </ul>
      {summary.individual || summary.organizations.length > 0 || summary.developer ? null : (
        <p className="mt-8 text-[15px] text-muted">No relationships yet.</p>
      )}

      <h2 className="mt-10 text-sm font-semibold uppercase tracking-[0.18em] text-navy/50">
        Add another relationship
      </h2>
      <AdditionalRelationshipForms
        hasIndividual={summary.individual}
        hasDeveloper={Boolean(summary.developer)}
      />
    </main>
  );
}
