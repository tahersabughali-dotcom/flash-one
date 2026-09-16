import { requireCompletedOnboarding } from "@/lib/server/account";
import { notFound } from "next/navigation";
import { getQuoteByPublicId } from "@/lib/server/quotes";
import { buildBrandedPdf, pdfResponse } from "@/lib/server/pdf/document";
import { QUOTE_PATHS } from "@/modules/quotes";
import { formatDisplayDate } from "@/lib/format/display";

export async function GET(
  _request: Request,
  context: { params: Promise<{ publicId: string }> },
) {
  const { publicId } = await context.params;
  await requireCompletedOnboarding(QUOTE_PATHS.pdf(publicId));
  const quote = await getQuoteByPublicId(publicId);
  if (!quote || quote.status === "draft") {
    notFound();
  }
  const bytes = await buildBrandedPdf({
    title: "Quote",
    reference: quote.publicId,
    subtitle: `Version ${quote.version}`,
    dateLabel: quote.validUntil
      ? `Valid until ${formatDisplayDate(quote.validUntil)}`
      : undefined,
    lines: quote.lines.map((line) => ({
      description: line.description,
      quantity: line.quantity,
      unitAmountMinor: line.unitAmountMinor,
      lineTotalMinor: line.lineTotalMinor,
    })),
    currency: quote.currency,
    subtotalMinor: quote.subtotalMinor,
    taxMinor: quote.taxMinor,
    totalMinor: quote.totalMinor,
    notes: quote.customerNotes,
  });
  return pdfResponse(`${quote.publicId}.pdf`, bytes);
}
