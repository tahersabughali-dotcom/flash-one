import Link from "next/link";
import { notFound } from "next/navigation";
import { requireCompletedOnboarding } from "@/lib/server/account";
import { getWorkRequestByPublicId } from "@/lib/server/work-requests";
import { listQuotesForWorkRequest } from "@/lib/server/quotes";
import { getProjectByWorkRequestId } from "@/lib/server/projects";
import {
  SERVICE_CATEGORY_LABELS,
  WORK_REQUEST_PATHS,
  WORK_REQUEST_STATUS_LABELS,
} from "@/modules/work-requests";
import { QUOTE_PATHS, QUOTE_STATUS_LABELS } from "@/modules/quotes";
import { PROJECT_PATHS } from "@/modules/projects";

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function WorkRequestDetailPage({
  params,
}: {
  params: Promise<{ publicId: string }>;
}) {
  const { publicId } = await params;
  await requireCompletedOnboarding(WORK_REQUEST_PATHS.detail(publicId));
  const request = await getWorkRequestByPublicId(publicId);
  if (!request) {
    notFound();
  }

  const [quotes, relatedProject] = await Promise.all([
    listQuotesForWorkRequest(request.id),
    getProjectByWorkRequestId(request.id),
  ]);

  const ownerLabel = request.organizationName
    ? `Business · ${request.organizationName}`
    : "Individual";

  return (
    <main>
      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-navy/50">
        {request.publicId}
      </p>
      <h1 className="mt-3 text-3xl font-extrabold tracking-[-0.04em] text-navy-deep">
        {request.title}
      </h1>
      <p className="mt-4 text-[15px] text-muted">
        {SERVICE_CATEGORY_LABELS[request.serviceCategory]} ·{" "}
        {WORK_REQUEST_STATUS_LABELS[request.status]} · {formatDate(request.createdAt)}
      </p>
      <p className="mt-2 text-sm text-muted">{ownerLabel}</p>
      <section className="mt-8 rounded-(--radius-panel) border border-white/70 bg-white/80 p-6 shadow-(--shadow-soft)">
        <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-navy/50">
          Description
        </h2>
        <p className="mt-3 whitespace-pre-wrap text-[15px] leading-relaxed text-navy">
          {request.summary}
        </p>
        {request.details ? (
          <p className="mt-4 whitespace-pre-wrap text-[15px] leading-relaxed text-navy">
            {request.details}
          </p>
        ) : null}
        {request.budgetIndication ? (
          <p className="mt-4 text-sm text-muted">Budget: {request.budgetIndication}</p>
        ) : null}
        {request.desiredTimeline ? (
          <p className="mt-2 text-sm text-muted">Timeline: {request.desiredTimeline}</p>
        ) : null}
      </section>
      {quotes.length > 0 ? (
        <section className="mt-8">
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-navy/50">
            Quotes
          </h2>
          <ul className="mt-4 space-y-3">
            {quotes.map((quote) => (
              <li key={quote.publicId}>
                <Link
                  href={QUOTE_PATHS.detail(quote.publicId)}
                  className="block rounded-2xl border border-line bg-white px-5 py-4"
                >
                  {quote.publicId} · v{quote.version} ·{" "}
                  {QUOTE_STATUS_LABELS[quote.status]}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      {relatedProject ? (
        <p className="mt-8 text-sm">
          <Link
            href={PROJECT_PATHS.detail(relatedProject.publicId)}
            className="font-semibold text-blue"
          >
            Open project {relatedProject.publicId}
          </Link>
        </p>
      ) : null}
      <p className="mt-8 text-sm">
        <Link href={WORK_REQUEST_PATHS.list} className="font-semibold text-blue">
          Back to requests
        </Link>
      </p>
    </main>
  );
}
