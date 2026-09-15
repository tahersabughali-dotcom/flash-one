import Link from "next/link";
import { requirePlatformAdmin } from "@/lib/server/auth";
import { logoutAction } from "@/app/(auth)/actions";
import { listWorkRequests } from "@/lib/server/work-requests";
import {
  SERVICE_CATEGORY_LABELS,
  WORK_REQUEST_PATHS,
  WORK_REQUEST_STATUS_LABELS,
} from "@/modules/work-requests";

export default async function AdminRequestListPage() {
  const access = await requirePlatformAdmin(WORK_REQUEST_PATHS.adminList);
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

  const requests = await listWorkRequests();

  return (
    <main>
      <h1 className="text-3xl font-extrabold tracking-[-0.04em] text-navy-deep">
        Requests
      </h1>
      {requests.length === 0 ? (
        <p className="mt-8 text-[15px] text-muted">No requests.</p>
      ) : (
        <ul className="mt-8 space-y-3">
          {requests.map((request) => (
            <li key={request.publicId}>
              <Link
                href={WORK_REQUEST_PATHS.adminDetail(request.publicId)}
                className="block rounded-(--radius-panel) border border-white/70 bg-white/80 p-5 shadow-(--shadow-soft)"
              >
                <p className="text-xs font-semibold tracking-[0.14em] text-navy/50">
                  {request.publicId}
                </p>
                <p className="mt-2 font-extrabold text-navy-deep">{request.title}</p>
                <p className="mt-2 text-sm text-muted">
                  {SERVICE_CATEGORY_LABELS[request.serviceCategory]} ·{" "}
                  {WORK_REQUEST_STATUS_LABELS[request.status]}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
