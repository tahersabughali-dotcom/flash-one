import { notFound } from "next/navigation";
import { requireCompletedOnboarding } from "@/lib/server/account";
import { getCustomerInvoiceByPublicId } from "@/lib/server/invoices";
import {
  formatMinor,
  INVOICE_PATHS,
  INVOICE_STATUS_LABELS,
  type InvoiceCurrency,
} from "@/modules/invoices";
import type { InvoiceDetail } from "@/lib/server/invoices";

export default async function CustomerInvoiceDetailPage({
  params,
}: {
  params: Promise<{ publicId: string }>;
}) {
  const { publicId } = await params;
  const { session } = await requireCompletedOnboarding(INVOICE_PATHS.detail(publicId));
  const invoice = await getCustomerInvoiceByPublicId(publicId, session.userId);
  if (!invoice) {
    notFound();
  }

  return (
    <main>
      <InvoiceView invoice={invoice} />
    </main>
  );
}

function InvoiceView({ invoice }: { invoice: InvoiceDetail }) {
  const currency: InvoiceCurrency = invoice.currency;
  return (
    <article className="invoice-print">
      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-navy/50">
        {invoice.invoiceNumber ?? invoice.publicId}
      </p>
      <h1 className="mt-3 text-3xl font-extrabold tracking-[-0.04em] text-navy-deep">
        Invoice
      </h1>
      <p className="mt-4 text-[15px] text-muted">
        {invoice.displayStatus === "overdue"
          ? "Overdue"
          : INVOICE_STATUS_LABELS[invoice.status]}
        {invoice.issueDate ? ` · Issued ${invoice.issueDate}` : ""}
        {invoice.dueDate ? ` · Due ${invoice.dueDate}` : ""}
      </p>
      <p className="mt-2 text-sm font-semibold text-navy-deep">Flash One · flashone.uk</p>
      <p className="mt-1 text-sm text-muted">
        Official company registration details are not printed until they are verified.
      </p>
      <p className="mt-4 text-[15px]">{invoice.customerLabel}</p>
      <ul className="mt-8 space-y-3">
        {invoice.lines.map((line) => (
          <li
            key={`${line.position}-${line.description}`}
            className="rounded-2xl border border-line bg-white px-5 py-4"
          >
            <p className="font-semibold text-navy-deep">{line.description}</p>
            <p className="mt-1 text-sm text-muted">
              {line.quantity} × {formatMinor(line.unitAmountMinor, currency)} ={" "}
              {formatMinor(line.lineTotalMinor, currency)}
            </p>
          </li>
        ))}
      </ul>
      <p className="mt-6 text-[15px] font-semibold">
        Subtotal {formatMinor(invoice.subtotalMinor, currency)}
      </p>
      <p className="text-sm text-muted">
        Tax is not configured and is {formatMinor(invoice.taxMinor, currency)}.
      </p>
      <p className="mt-2 text-lg font-extrabold text-navy-deep">
        Total {formatMinor(invoice.totalMinor, currency)}
      </p>
      <p className="mt-2 text-sm">
        Paid {formatMinor(invoice.amountPaidMinor, currency)} · Amount due{" "}
        {formatMinor(invoice.amountDueMinor, currency)}
      </p>
      <p className="mt-6 text-sm text-muted print:hidden">
        Use your browser print dialog for a print-friendly copy. PDF generation is deferred.
      </p>
    </article>
  );
}
