import Link from "next/link";
import { requireCompletedOnboarding } from "@/lib/server/account";
import { listWorkRequests } from "@/lib/server/work-requests";
import { parseListPage } from "@/lib/server/pagination";
import { ListPager } from "@/components/platform/ListPager";
import { PageHeader } from "@/components/platform/PageHeader";
import { EmptyState } from "@/components/platform/EmptyState";
import { RecordCard } from "@/components/platform/RecordCard";
import { formatDisplayDate } from "@/lib/format/display";
import {
  SERVICE_CATEGORY_LABELS,
  WORK_REQUEST_PATHS,
  WORK_REQUEST_STATUS_LABELS,
} from "@/modules/work-requests";

export default async function WorkRequestListPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  await requireCompletedOnboarding(WORK_REQUEST_PATHS.list);
  const page = parseListPage((await searchParams).page);
  const requests = await listWorkRequests(page);

  return (
    <main>
      <PageHeader
        eyebrow="Work requests"
        title="Requests"
        description="Describe the work. A quote is issued later. Submitting a request is not an instant quote."
        actions={
          <Link
            href={WORK_REQUEST_PATHS.new}
            className="inline-flex items-center justify-center rounded-(--radius-button) bg-blue px-5 py-2.5 text-sm font-semibold text-white shadow-(--shadow-button)"
          >
            New request
          </Link>
        }
      />
      {requests.length === 0 ? (
        <EmptyState
          title="No requests yet"
          description="Start with a work request when you have something Flash One should review."
          actionHref={WORK_REQUEST_PATHS.new}
          actionLabel="New request"
        />
      ) : (
        <ul className="mt-8 space-y-3">
          {requests.map((request) => (
            <li key={request.publicId}>
              <RecordCard
                href={WORK_REQUEST_PATHS.detail(request.publicId)}
                reference={request.publicId}
                title={request.title}
                status={request.status}
                statusLabel={WORK_REQUEST_STATUS_LABELS[request.status]}
                meta={`${SERVICE_CATEGORY_LABELS[request.serviceCategory]} · ${formatDisplayDate(request.createdAt)}`}
              />
            </li>
          ))}
        </ul>
      )}
      <ListPager page={page} itemCount={requests.length} />
    </main>
  );
}
