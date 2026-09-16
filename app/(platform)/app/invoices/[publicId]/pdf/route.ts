import { requireCompletedOnboarding } from "@/lib/server/account";
import { getCustomerInvoiceByPublicId } from "@/lib/server/invoices";
import { buildBrandedPdf, pdfResponse } from "@/lib/server/pdf/document";
import { INVOICE_PATHS } from "@/modules/invoices";
import { formatDisplayDate } from "@/lib/format/display";
import { notFound } from "next/navigation";

export async function GET(
  _request: Request,
  context: { params: Promise<{ publicId: string }> },
) {
  const { publicId } = await context.params;
  const { session } = await requireCompletedOnboarding(INVOICE_PATHS.pdf(publicId));
  const invoice = await getCustomerInvoiceByPublicId(publicId, session.userId);
  if (!invoice) {
    notFound();
  }
  const bytes = await buildBrandedPdf({
    title: "Invoice",
    reference: invoice.invoiceNumber ?? invoice.publicId,
    customerLabel: invoice.customerLabel,
    dateLabel: invoice.issueDate ? `Issued ${formatDisplayDate(invoice.issueDate)}` : undefined,
    lines: invoice.lines,
    currency: invoice.currency,
    subtotalMinor: invoice.subtotalMinor,
    taxMinor: invoice.taxMinor,
    totalMinor: invoice.totalMinor,
    paidMinor: invoice.amountPaidMinor,
    dueMinor: invoice.amountDueMinor,
    notes: invoice.notes,
  });
  return pdfResponse(`${invoice.invoiceNumber ?? invoice.publicId}.pdf`, bytes);
}
