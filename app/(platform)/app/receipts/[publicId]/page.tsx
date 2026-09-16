import Link from "next/link";
import { notFound } from "next/navigation";
import { requireCompletedOnboarding } from "@/lib/server/account";
import { getCustomerReceiptByPublicId } from "@/lib/server/receipts";
import { formatMinor } from "@/modules/invoices";
import { RECEIPT_PATHS } from "@/modules/receipts";
import { formatDisplayDateTime } from "@/lib/format/display";
import { PageHeader } from "@/components/platform/PageHeader";

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
        <PageHeader
          eyebrow={receipt.receiptNumber}
          title="Receipt"
          description={receipt.sourceLabel}
        />
        <p className="mt-4 text-[15px] font-extrabold text-navy-deep">
          {formatMinor(receipt.amountMinor, receipt.currency)}
        </p>
        <p className="mt-2 text-sm text-muted">
          {formatDisplayDateTime(receipt.receivedAt ?? receipt.issuedAt)}
        </p>
        {receipt.invoiceNumbers.length > 0 ? (
          <p className="mt-2 text-sm">Related invoices {receipt.invoiceNumbers.join(", ")}</p>
        ) : null}
        <p className="mt-6 text-sm font-semibold text-navy-deep">Flash One · flashone.uk</p>
        <p className="mt-6 text-sm text-muted print:hidden">
          Use your browser print dialog for a print-friendly copy. PDF generation is not available.
        </p>
        <p className="mt-6 text-sm print:hidden">
          <Link href={RECEIPT_PATHS.list} className="font-semibold text-blue">
            Back to receipts
          </Link>
        </p>
      </article>
    </main>
  );
}
