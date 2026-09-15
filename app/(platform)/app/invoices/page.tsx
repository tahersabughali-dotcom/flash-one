import Link from "next/link";
import { requireCompletedOnboarding } from "@/lib/server/account";
import { listCustomerInvoices } from "@/lib/server/invoices";
import {
  formatMinor,
  INVOICE_PATHS,
  INVOICE_STATUS_LABELS,
} from "@/modules/invoices";

export default async function CustomerInvoicesPage() {
  const { session } = await requireCompletedOnboarding(INVOICE_PATHS.list);
  const invoices = await listCustomerInvoices(session.userId);

  return (
    <main>
      <h1 className="text-3xl font-extrabold tracking-[-0.04em] text-navy-deep">Invoices</h1>
      <p className="mt-4 text-[15px] text-muted">
        Issued invoices for your individual relationship or businesses you belong to.
      </p>
      {invoices.length === 0 ? (
        <p className="mt-8 text-[15px] text-muted">No invoices yet.</p>
      ) : (
        <ul className="mt-8 space-y-3">
          {invoices.map((invoice) => (
            <li key={invoice.publicId}>
              <Link
                href={INVOICE_PATHS.detail(invoice.publicId)}
                className="block rounded-(--radius-panel) border border-white/70 bg-white/80 p-5 shadow-(--shadow-soft)"
              >
                <p className="text-xs font-semibold tracking-[0.14em] text-navy/50">
                  {invoice.invoiceNumber ?? invoice.publicId}
                </p>
                <p className="mt-2 font-extrabold text-navy-deep">
                  {formatMinor(invoice.totalMinor, invoice.currency)}
                </p>
                <p className="mt-1 text-sm text-muted">
                  {invoice.displayStatus === "overdue"
                    ? "Overdue"
                    : INVOICE_STATUS_LABELS[invoice.status]}
                  {invoice.issueDate ? ` · ${invoice.issueDate}` : ""}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
