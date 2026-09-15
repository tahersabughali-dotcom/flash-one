import Link from "next/link";
import { requirePlatformAdmin } from "@/lib/server/auth";
import { logoutAction } from "@/app/(auth)/actions";
import { listProjects } from "@/lib/server/projects";
import { parseListPage } from "@/lib/server/pagination";
import { ListPager } from "@/components/platform/ListPager";
import { PROJECT_PATHS, PROJECT_STATUS_LABELS } from "@/modules/projects";

export default async function AdminProjectListPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const access = await requirePlatformAdmin(PROJECT_PATHS.adminList);
  if (!access.authorized) {
    return (
      <main>
        <h1 className="text-3xl font-extrabold text-navy-deep">Not authorized</h1>
        <form action={logoutAction} className="mt-8">
          <button
            type="submit"
            className="rounded-(--radius-button) border border-line bg-white px-5 py-2.5 text-sm font-semibold"
          >
            Sign out
          </button>
        </form>
      </main>
    );
  }

  const page = parseListPage((await searchParams).page);
  const projects = await listProjects(page);

  return (
    <main>
      <h1 className="text-3xl font-extrabold tracking-[-0.04em] text-navy-deep">
        Projects
      </h1>
      {projects.length === 0 ? (
        <p className="mt-8 text-[15px] text-muted">No projects.</p>
      ) : (
        <ul className="mt-8 space-y-3">
          {projects.map((project) => (
            <li key={project.publicId}>
              <Link
                href={PROJECT_PATHS.adminDetail(project.publicId)}
                className="block rounded-(--radius-panel) border border-white/70 bg-white/80 p-5 shadow-(--shadow-soft)"
              >
                <p className="text-xs font-semibold tracking-[0.14em] text-navy/50">
                  {project.publicId}
                </p>
                <p className="mt-2 font-extrabold text-navy-deep">{project.name}</p>
                <p className="mt-2 text-sm text-muted">
                  {PROJECT_STATUS_LABELS[project.status]}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
      <ListPager page={page} itemCount={projects.length} />
    </main>
  );
}
