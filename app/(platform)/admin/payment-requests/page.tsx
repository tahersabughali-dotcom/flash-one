import Link from "next/link";
import { requirePlatformAdmin } from "@/lib/server/auth";
import { logoutAction } from "@/app/(auth)/actions";
import { listPaymentRequests } from "@/lib/server/payments";
import { formatMinor } from "@/modules/invoices";
import {
  PAYMENT_REQUEST_PATHS,
  PAYMENT_REQUEST_STATUS_LABELS,
} from "@/modules/payment-requests";

export default async function AdminPaymentRequestsPage() {
  const access = await requirePlatformAdmin(PAYMENT_REQUEST_PATHS.adminList);
  if (!access.authorized) {
    return <Unauthorized />;
  }
  const requests = await listPaymentRequests();
  return (
    <main>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-[-0.04em] text-navy-deep">
            Payment requests
          </h1>
          <p className="mt-3 text-[15px] text-muted">
            Requests to pay. Not proof that money was received.
          </p>
        </div>
        <Link
          href={PAYMENT_REQUEST_PATHS.adminNew}
          className="rounded-(--radius-button) bg-blue px-5 py-2.5 text-sm font-semibold text-white"
        >
          New payment request
        </Link>
      </div>
      {requests.length === 0 ? (
        <p className="mt-8 text-[15px] text-muted">No payment requests.</p>
      ) : (
        <ul className="mt-8 space-y-3">
          {requests.map((request) => (
            <li key={request.publicId}>
              <Link
                href={PAYMENT_REQUEST_PATHS.adminDetail(request.publicId)}
                className="block rounded-(--radius-panel) border border-white/70 bg-white/80 p-5 shadow-(--shadow-soft)"
              >
                <p className="text-xs font-semibold tracking-[0.14em] text-navy/50">
                  {request.publicId}
                </p>
                <p className="mt-2 font-extrabold text-navy-deep">
                  {request.requestedAmountMinor
                    ? formatMinor(request.requestedAmountMinor, request.currency)
                    : `${request.currency} · customer entered`}
                </p>
                <p className="mt-1 text-sm text-muted">
                  {PAYMENT_REQUEST_STATUS_LABELS[request.status]}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

function Unauthorized() {
  return (
    <main>
      <h1 className="text-3xl font-extrabold text-navy-deep">Not authorized</h1>
      <form action={logoutAction} className="mt-8">
        <button type="submit" className="rounded-(--radius-button) border border-line bg-white px-5 py-2.5 text-sm font-semibold">
          Sign out
        </button>
      </form>
    </main>
  );
}
