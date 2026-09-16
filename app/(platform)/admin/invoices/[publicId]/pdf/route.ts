import { requirePlatformAdmin } from "@/lib/server/auth";
import { AUTH_PATHS } from "@/modules/auth/constants";
import { redirect } from "next/navigation";
import { getInvoiceByPublicId } from "@/lib/server/invoices";
import { buildBrandedPdf, pdfResponse } from "@/lib/server/pdf/document";
import { INVOICE_PATHS } from "@/modules/invoices";
import { formatDisplayDate } from "@/lib/format/display";
import { notFound } from "next/navigation";

export async function GET(
  _request: Request,
  context: { params: Promise<{ publicId: string }> },
) {
  const { publicId } = await context.params;
  const access = await requirePlatformAdmin(INVOICE_PATHS.adminPdf(publicId));
  if (!access.authorized) {
    redirect(AUTH_PATHS.admin);
  }
  const invoice = await getInvoiceByPublicId(publicId);
  if (!invoice || invoice.status === "draft") {
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
