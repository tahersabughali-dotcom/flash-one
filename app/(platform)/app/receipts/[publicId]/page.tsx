import { notFound } from "next/navigation";
import { requireCompletedOnboarding } from "@/lib/server/account";
import { getCustomerReceiptByPublicId } from "@/lib/server/receipts";
import { formatMinor } from "@/modules/invoices";
import { RECEIPT_PATHS } from "@/modules/receipts";

export default async function CustomerReceiptDetailPage({
  params,
}: {
  params: Promise<{ publicId: string }>;
}) {
  const { publicId } = await params;
  const { session } = await requireCompletedOnboarding(RECEIPT_PATHS.detail(publicId));
  const receipt = await getCustomerReceiptByPublicId(publicId, session.userId);
  if (!receipt) {
    notFound();
  }

  return (
    <main>
      <article className="receipt-print">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-navy/50">
          {receipt.publicId}
        </p>
        <h1 className="mt-3 text-3xl font-extrabold tracking-[-0.04em] text-navy-deep">
          Receipt
        </h1>
        <p className="mt-4 text-[15px] font-extrabold text-navy-deep">
          {formatMinor(receipt.amountMinor, receipt.currency)}
        </p>
        <p className="mt-2 text-sm text-muted">
          {receipt.sourceLabel}
          {receipt.receivedAt
            ? ` · ${new Date(receipt.receivedAt).toLocaleString("en-GB")}`
            : ` · ${new Date(receipt.issuedAt).toLocaleString("en-GB")}`}
        </p>
        <p className="mt-4 text-sm">Reference {receipt.receiptNumber}</p>
        {receipt.invoiceNumbers.length > 0 ? (
          <p className="mt-2 text-sm">
            Related invoices {receipt.invoiceNumbers.join(", ")}
          </p>
        ) : null}
        <p className="mt-6 text-sm font-semibold text-navy-deep">Flash One · flashone.uk</p>
        <p className="mt-6 text-sm text-muted print:hidden">
          Use your browser print dialog for a print-friendly copy. PDF generation is deferred.
        </p>
      </article>
    </main>
  );
}
