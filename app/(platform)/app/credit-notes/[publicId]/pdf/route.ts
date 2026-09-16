import { requireCompletedOnboarding } from "@/lib/server/account";
import { notFound } from "next/navigation";
import { getCreditNoteByPublicId } from "@/lib/server/credit-notes";
import { buildBrandedPdf, pdfResponse } from "@/lib/server/pdf/document";
import { CREDIT_NOTE_PATHS } from "@/modules/credit-notes";
import { formatDisplayDate } from "@/lib/format/display";

export async function GET(
  _request: Request,
  context: { params: Promise<{ publicId: string }> },
) {
  const { publicId } = await context.params;
  await requireCompletedOnboarding(CREDIT_NOTE_PATHS.pdf(publicId));
  const note = await getCreditNoteByPublicId(publicId);
  if (!note || note.status !== "issued") {
    notFound();
  }
  const bytes = await buildBrandedPdf({
    title: "Credit note",
    reference: note.creditNoteNumber ?? note.publicId,
    dateLabel: note.issuedAt ? `Issued ${formatDisplayDate(note.issuedAt)}` : undefined,
    subtitle: note.invoicePublicId ? `Invoice ${note.invoicePublicId}` : undefined,
    lines: [
      {
        description: note.reason,
        lineTotalMinor: note.amountMinor,
      },
    ],
    currency: note.currency,
    totalMinor: note.amountMinor,
    notes: note.notes,
  });
  return pdfResponse(`${note.creditNoteNumber ?? note.publicId}.pdf`, bytes);
}
