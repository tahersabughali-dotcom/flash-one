import Link from "next/link";
import { requirePlatformAdmin } from "@/lib/server/auth";
import { logoutAction } from "@/app/(auth)/actions";
import { listPayments } from "@/lib/server/payments";
import { listLedgerEntries } from "@/lib/server/ledger";
import { formatMinor } from "@/modules/invoices";
import { PAYMENT_PATHS, PAYMENT_SOURCE_LABELS, PAYMENT_STATUS_LABELS } from "@/modules/payments";

export default async function AdminPaymentsPage() {
  const access = await requirePlatformAdmin(PAYMENT_PATHS.adminList);
  if (!access.authorized) {
    return <Unauthorized />;
  }
  const [payments, ledger] = await Promise.all([listPayments(), listLedgerEntries()]);

  return (
    <main>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-[-0.04em] text-navy-deep">
            Financial records
          </h1>
          <p className="mt-3 text-[15px] text-muted">
            Manual development payment records only. No payment provider is connected.
          </p>
        </div>
        <Link
          href={PAYMENT_PATHS.adminNew}
          className="rounded-(--radius-button) bg-blue px-5 py-2.5 text-sm font-semibold text-white"
        >
          Record manual payment
        </Link>
      </div>
      {payments.length === 0 ? (
        <p className="mt-8 text-[15px] text-muted">No recorded payments.</p>
      ) : (
        <ul className="mt-8 space-y-3">
          {payments.map((payment) => (
            <li key={payment.publicId}>
              <Link
                href={PAYMENT_PATHS.adminDetail(payment.publicId)}
                className="block rounded-(--radius-panel) border border-white/70 bg-white/80 p-5 shadow-(--shadow-soft)"
              >
                <p className="text-xs font-semibold tracking-[0.14em] text-navy/50">
                  {payment.publicId}
                </p>
                <p className="mt-2 font-extrabold text-navy-deep">
                  {formatMinor(payment.amountMinor, payment.currency)}
                </p>
                <p className="mt-1 text-sm text-muted">
                  {PAYMENT_SOURCE_LABELS[payment.sourceType] ?? payment.sourceType} ·{" "}
                  {PAYMENT_STATUS_LABELS[payment.status]} · unallocated{" "}
                  {formatMinor(payment.unallocatedMinor, payment.currency)}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
      <section className="mt-12">
        <h2 className="text-lg font-extrabold text-navy-deep">Operational ledger</h2>
        <p className="mt-2 text-sm text-muted">
          Append-only financial events. This is not audit_events and not a statutory account.
        </p>
        {ledger.length === 0 ? (
          <p className="mt-3 text-sm text-muted">No ledger entries.</p>
        ) : (
          <ul className="mt-4 space-y-2 text-sm">
            {ledger.map((entry) => (
              <li key={entry.publicId} className="rounded-2xl border border-line bg-white px-4 py-3">
                {entry.eventType} · {formatMinor(entry.amountMinor, entry.currency)} · {entry.direction}
              </li>
            ))}
          </ul>
        )}
      </section>
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
