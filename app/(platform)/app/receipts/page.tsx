import Link from "next/link";
import { requireCompletedOnboarding } from "@/lib/server/account";
import { listCustomerReceipts } from "@/lib/server/receipts";
import { formatMinor } from "@/modules/invoices";
import { RECEIPT_PATHS } from "@/modules/receipts";

export default async function CustomerReceiptsPage() {
  const { session } = await requireCompletedOnboarding(RECEIPT_PATHS.list);
  const receipts = await listCustomerReceipts(session.userId);

  return (
    <main>
      <h1 className="text-3xl font-extrabold tracking-[-0.04em] text-navy-deep">Receipts</h1>
      <p className="mt-4 text-[15px] text-muted">
        Evidence that Flash One recorded money received. A receipt is not an invoice.
      </p>
      {receipts.length === 0 ? (
        <p className="mt-8 text-[15px] text-muted">No receipts yet.</p>
      ) : (
        <ul className="mt-8 space-y-3">
          {receipts.map((receipt) => (
            <li key={receipt.publicId}>
              <Link
                href={RECEIPT_PATHS.detail(receipt.publicId)}
                className="block rounded-(--radius-panel) border border-white/70 bg-white/80 p-5 shadow-(--shadow-soft)"
              >
                <p className="text-xs font-semibold tracking-[0.14em] text-navy/50">
                  {receipt.receiptNumber}
                </p>
                <p className="mt-2 font-extrabold text-navy-deep">
                  {formatMinor(receipt.amountMinor, receipt.currency)}
                </p>
                <p className="mt-1 text-sm text-muted">{receipt.sourceLabel}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
