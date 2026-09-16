import { requirePlatformAdmin } from "@/lib/server/auth";
import { AUTH_PATHS } from "@/modules/auth/constants";
import { redirect, notFound } from "next/navigation";
import { getReceiptByPublicId } from "@/lib/server/receipts";
import { buildBrandedPdf, pdfResponse } from "@/lib/server/pdf/document";
import { RECEIPT_PATHS } from "@/modules/receipts";
import { formatDisplayDate } from "@/lib/format/display";

export async function GET(
  _request: Request,
  context: { params: Promise<{ publicId: string }> },
) {
  const { publicId } = await context.params;
  const access = await requirePlatformAdmin(RECEIPT_PATHS.adminPdf(publicId));
  if (!access.authorized) {
    redirect(AUTH_PATHS.admin);
  }
  const receipt = await getReceiptByPublicId(publicId);
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
