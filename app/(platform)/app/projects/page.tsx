import { requireCompletedOnboarding } from "@/lib/server/account";
import { listCustomerProjects } from "@/lib/server/projects";
import { parseListPage } from "@/lib/server/pagination";
import { ListPager } from "@/components/platform/ListPager";
import { PageHeader } from "@/components/platform/PageHeader";
import { EmptyState } from "@/components/platform/EmptyState";
import { RecordCard } from "@/components/platform/RecordCard";
import { formatDisplayDate } from "@/lib/format/display";
import { PROJECT_PATHS, PROJECT_STATUS_LABELS } from "@/modules/projects";
import { WORK_REQUEST_PATHS } from "@/modules/work-requests";

export default async function ProjectListPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { session } = await requireCompletedOnboarding(PROJECT_PATHS.list);
  const page = parseListPage((await searchParams).page);
  const projects = await listCustomerProjects(session.userId, page);

  return (
    <main>
      <PageHeader
        eyebrow="Projects"
        title="Projects"
        description="Projects appear after a quote is accepted. This list is your customer delivery workspace."
      />
      {projects.length === 0 ? (
        <EmptyState
          title="No projects yet"
          description="A project is created after you accept an eligible quote."
          actionHref={WORK_REQUEST_PATHS.list}
          actionLabel="View requests"
        />
      ) : (
        <ul className="mt-8 space-y-3">
          {projects.map((project) => (
            <li key={project.publicId}>
              <RecordCard
                href={PROJECT_PATHS.detail(project.publicId)}
                reference={project.publicId}
                title={project.name}
                status={project.status}
                statusLabel={PROJECT_STATUS_LABELS[project.status]}
                meta={formatDisplayDate(project.createdAt)}
              />
            </li>
          ))}
        </ul>
      )}
      <ListPager page={page} itemCount={projects.length} />
    </main>
  );
}
