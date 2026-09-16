import Link from "next/link";
import { notFound } from "next/navigation";
import { requireCompletedOnboarding } from "@/lib/server/account";
import { getDeveloperProfileByUserId } from "@/lib/server/developers/queries";
import { listAssignedDeveloperProjects } from "@/lib/server/account/portal";
import { ACCOUNT_PATHS } from "@/modules/account";
import { PROJECT_STATUS_LABELS } from "@/modules/projects";
import { PageHeader } from "@/components/platform/PageHeader";
import { SectionPanel } from "@/components/platform/SectionPanel";
import { StatusBadge } from "@/components/platform/StatusBadge";
import { RecordCard } from "@/components/platform/RecordCard";
import { DeveloperProfileForm } from "./profile-form";

export default async function DeveloperProfilePage() {
  const { session } = await requireCompletedOnboarding(ACCOUNT_PATHS.developer);
  const profile = await getDeveloperProfileByUserId(session.userId);
  if (!profile) {
    notFound();
  }
  const assignments = await listAssignedDeveloperProjects();

  return (
    <main>
      <PageHeader
        eyebrow={profile.publicId}
        title="Developer profile"
        description="This profile is account data, not a public marketplace listing. Customer invoices and payments are not part of this workspace."
        actions={
          <StatusBadge
            status={profile.availabilityStatus}
            label={profile.availabilityStatus.replace(/_/g, " ")}
          />
        }
      />
      <p className="mt-4 text-sm">
        <Link href={ACCOUNT_PATHS.developerProjects} className="font-semibold text-blue">
          Assigned projects
        </Link>
      </p>
      <SectionPanel title="Skills">
        {profile.skills.length === 0 ? (
          <p className="text-[15px] text-muted">No skills listed yet.</p>
        ) : (
          <p className="text-[15px] text-navy">{profile.skills.join(", ")}</p>
        )}
      </SectionPanel>
      <SectionPanel title="Links">
        {profile.links.length === 0 ? (
          <p className="text-[15px] text-muted">No links listed yet.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {profile.links.map((link) => (
              <li key={link.url}>
                <a href={link.url} className="font-semibold text-blue" rel="noreferrer">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        )}
      </SectionPanel>
      <SectionPanel title="Assignments">
        {assignments.length === 0 ? (
          <p className="text-[15px] text-muted">No assigned projects yet.</p>
        ) : (
          <ul className="space-y-3">
            {assignments.slice(0, 6).map((project) => (
              <li key={project.publicId}>
                <RecordCard
                  href={ACCOUNT_PATHS.developerProject(project.publicId)}
                  reference={project.publicId}
                  title={project.name}
                  status={project.status}
                  statusLabel={PROJECT_STATUS_LABELS[project.status]}
                />
              </li>
            ))}
          </ul>
        )}
      </SectionPanel>
      <DeveloperProfileForm
        displayName={profile.displayName}
        headline={profile.headline}
        bio={profile.bio}
        availabilityStatus={profile.availabilityStatus}
        country={profile.country}
        timezone={profile.timezone}
        skills={profile.skills}
        links={profile.links}
      />
    </main>
  );
}
