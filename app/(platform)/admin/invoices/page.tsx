import Link from "next/link";
import { requirePlatformAdmin } from "@/lib/server/auth";
import { logoutAction } from "@/app/(auth)/actions";
import { listInvoices } from "@/lib/server/invoices";
import {
  formatMinor,
  INVOICE_PATHS,
  INVOICE_STATUS_LABELS,
} from "@/modules/invoices";

export default async function AdminInvoicesPage() {
  const access = await requirePlatformAdmin(INVOICE_PATHS.adminList);
  if (!access.authorized) {
    return <Unauthorized />;
  }
  const invoices = await listInvoices();

  return (
    <main>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-[-0.04em] text-navy-deep">
            Invoices
          </h1>
          <p className="mt-3 text-[15px] text-muted">
            Commercial invoices. Paid state comes from allocated payment records, not quote acceptance.
          </p>
        </div>
        <Link
          href={INVOICE_PATHS.adminNew}
          className="rounded-(--radius-button) bg-blue px-5 py-2.5 text-sm font-semibold text-white"
        >
          New draft
        </Link>
      </div>
      {invoices.length === 0 ? (
        <p className="mt-8 text-[15px] text-muted">No invoices yet.</p>
      ) : (
        <ul className="mt-8 space-y-3">
          {invoices.map((invoice) => (
            <li key={invoice.publicId}>
              <Link
                href={INVOICE_PATHS.adminDetail(invoice.publicId)}
                className="block rounded-(--radius-panel) border border-white/70 bg-white/80 p-5 shadow-(--shadow-soft)"
              >
                <p className="text-xs font-semibold tracking-[0.14em] text-navy/50">
                  {invoice.invoiceNumber ?? invoice.publicId}
                </p>
                <p className="mt-2 font-extrabold text-navy-deep">{invoice.customerLabel}</p>
                <p className="mt-1 text-sm text-muted">
                  {invoice.displayStatus === "overdue"
                    ? "Overdue"
                    : INVOICE_STATUS_LABELS[invoice.status]}{" "}
                  · {formatMinor(invoice.totalMinor, invoice.currency)}
                  {invoice.amountDueMinor > 0
                    ? ` · due ${formatMinor(invoice.amountDueMinor, invoice.currency)}`
                    : ""}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
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
