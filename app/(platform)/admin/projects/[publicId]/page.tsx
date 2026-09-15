import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePlatformAdmin } from "@/lib/server/auth";
import { logoutAction } from "@/app/(auth)/actions";
import { getProjectByPublicId } from "@/lib/server/projects";
import { listContractsForProject } from "@/lib/server/contracts";
import { PROJECT_PATHS, PROJECT_STATUS_LABELS } from "@/modules/projects";
import { WORK_REQUEST_PATHS } from "@/modules/work-requests";
import { QUOTE_PATHS } from "@/modules/quotes";
import { CONTRACT_PATHS, CONTRACT_STATUS_LABELS } from "@/modules/contracts";
import { AdminProjectStatusForm } from "../status-form";

export default async function AdminProjectDetailPage({
  params,
}: {
  params: Promise<{ publicId: string }>;
}) {
  const { publicId } = await params;
  const access = await requirePlatformAdmin(PROJECT_PATHS.adminDetail(publicId));
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

  const project = await getProjectByPublicId(publicId);
  if (!project) {
    notFound();
  }
  const contracts = await listContractsForProject(project.id);

  return (
    <main>
      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-navy/50">
        {project.publicId}
      </p>
      <h1 className="mt-3 text-3xl font-extrabold tracking-[-0.04em] text-navy-deep">
        {project.name}
      </h1>
      <p className="mt-4 text-[15px] text-muted">
        {PROJECT_STATUS_LABELS[project.status]}
      </p>
      <ul className="mt-6 space-y-2 text-sm">
        <li>
          Request{" "}
          <Link
            href={WORK_REQUEST_PATHS.adminDetail(project.workRequestPublicId)}
            className="font-semibold text-blue"
          >
            {project.workRequestPublicId}
          </Link>
        </li>
        <li>
          Quote{" "}
          <Link href={QUOTE_PATHS.detail(project.acceptedQuotePublicId)} className="font-semibold text-blue">
            {project.acceptedQuotePublicId}
          </Link>
        </li>
      </ul>
      <AdminProjectStatusForm publicId={project.publicId} currentStatus={project.status} />
      {contracts.map((contract) => (
        <p key={contract.publicId} className="mt-4 text-sm">
          <Link href={CONTRACT_PATHS.detail(contract.publicId)} className="font-semibold text-blue">
            {contract.publicId}
          </Link>{" "}
          · {CONTRACT_STATUS_LABELS[contract.status]}
        </p>
      ))}
    </main>
  );
}
