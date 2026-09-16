import { requireCompletedOnboarding } from "@/lib/server/account";
import { listAssignedDeveloperProjects } from "@/lib/server/account/portal";
import { ACCOUNT_PATHS } from "@/modules/account";
import { PROJECT_STATUS_LABELS } from "@/modules/projects";
import { PageHeader } from "@/components/platform/PageHeader";
import { EmptyState } from "@/components/platform/EmptyState";
import { RecordCard } from "@/components/platform/RecordCard";

export default async function DeveloperProjectListPage() {
  await requireCompletedOnboarding(ACCOUNT_PATHS.developerProjects);
  const projects = await listAssignedDeveloperProjects();

  return (
    <main>
      <PageHeader
        eyebrow="Developer"
        title="Assigned projects"
        description="Only projects assigned to you. This workspace does not include customer invoices or payments."
      />
      {projects.length === 0 ? (
        <EmptyState
          title="No assigned projects"
          description="Assigned delivery work will appear here after an administrator assigns you to a project."
        />
      ) : (
        <ul className="mt-8 space-y-3">
          {projects.map((project) => (
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
    </main>
  );
}
