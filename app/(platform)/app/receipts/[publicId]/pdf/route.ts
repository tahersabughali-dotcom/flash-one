import { requireCompletedOnboarding } from "@/lib/server/account";
import { getCustomerReceiptByPublicId } from "@/lib/server/receipts";
import { buildBrandedPdf, pdfResponse } from "@/lib/server/pdf/document";
import { RECEIPT_PATHS } from "@/modules/receipts";
import { formatDisplayDate } from "@/lib/format/display";
import { notFound } from "next/navigation";

export async function GET(
  _request: Request,
  context: { params: Promise<{ publicId: string }> },
) {
  const { publicId } = await context.params;
  const { session } = await requireCompletedOnboarding(RECEIPT_PATHS.pdf(publicId));
  const receipt = await getCustomerReceiptByPublicId(publicId, session.userId);
  if (!receipt) {
    notFound();
  }
  const bytes = await buildBrandedPdf({
    title: "Receipt",
    reference: receipt.receiptNumber,
    subtitle: receipt.sourceLabel,
    dateLabel: `Recorded ${formatDisplayDate(receipt.receivedAt ?? receipt.issuedAt)}`,
    lines: [
      {
        description:
          receipt.invoiceNumbers.length > 0
            ? `Payment related to ${receipt.invoiceNumbers.join(", ")}`
            : "Recorded payment",
        lineTotalMinor: receipt.amountMinor,
      },
    ],
    currency: receipt.currency,
    totalMinor: receipt.amountMinor,
  });
  return pdfResponse(`${receipt.receiptNumber}.pdf`, bytes);
}
