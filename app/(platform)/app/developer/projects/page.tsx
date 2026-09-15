import Link from "next/link";
import { requireCompletedOnboarding } from "@/lib/server/account";
import { listAssignedDeveloperProjects } from "@/lib/server/account/portal";
import { ACCOUNT_PATHS } from "@/modules/account";
import { PROJECT_STATUS_LABELS } from "@/modules/projects";

export default async function DeveloperProjectListPage() {
  await requireCompletedOnboarding(ACCOUNT_PATHS.developerProjects);
  const projects = await listAssignedDeveloperProjects();

  return (
    <main>
      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-navy/50">
        Developer
      </p>
      <h1 className="mt-3 text-3xl font-extrabold tracking-[-0.04em] text-navy-deep">
        Assigned projects
      </h1>
      {projects.length === 0 ? (
        <p className="mt-8 text-[15px] text-muted">No assigned projects.</p>
      ) : (
        <ul className="mt-8 space-y-3">
          {projects.map((project) => (
            <li key={project.publicId}>
              <Link
                href={ACCOUNT_PATHS.developerProject(project.publicId)}
                className="block rounded-(--radius-panel) border border-white/70 bg-white/80 p-5 shadow-(--shadow-soft)"
              >
                <p className="text-xs font-semibold tracking-[0.14em] text-navy/50">
                  {project.publicId}
                </p>
                <p className="mt-2 font-extrabold text-navy-deep">{project.name}</p>
                <p className="mt-2 text-sm text-muted">{PROJECT_STATUS_LABELS[project.status]}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
