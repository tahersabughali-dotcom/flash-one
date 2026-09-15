import Link from "next/link";
import { notFound } from "next/navigation";
import { requireCompletedOnboarding } from "@/lib/server/account";
import { getProjectByPublicId } from "@/lib/server/projects";
import { listContractsForProject } from "@/lib/server/contracts";
import { PROJECT_PATHS, PROJECT_STATUS_LABELS } from "@/modules/projects";
import { WORK_REQUEST_PATHS } from "@/modules/work-requests";
import { QUOTE_PATHS } from "@/modules/quotes";
import {
  CONTRACT_DOCUMENT_TYPE_LABELS,
  CONTRACT_PATHS,
  CONTRACT_STATUS_LABELS,
} from "@/modules/contracts";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ publicId: string }>;
}) {
  const { publicId } = await params;
  await requireCompletedOnboarding(PROJECT_PATHS.detail(publicId));
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
      <ul className="mt-8 space-y-2 text-[15px] text-navy">
        <li>
          Request:{" "}
          <Link
            href={WORK_REQUEST_PATHS.detail(project.workRequestPublicId)}
            className="font-semibold text-blue"
          >
            {project.workRequestPublicId}
          </Link>
        </li>
        <li>
          Accepted quote:{" "}
          <Link
            href={QUOTE_PATHS.detail(project.acceptedQuotePublicId)}
            className="font-semibold text-blue"
          >
            {project.acceptedQuotePublicId}
          </Link>
        </li>
        {project.startedAt ? <li>Started: {project.startedAt}</li> : null}
        {project.targetCompletionAt ? (
          <li>Target completion: {project.targetCompletionAt}</li>
        ) : null}
        {project.completedAt ? <li>Completed: {project.completedAt}</li> : null}
      </ul>
      {contracts.length > 0 ? (
        <section className="mt-8">
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-navy/50">
            Contract / SOW records
          </h2>
          <ul className="mt-4 space-y-3">
            {contracts.map((contract) => (
              <li key={contract.publicId}>
                <Link
                  href={CONTRACT_PATHS.detail(contract.publicId)}
                  className="block rounded-2xl border border-line bg-white px-5 py-4"
                >
                  {contract.publicId} ·{" "}
                  {CONTRACT_DOCUMENT_TYPE_LABELS[contract.documentType]} ·{" "}
                  {CONTRACT_STATUS_LABELS[contract.status]}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      <p className="mt-8 text-sm">
        <Link href={PROJECT_PATHS.list} className="font-semibold text-blue">
          Back to projects
        </Link>
      </p>
    </main>
  );
}
