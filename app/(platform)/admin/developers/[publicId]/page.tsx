import { notFound } from "next/navigation";
import Link from "next/link";
import { requirePlatformAdmin } from "@/lib/server/auth";
import { ADMIN_PATHS } from "@/modules/account";
import {
  getDeveloperProfileByPublicId,
  listDeveloperAssignments,
} from "@/lib/server/developers/queries";
import { PROJECT_PATHS } from "@/modules/projects";
import { AssignDeveloperForm, UnassignDeveloperForm } from "../assignment-forms";

export default async function AdminDeveloperDetailPage({
  params,
}: {
  params: Promise<{ publicId: string }>;
}) {
  const { publicId } = await params;
  const access = await requirePlatformAdmin(ADMIN_PATHS.developer(publicId));
  if (!access.authorized) {
    notFound();
  }
  const developer = await getDeveloperProfileByPublicId(publicId);
  if (!developer) {
    notFound();
  }
  const assignments = await listDeveloperAssignments(developer.userId);

  return (
    <main>
      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-navy/50">
        {developer.publicId}
      </p>
      <h1 className="mt-3 text-3xl font-extrabold tracking-[-0.04em] text-navy-deep">
        {developer.displayName}
      </h1>
      {developer.headline ? <p className="mt-4 text-[15px]">{developer.headline}</p> : null}
      <p className="mt-2 text-sm text-muted">{developer.availabilityStatus}</p>
      {developer.skills.length > 0 ? (
        <p className="mt-4 text-sm">{developer.skills.join(", ")}</p>
      ) : null}
      {developer.links.length > 0 ? (
        <ul className="mt-4 space-y-1 text-sm">
          {developer.links.map((link) => (
            <li key={link.url}>
              <a href={link.url} className="font-semibold text-blue" rel="noreferrer">
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      ) : null}
      <section className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-navy/50">
          Assignments
        </h2>
        {assignments.length === 0 ? (
          <p className="mt-4 text-sm text-muted">No assignments yet.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {assignments.map((assignment) => (
              <li key={`${assignment.projectPublicId}-${assignment.assignedAt}`} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-white px-5 py-4">
                <div>
                  <Link href={PROJECT_PATHS.adminDetail(assignment.projectPublicId)} className="font-semibold text-blue">
                    {assignment.projectName}
                  </Link>
                  <p className="text-sm text-muted">{assignment.status}</p>
                </div>
                {assignment.status === "active" ? (
                  <UnassignDeveloperForm
                    developerPublicId={developer.publicId}
                    projectPublicId={assignment.projectPublicId}
                  />
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>
      <AssignDeveloperForm developerPublicId={developer.publicId} />
    </main>
  );
}
