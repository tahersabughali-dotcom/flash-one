import Link from "next/link";
import { requireCompletedOnboarding, getProfileDisplayName } from "@/lib/server/account";
import { ACCOUNT_PATHS } from "@/modules/account";
import { PageHeader } from "@/components/platform/PageHeader";
import { EmptyState } from "@/components/platform/EmptyState";
import { RecordCard } from "@/components/platform/RecordCard";
import { AdditionalRelationshipForms } from "./additional-forms";

export default async function RelationshipsPage() {
  const { session, summary } = await requireCompletedOnboarding(ACCOUNT_PATHS.relationships);
  const displayName = await getProfileDisplayName(session.userId);
  const hasRelationships =
    summary.individual || summary.organizations.length > 0 || Boolean(summary.developer);

  return (
    <main>
      <PageHeader
        eyebrow="Relationships"
        title="Your relationships"
        description="Flash One keeps identity separate from how you work with us. You can hold more than one relationship at the same time."
      />
      {displayName ? <p className="mt-2 text-sm text-muted">{displayName}</p> : null}

      {hasRelationships ? (
        <ul className="mt-8 space-y-3">
          {summary.individual ? (
            <li>
              <RecordCard
                href={ACCOUNT_PATHS.account}
                reference={summary.individualPublicId ?? undefined}
                title="Individual customer"
                meta="Personal customer relationship"
                status="individual"
                statusLabel="Individual"
              />
            </li>
          ) : null}
          {summary.organizations.map((organization) => (
            <li key={organization.publicId}>
              <RecordCard
                href={ACCOUNT_PATHS.business(organization.publicId)}
                reference={organization.publicId}
                title={organization.name}
                meta={`Organization · ${organization.role}`}
                status={organization.role}
                statusLabel={organization.role === "owner" ? "Owner" : "Member"}
              />
            </li>
          ))}
          {summary.developer ? (
            <li>
              <RecordCard
                href={ACCOUNT_PATHS.developer}
                reference={summary.developer.publicId}
                title={summary.developer.displayName}
                meta="Developer"
                status={summary.developer.availabilityStatus}
                statusLabel={summary.developer.availabilityStatus.replace(/_/g, " ")}
              />
            </li>
          ) : null}
        </ul>
      ) : (
        <EmptyState
          title="No relationships yet"
          description="Add an individual or organization relationship to request work, or a developer profile if you deliver projects."
        />
      )}

      <h2 className="mt-10 text-sm font-semibold uppercase tracking-[0.18em] text-navy/50">
        Add another relationship
      </h2>
      <AdditionalRelationshipForms
        hasIndividual={summary.individual}
        hasDeveloper={Boolean(summary.developer)}
      />
      <p className="mt-8 text-sm">
        <Link href={ACCOUNT_PATHS.account} className="font-semibold text-blue">
          Account settings
        </Link>
      </p>
    </main>
  );
}
