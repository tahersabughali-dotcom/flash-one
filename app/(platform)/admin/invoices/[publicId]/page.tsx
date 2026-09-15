import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePlatformAdmin } from "@/lib/server/auth";
import { logoutAction } from "@/app/(auth)/actions";
import {
  getInvoiceByPublicId,
  listInvoiceAllocations,
  type InvoiceDetail,
} from "@/lib/server/invoices";
import { formatMinor, INVOICE_PATHS, INVOICE_STATUS_LABELS } from "@/modules/invoices";
import { PAYMENT_PATHS } from "@/modules/payments";
import {
  AllocatePaymentForm,
  IssueInvoiceButton,
  VoidInvoiceForm,
} from "../invoice-actions";

export default async function AdminInvoiceDetailPage({
  params,
}: {
  params: Promise<{ publicId: string }>;
}) {
  const { publicId } = await params;
  const access = await requirePlatformAdmin(INVOICE_PATHS.adminDetail(publicId));
  if (!access.authorized) {
    return <Unauthorized />;
  }
  const invoice = await getInvoiceByPublicId(publicId);
  if (!invoice) {
    notFound();
  }
  const allocations = await listInvoiceAllocations(invoice.id);

  return (
    <main>
      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-navy/50">
        {invoice.publicId}
      </p>
      <h1 className="mt-3 text-3xl font-extrabold tracking-[-0.04em] text-navy-deep">
        {invoice.invoiceNumber ?? "Draft invoice"}
      </h1>
      <p className="mt-4 text-[15px] text-muted">
        {invoice.displayStatus === "overdue"
          ? "Overdue"
          : INVOICE_STATUS_LABELS[invoice.status]}{" "}
        · {invoice.customerLabel}
      </p>
      <InvoicePrintView invoice={invoice} />
      {invoice.status === "draft" ? (
        <div className="mt-8">
          <IssueInvoiceButton publicId={invoice.publicId} />
        </div>
      ) : null}
      {invoice.status !== "draft" && invoice.status !== "void" && invoice.amountPaidMinor === 0 ? (
        <VoidInvoiceForm publicId={invoice.publicId} />
      ) : null}
      {invoice.status !== "draft" && invoice.status !== "void" ? (
        <section className="mt-10">
          <h2 className="text-lg font-extrabold text-navy-deep">Payment allocations</h2>
          <p className="mt-2 text-sm text-muted">
            Allocations record how a manual payment record was applied. This is not a payment provider capture.
          </p>
          {allocations.length === 0 ? (
            <p className="mt-3 text-sm text-muted">No allocations yet.</p>
          ) : (
            <ul className="mt-3 space-y-2 text-sm">
              {allocations.map((allocation) => (
                <li key={`${allocation.paymentPublicId}-${allocation.allocatedAt}`}>
                  <Link
                    href={PAYMENT_PATHS.adminDetail(allocation.paymentPublicId)}
                    className="font-semibold text-blue"
                  >
                    {allocation.paymentPublicId}
                  </Link>{" "}
                  · {formatMinor(allocation.amountMinor, invoice.currency)} · manual
                </li>
              ))}
            </ul>
          )}
          {invoice.amountDueMinor > 0 ? (
            <AllocatePaymentForm invoicePublicId={invoice.publicId} />
          ) : null}
        </section>
      ) : null}
    </main>
  );
}

function InvoicePrintView({ invoice }: { invoice: InvoiceDetail }) {
  return (
    <article className="invoice-print mt-8 rounded-(--radius-panel) border border-white/70 bg-white/80 p-6 shadow-(--shadow-soft)">
      <p className="text-sm font-semibold text-navy-deep">Flash One · flashone.uk</p>
      <p className="mt-1 text-sm text-muted">
        Legal company identity is not printed until verified details are supplied.
      </p>
      <p className="mt-4 text-[15px]">{invoice.customerLabel}</p>
      <p className="mt-1 text-sm text-muted">
        Issued {invoice.issueDate ?? "not issued"}
        {invoice.dueDate ? ` · Due ${invoice.dueDate}` : ""}
      </p>
      <ul className="mt-6 space-y-3">
        {invoice.lines.map((line) => (
          <li key={`${line.position}-${line.description}`} className="rounded-2xl border border-line bg-white px-5 py-4">
            <p className="font-semibold text-navy-deep">{line.description}</p>
            <p className="mt-1 text-sm text-muted">
              {line.quantity} × {formatMinor(line.unitAmountMinor, invoice.currency)} ={" "}
              {formatMinor(line.lineTotalMinor, invoice.currency)}
            </p>
          </li>
        ))}
      </ul>
      <p className="mt-6 text-[15px] font-semibold">
        Subtotal {formatMinor(invoice.subtotalMinor, invoice.currency)}
      </p>
      <p className="text-sm text-muted">
        Tax is not configured and is {formatMinor(invoice.taxMinor, invoice.currency)}.
      </p>
      <p className="mt-2 text-lg font-extrabold text-navy-deep">
        Total {formatMinor(invoice.totalMinor, invoice.currency)}
      </p>
      <p className="mt-2 text-sm">
        Paid {formatMinor(invoice.amountPaidMinor, invoice.currency)} · Amount due{" "}
        {formatMinor(invoice.amountDueMinor, invoice.currency)}
      </p>
      {invoice.notes ? (
        <p className="mt-4 whitespace-pre-wrap text-sm text-navy">{invoice.notes}</p>
      ) : null}
      <p className="mt-6 text-sm text-muted print:hidden">
        Use your browser print dialog for a print-friendly copy. PDF generation is deferred.
      </p>
    </article>
  );
}

function Unauthorized() {
  return (
    <main>
      <h1 className="text-3xl font-extrabold text-navy-deep">Not authorized</h1>
      <form action={logoutAction} className="mt-8">
        <button type="submit" className="rounded-(--radius-button) border border-line bg-white px-5 py-2.5 text-sm font-semibold">
          Sign out
        </button>
      </form>
    </main>
  );
}
