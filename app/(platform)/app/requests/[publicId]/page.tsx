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
import { formatDisplayDate } from "@/lib/format/display";
import { PageHeader } from "@/components/platform/PageHeader";
import { SectionPanel } from "@/components/platform/SectionPanel";
import { StatusBadge } from "@/components/platform/StatusBadge";
import { RecordCard } from "@/components/platform/RecordCard";

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
    ? `Organization · ${request.organizationName}`
    : "Individual";

  return (
    <main>
      <PageHeader
        eyebrow={request.publicId}
        title={request.title}
        description={`${SERVICE_CATEGORY_LABELS[request.serviceCategory]} · ${ownerLabel} · ${formatDisplayDate(request.createdAt)}`}
        actions={
          <StatusBadge
            status={request.status}
            label={WORK_REQUEST_STATUS_LABELS[request.status]}
          />
        }
      />
      <SectionPanel title="Description">
        <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-navy">
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
      </SectionPanel>
      <SectionPanel title="Quotes">
        {quotes.length === 0 ? (
          <p className="text-[15px] text-muted">
            No quote has been issued yet. Flash One reviews the request first.
          </p>
        ) : (
          <ul className="space-y-3">
            {quotes.map((quote) => (
              <li key={quote.publicId}>
                <RecordCard
                  href={QUOTE_PATHS.detail(quote.publicId)}
                  reference={quote.publicId}
                  title={`Quote v${quote.version}`}
                  status={quote.status}
                  statusLabel={QUOTE_STATUS_LABELS[quote.status]}
                />
              </li>
            ))}
          </ul>
        )}
      </SectionPanel>
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
