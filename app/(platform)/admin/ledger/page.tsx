import { requirePlatformAdmin } from "@/lib/server/auth";
import { listLedgerEntries } from "@/lib/server/ledger";
import { parseListPage } from "@/lib/server/pagination";
import { ListPager } from "@/components/platform/ListPager";
import { PageHeader } from "@/components/platform/PageHeader";
import { EmptyState } from "@/components/platform/EmptyState";
import { formatMinor } from "@/modules/invoices";
import { INVOICE_CURRENCIES } from "@/modules/invoices";
import { LEDGER_EVENT_LABELS, LEDGER_EVENT_TYPES, LEDGER_PATHS } from "@/modules/reports";
import { formatDisplayDateTime } from "@/lib/format/display";

export default async function AdminLedgerPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; currency?: string; type?: string; from?: string; to?: string }>;
}) {
  await requirePlatformAdmin(LEDGER_PATHS.adminList);
  const params = await searchParams;
  const page = parseListPage(params.page);
  const entries = await listLedgerEntries(page, {
    currency: params.currency || undefined,
    eventType: params.type || undefined,
    fromDate: params.from || undefined,
    toDate: params.to || undefined,
  });

  return (
    <main>
      <PageHeader
        eyebrow="Finance"
        title="Ledger"
        description="Read-only operational ledger. Entries are append-only. This is not a customer page and not a statutory account."
      />
      <form className="mt-6 grid gap-3 sm:grid-cols-4">
        <select name="currency" defaultValue={params.currency ?? ""} className="rounded-2xl border border-line bg-white px-4 py-3 text-sm">
          <option value="">All currencies</option>
          {INVOICE_CURRENCIES.map((currency) => (
            <option key={currency} value={currency}>{currency}</option>
          ))}
        </select>
        <select name="type" defaultValue={params.type ?? ""} className="rounded-2xl border border-line bg-white px-4 py-3 text-sm">
          <option value="">All types</option>
          {LEDGER_EVENT_TYPES.map((type) => (
            <option key={type} value={type}>{LEDGER_EVENT_LABELS[type]}</option>
          ))}
        </select>
        <input type="date" name="from" defaultValue={params.from ?? ""} className="rounded-2xl border border-line bg-white px-4 py-3 text-sm" />
        <input type="date" name="to" defaultValue={params.to ?? ""} className="rounded-2xl border border-line bg-white px-4 py-3 text-sm" />
        <button type="submit" className="rounded-(--radius-button) bg-blue px-5 py-2.5 text-sm font-semibold text-white sm:col-span-4">
          Filter
        </button>
      </form>
      {entries.length === 0 ? (
        <EmptyState title="No ledger entries" description="Financial events appear here when payments, allocations, refunds, or credit notes are recorded." />
      ) : (
        <ul className="mt-8 space-y-2 text-sm">
          {entries.map((entry) => (
            <li key={entry.publicId} className="rounded-2xl border border-line bg-white px-4 py-3">
              <p className="font-semibold text-navy-deep">{entry.publicId}</p>
              <p className="mt-1 text-muted">
                {LEDGER_EVENT_LABELS[entry.eventType as keyof typeof LEDGER_EVENT_LABELS] ?? entry.eventType}
                {" · "}
                {formatMinor(entry.amountMinor, entry.currency)} · {entry.direction}
                {entry.sourceReference ? ` · ${entry.sourceReference}` : ""}
                {" · "}
                {formatDisplayDateTime(entry.occurredAt)}
              </p>
            </li>
          ))}
        </ul>
      )}
      <ListPager page={page} itemCount={entries.length} />
    </main>
  );
}
