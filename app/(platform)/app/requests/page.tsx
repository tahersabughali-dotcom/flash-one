import Link from "next/link";
import { requireCompletedOnboarding } from "@/lib/server/account";
import { listWorkRequests } from "@/lib/server/work-requests";
import { parseListPage } from "@/lib/server/pagination";
import { ListPager } from "@/components/platform/ListPager";
import {
  SERVICE_CATEGORY_LABELS,
  WORK_REQUEST_PATHS,
  WORK_REQUEST_STATUS_LABELS,
} from "@/modules/work-requests";

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

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
      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-navy/50">
        Work requests
      </p>
      <h1 className="mt-3 text-3xl font-extrabold tracking-[-0.04em] text-navy-deep">
        Requests
      </h1>
      <p className="mt-4">
        <Link
          href={WORK_REQUEST_PATHS.new}
          className="inline-flex items-center justify-center rounded-(--radius-button) bg-blue px-5 py-2.5 text-sm font-semibold text-white shadow-(--shadow-button)"
        >
          New request
        </Link>
      </p>
      {requests.length === 0 ? (
        <p className="mt-8 text-[15px] text-muted">No requests yet.</p>
      ) : (
        <ul className="mt-8 space-y-3">
          {requests.map((request) => (
            <li key={request.publicId}>
              <Link
                href={WORK_REQUEST_PATHS.detail(request.publicId)}
                className="block rounded-(--radius-panel) border border-white/70 bg-white/80 p-5 shadow-(--shadow-soft)"
              >
                <p className="text-xs font-semibold tracking-[0.14em] text-navy/50">
                  {request.publicId}
                </p>
                <p className="mt-2 font-extrabold text-navy-deep">{request.title}</p>
                <p className="mt-2 text-sm text-muted">
                  {SERVICE_CATEGORY_LABELS[request.serviceCategory]} ·{" "}
                  {WORK_REQUEST_STATUS_LABELS[request.status]} ·{" "}
                  {formatDate(request.createdAt)}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
      <ListPager page={page} itemCount={requests.length} />
    </main>
  );
}
