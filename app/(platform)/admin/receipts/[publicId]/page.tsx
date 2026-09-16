import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePlatformAdmin } from "@/lib/server/auth";
import { getReceiptByPublicId } from "@/lib/server/receipts";
import { formatMinor } from "@/modules/invoices";
import { RECEIPT_PATHS } from "@/modules/receipts";
import { formatDisplayDateTime } from "@/lib/format/display";
import { PageHeader } from "@/components/platform/PageHeader";

export default async function AdminReceiptDetailPage({
  params,
}: {
  params: Promise<{ publicId: string }>;
}) {
  const { publicId } = await params;
  await requirePlatformAdmin(RECEIPT_PATHS.adminDetail(publicId));
  const receipt = await getReceiptByPublicId(publicId);
  if (!receipt) {
    notFound();
  }

  return (
    <main>
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
      <p className="mt-6 text-sm">
        <Link href={RECEIPT_PATHS.adminList} className="font-semibold text-blue">
          Back to receipts
        </Link>
      </p>
    </main>
  );
}
