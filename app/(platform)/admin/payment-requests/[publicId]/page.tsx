import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePlatformAdmin } from "@/lib/server/auth";
import { logoutAction } from "@/app/(auth)/actions";
import { getPaymentRequestByPublicId, listAttemptsForRequest } from "@/lib/server/payments";
import { formatMinor } from "@/modules/invoices";
import {
  ATTEMPT_STATUS_LABELS,
  PAYMENT_REQUEST_PATHS,
  PAYMENT_REQUEST_STATUS_LABELS,
  PAYMENT_SERVICE_LABELS,
  type PaymentServiceCode,
} from "@/modules/payment-requests";
import { adminSetPaymentRequestStatusAction } from "../actions";

export default async function AdminPaymentRequestDetailPage({
  params,
}: {
  params: Promise<{ publicId: string }>;
}) {
  const { publicId } = await params;
  const access = await requirePlatformAdmin(PAYMENT_REQUEST_PATHS.adminDetail(publicId));
  if (!access.authorized) {
    return <Unauthorized />;
  }
  const request = await getPaymentRequestByPublicId(publicId);
  if (!request) {
    notFound();
  }
  const attempts = await listAttemptsForRequest(request.id);
  const serviceLabel =
    request.serviceCode && request.serviceCode in PAYMENT_SERVICE_LABELS
      ? PAYMENT_SERVICE_LABELS[request.serviceCode as PaymentServiceCode]
      : null;
  return (
    <main>
      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-navy/50">
        {request.publicId}
      </p>
      <h1 className="mt-3 text-3xl font-extrabold tracking-[-0.04em] text-navy-deep">
        {request.requestedAmountMinor
          ? formatMinor(request.requestedAmountMinor, request.currency)
          : "Customer-entered amount"}
      </h1>
      <p className="mt-4 text-[15px] text-muted">
        {PAYMENT_REQUEST_STATUS_LABELS[request.status]}
        {serviceLabel ? ` · ${serviceLabel}` : ""}
      </p>
      <p className="mt-2 text-sm">
        Public pay link{" "}
        <Link href={PAYMENT_REQUEST_PATHS.payRequest(request.publicId)} className="font-semibold text-blue">
          {PAYMENT_REQUEST_PATHS.payRequest(request.publicId)}
        </Link>
      </p>
      {request.status === "draft" ? (
        <form action={adminSetPaymentRequestStatusAction} className="mt-6">
          <input type="hidden" name="publicId" value={request.publicId} />
          <input type="hidden" name="status" value="active" />
          <button type="submit" className="rounded-(--radius-button) bg-blue px-5 py-2.5 text-sm font-semibold text-white">
            Activate
          </button>
        </form>
      ) : null}
      {request.status === "draft" || request.status === "active" ? (
        <form action={adminSetPaymentRequestStatusAction} className="mt-3">
          <input type="hidden" name="publicId" value={request.publicId} />
          <input type="hidden" name="status" value="cancelled" />
          <button type="submit" className="rounded-(--radius-button) border border-line bg-white px-5 py-2.5 text-sm font-semibold">
            Cancel
          </button>
        </form>
      ) : null}
      <section className="mt-10">
        <h2 className="text-lg font-extrabold text-navy-deep">Attempts</h2>
        {attempts.length === 0 ? (
          <p className="mt-3 text-sm text-muted">No checkout attempts.</p>
        ) : (
          <ul className="mt-3 space-y-2 text-sm">
            {attempts.map((attempt) => (
              <li key={attempt.publicId} className="rounded-2xl border border-line bg-white px-4 py-3">
                {attempt.publicId} · {attempt.provider} · {ATTEMPT_STATUS_LABELS[attempt.status]} ·{" "}
                {formatMinor(attempt.amountMinor, attempt.currency)}
                {attempt.reviewReason ? ` · ${attempt.reviewReason}` : ""}
              </li>
            ))}
          </ul>
        )}
      </section>
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
