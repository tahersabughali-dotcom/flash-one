import { requirePlatformAdmin } from "@/lib/server/auth";
import { listWorkRequests } from "@/lib/server/work-requests";
import { parseListPage } from "@/lib/server/pagination";
import { ListPager } from "@/components/platform/ListPager";
import { PageHeader } from "@/components/platform/PageHeader";
import { EmptyState } from "@/components/platform/EmptyState";
import { RecordCard } from "@/components/platform/RecordCard";
import {
  SERVICE_CATEGORY_LABELS,
  WORK_REQUEST_PATHS,
  WORK_REQUEST_STATUS_LABELS,
} from "@/modules/work-requests";

export default async function AdminRequestListPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  await requirePlatformAdmin(WORK_REQUEST_PATHS.adminList);
  const page = parseListPage((await searchParams).page);
  const requests = await listWorkRequests(page);

  return (
    <main>
      <PageHeader
        eyebrow="Delivery"
        title="Requests"
        description="Review submitted work and issue quotes from the request detail."
      />
      {requests.length === 0 ? (
        <EmptyState title="No requests" description="Customer work requests will appear here." />
      ) : (
        <ul className="mt-8 space-y-3">
          {requests.map((request) => (
            <li key={request.publicId}>
              <RecordCard
                href={WORK_REQUEST_PATHS.adminDetail(request.publicId)}
                reference={request.publicId}
                title={request.title}
                status={request.status}
                statusLabel={WORK_REQUEST_STATUS_LABELS[request.status]}
                meta={SERVICE_CATEGORY_LABELS[request.serviceCategory]}
              />
            </li>
          ))}
        </ul>
      )}
      <ListPager page={page} itemCount={requests.length} />
    </main>
  );
}
