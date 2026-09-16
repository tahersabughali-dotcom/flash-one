import { requirePlatformAdmin } from "@/lib/server/auth";
import { listProjects } from "@/lib/server/projects";
import { parseListPage } from "@/lib/server/pagination";
import { ListPager } from "@/components/platform/ListPager";
import { PageHeader } from "@/components/platform/PageHeader";
import { EmptyState } from "@/components/platform/EmptyState";
import { RecordCard } from "@/components/platform/RecordCard";
import { PROJECT_PATHS, PROJECT_STATUS_LABELS } from "@/modules/projects";

export default async function AdminProjectListPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  await requirePlatformAdmin(PROJECT_PATHS.adminList);
  const page = parseListPage((await searchParams).page);
  const projects = await listProjects(page);

  return (
    <main>
      <PageHeader
        eyebrow="Delivery"
        title="Projects"
        description="Operational project records created from accepted quotes."
      />
      {projects.length === 0 ? (
        <EmptyState title="No projects" description="Projects appear after a quote is accepted." />
      ) : (
        <ul className="mt-8 space-y-3">
          {projects.map((project) => (
            <li key={project.publicId}>
              <RecordCard
                href={PROJECT_PATHS.adminDetail(project.publicId)}
                reference={project.publicId}
                title={project.name}
                status={project.status}
                statusLabel={PROJECT_STATUS_LABELS[project.status]}
              />
            </li>
          ))}
        </ul>
      )}
      <ListPager page={page} itemCount={projects.length} />
    </main>
  );
}
