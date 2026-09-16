import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePlatformAdmin } from "@/lib/server/auth";
import { logoutAction } from "@/app/(auth)/actions";
import { getPaymentByPublicId, listPaymentAllocations } from "@/lib/server/payments";
import { getReceiptForPayment } from "@/lib/server/receipts";
import { listRefundsForPayment } from "@/lib/server/refunds";
import { formatMinor, INVOICE_PATHS } from "@/modules/invoices";
import { PAYMENT_PATHS, PAYMENT_SOURCE_LABELS, PAYMENT_STATUS_LABELS } from "@/modules/payments";
import { RECEIPT_PATHS } from "@/modules/receipts";
import { REFUND_PATHS, REFUND_STATUS_LABELS } from "@/modules/refunds";
import { PAYMENT_REQUEST_PATHS } from "@/modules/payment-requests";
import { formatDisplayDateTime } from "@/lib/format/display";

export default async function AdminPaymentDetailPage({
  params,
}: {
  params: Promise<{ publicId: string }>;
}) {
  const { publicId } = await params;
  const access = await requirePlatformAdmin(PAYMENT_PATHS.adminDetail(publicId));
  if (!access.authorized) {
    return <Unauthorized />;
  }
  const payment = await getPaymentByPublicId(publicId);
  if (!payment) {
    notFound();
  }
  const [allocations, receipt, refunds] = await Promise.all([
    listPaymentAllocations(payment.id),
    getReceiptForPayment(payment.id),
    listRefundsForPayment(payment.id),
  ]);

  return (
    <main>
      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-navy/50">
        {payment.publicId}
      </p>
      <h1 className="mt-3 text-3xl font-extrabold tracking-[-0.04em] text-navy-deep">
        {formatMinor(payment.amountMinor, payment.currency)}
      </h1>
      <p className="mt-4 text-[15px] text-muted">
        {PAYMENT_SOURCE_LABELS[payment.sourceType] ?? payment.sourceType}
        {payment.provider ? ` · ${payment.provider}` : ""} ·{" "}
        {PAYMENT_STATUS_LABELS[payment.status]} · {payment.customerLabel}
      </p>
      {payment.createdAt ? (
        <p className="mt-2 text-sm text-muted">Recorded {formatDisplayDateTime(payment.receivedAt ?? payment.createdAt)}</p>
      ) : null}
      {payment.providerReference ? (
        <p className="mt-2 text-sm text-muted">Provider reference {payment.providerReference}</p>
      ) : null}
      {payment.manualReference ? (
        <p className="mt-2 text-sm text-muted">Manual reference {payment.manualReference}</p>
      ) : null}
      {payment.notes ? <p className="mt-2 text-sm">{payment.notes}</p> : null}
      {payment.paymentRequestPublicId ? (
        <p className="mt-2 text-sm">
          Payment request{" "}
          <Link href={PAYMENT_REQUEST_PATHS.adminDetail(payment.paymentRequestPublicId)} className="font-semibold text-blue">
            {payment.paymentRequestPublicId}
          </Link>
        </p>
      ) : null}
      {payment.reviewRequired ? (
        <p className="mt-2 text-sm font-semibold text-red-700">Needs review</p>
      ) : null}
      <p className="mt-2 text-sm">
        Unallocated {formatMinor(payment.unallocatedMinor, payment.currency)}
        {payment.refundedMinor > 0
          ? ` · refunded ${formatMinor(payment.refundedMinor, payment.currency)}`
          : ""}
      </p>
      {payment.status === "succeeded" || payment.status === "partially_refunded" ? (
        <p className="mt-4 text-sm">
          <Link href={`${REFUND_PATHS.adminNew}?payment=${payment.publicId}`} className="font-semibold text-blue">
            Record refund
          </Link>
        </p>
      ) : null}
      {receipt ? (
        <p className="mt-4 text-sm">
          Receipt{" "}
          <Link href={RECEIPT_PATHS.adminDetail(receipt.publicId)} className="font-semibold text-blue">
            {receipt.receiptNumber}
          </Link>
        </p>
      ) : null}
      <section className="mt-8">
        <h2 className="text-lg font-extrabold text-navy-deep">Allocations</h2>
        {allocations.length === 0 ? (
          <p className="mt-3 text-sm text-muted">This payment is not allocated to an invoice.</p>
        ) : (
          <ul className="mt-3 space-y-2 text-sm">
            {allocations.map((allocation) => (
              <li key={`${allocation.invoicePublicId}-${allocation.allocatedAt}`}>
                <Link
                  href={INVOICE_PATHS.adminDetail(allocation.invoicePublicId)}
                  className="font-semibold text-blue"
                >
                  {allocation.invoiceNumber ?? allocation.invoicePublicId}
                </Link>{" "}
                · {formatMinor(allocation.amountMinor, payment.currency)}
              </li>
            ))}
          </ul>
        )}
      </section>
      <section className="mt-8">
        <h2 className="text-lg font-extrabold text-navy-deep">Refunds</h2>
        {refunds.length === 0 ? (
          <p className="mt-3 text-sm text-muted">No refund records.</p>
        ) : (
          <ul className="mt-3 space-y-2 text-sm">
            {refunds.map((refund) => (
              <li key={refund.publicId}>
                <Link href={REFUND_PATHS.adminDetail(refund.publicId)} className="font-semibold text-blue">
                  {refund.publicId}
                </Link>{" "}
                · {formatMinor(refund.amountMinor, refund.currency)} · {REFUND_STATUS_LABELS[refund.status]}
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
