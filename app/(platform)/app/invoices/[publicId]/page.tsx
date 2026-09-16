import Link from "next/link";
import { notFound } from "next/navigation";
import { requireCompletedOnboarding } from "@/lib/server/account";
import { getCustomerInvoiceByPublicId } from "@/lib/server/invoices";
import {
  formatMinor,
  INVOICE_PATHS,
  INVOICE_STATUS_LABELS,
  type InvoiceCurrency,
} from "@/modules/invoices";
import { formatDisplayDate } from "@/lib/format/display";
import { PageHeader } from "@/components/platform/PageHeader";
import { StatusBadge } from "@/components/platform/StatusBadge";
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
  const statusLabel =
    invoice.displayStatus === "overdue" ? "Overdue" : INVOICE_STATUS_LABELS[invoice.status];
  return (
    <article className="invoice-print">
      <PageHeader
        eyebrow={invoice.invoiceNumber ?? invoice.publicId}
        title="Invoice"
        description={`${invoice.customerLabel}${invoice.issueDate ? ` · Issued ${formatDisplayDate(invoice.issueDate)}` : ""}${invoice.dueDate ? ` · Due ${formatDisplayDate(invoice.dueDate)}` : ""}`}
        actions={
          <div className="flex flex-wrap gap-3">
            <StatusBadge status={invoice.displayStatus} label={statusLabel} />
            <Link href={INVOICE_PATHS.pdf(invoice.publicId)} className="rounded-(--radius-button) border border-line bg-white px-4 py-2 text-sm font-semibold">
              Download PDF
            </Link>
          </div>
        }
      />
      <p className="mt-2 text-sm font-semibold text-navy-deep">Flash One · flashone.uk</p>
      <p className="mt-1 text-sm text-muted">
        Official company registration details are not printed until they are verified.
      </p>
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
      {invoice.creditIssuedMinor > 0 ? (
        <p className="mt-2 text-sm">
          Credits applied {formatMinor(invoice.creditIssuedMinor, currency)}
        </p>
      ) : null}
      <p className="mt-6 text-sm text-muted print:hidden">
        Use your browser print dialog for a print-friendly copy.
      </p>
    </article>
  );
}
