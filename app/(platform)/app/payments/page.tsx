import Link from "next/link";
import { requireCompletedOnboarding } from "@/lib/server/account";
import { listCustomerPayments, listPaymentAllocations } from "@/lib/server/payments";
import { getReceiptForPayment } from "@/lib/server/receipts";
import { listRefundsForPayment } from "@/lib/server/refunds";
import { parseListPage } from "@/lib/server/pagination";
import { ListPager } from "@/components/platform/ListPager";
import { PageHeader } from "@/components/platform/PageHeader";
import { EmptyState } from "@/components/platform/EmptyState";
import { formatDisplayDate } from "@/lib/format/display";
import { formatMinor, INVOICE_PATHS } from "@/modules/invoices";
import { PAYMENT_PATHS, PAYMENT_STATUS_LABELS } from "@/modules/payments";
import { RECEIPT_PATHS } from "@/modules/receipts";
import { REFUND_STATUS_LABELS } from "@/modules/refunds";

export default async function CustomerPaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { session } = await requireCompletedOnboarding(PAYMENT_PATHS.list);
  const page = parseListPage((await searchParams).page);
  const payments = await listCustomerPayments(session.userId, page);
  const extras = await Promise.all(
    payments.map(async (payment) => {
      const [allocations, receipt, refunds] = await Promise.all([
        listPaymentAllocations(payment.id),
        getReceiptForPayment(payment.id),
        listRefundsForPayment(payment.id),
      ]);
      return { payment, allocations, receipt, refunds };
    }),
  );

  return (
    <main>
      <PageHeader
        eyebrow="Finance"
        title="Payments"
        description="Recorded money related to your invoices and orders. This is not an accounting ledger."
      />
      {extras.length === 0 ? (
        <EmptyState
          title="No payments yet"
          description="Recorded payments appear here after Flash One confirms money received."
        />
      ) : (
        <ul className="mt-8 space-y-3">
          {extras.map(({ payment, allocations, receipt, refunds }) => (
            <li
              key={payment.publicId}
              className="rounded-(--radius-panel) border border-white/70 bg-white/80 p-5 shadow-(--shadow-soft)"
            >
              <p className="text-xs font-semibold tracking-[0.14em] text-navy/50">
                {payment.publicId}
              </p>
              <p className="mt-2 font-extrabold text-navy-deep">
                {formatMinor(payment.amountMinor, payment.currency)}
              </p>
              <p className="mt-1 text-sm text-muted">
                {PAYMENT_STATUS_LABELS[payment.status]}
                {payment.receivedAt ? ` · ${formatDisplayDate(payment.receivedAt)}` : ""}
              </p>
              {allocations.length > 0 ? (
                <p className="mt-2 text-sm">
                  Invoice{" "}
                  {allocations.map((allocation, index) => (
                    <span key={`${allocation.invoicePublicId}-${allocation.allocatedAt}`}>
                      {index > 0 ? ", " : null}
                      <Link
                        href={INVOICE_PATHS.detail(allocation.invoicePublicId)}
                        className="font-semibold text-blue"
                      >
                        {allocation.invoiceNumber ?? allocation.invoicePublicId}
                      </Link>
                    </span>
                  ))}
                </p>
              ) : null}
              {receipt ? (
                <p className="mt-2 text-sm">
                  Receipt{" "}
                  <Link href={RECEIPT_PATHS.detail(receipt.publicId)} className="font-semibold text-blue">
                    {receipt.receiptNumber}
                  </Link>
                </p>
              ) : null}
              {refunds.length > 0 ? (
                <ul className="mt-2 space-y-1 text-sm">
                  {refunds.map((refund) => (
                    <li key={refund.publicId}>
                      Refund {formatMinor(refund.amountMinor, refund.currency)} ·{" "}
                      {REFUND_STATUS_LABELS[refund.status]}
                      {refund.recordedAt ? ` · ${formatDisplayDate(refund.recordedAt)}` : ""}
                    </li>
                  ))}
                </ul>
              ) : null}
            </li>
          ))}
        </ul>
      )}
      <ListPager page={page} itemCount={payments.length} />
    </main>
  );
}
