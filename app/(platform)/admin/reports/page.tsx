import Link from "next/link";
import { requirePlatformAdmin } from "@/lib/server/auth";
import { getFinanceReport } from "@/lib/server/reports";
import { formatMinor } from "@/modules/invoices";
import { REPORT_PATHS } from "@/modules/reports";
import { PageHeader } from "@/components/platform/PageHeader";
import { SectionPanel } from "@/components/platform/SectionPanel";
import { financialStatusLabel } from "@/modules/finance";
import type { CurrencyTotal } from "@/lib/server/reports";

function Totals({ totals }: { totals: CurrencyTotal[] }) {
  if (totals.length === 0) {
    return <p className="text-sm text-muted">None.</p>;
  }
  return (
    <ul className="space-y-1 text-sm">
      {totals.map((row) => (
        <li key={row.currency}>
          {row.currency} {formatMinor(row.amountMinor, row.currency)}
          {row.count ? ` · ${row.count} records` : ""}
        </li>
      ))}
    </ul>
  );
}

export default async function AdminReportsPage() {
  await requirePlatformAdmin(REPORT_PATHS.admin);
  const report = await getFinanceReport();
  return (
    <main>
      <PageHeader
        eyebrow="Finance"
        title="Reports"
        description="Currency totals are listed separately. GBP, EUR, and USD are never added together. These are operational totals, not profit."
      />
      <div className="mt-6 flex flex-wrap gap-3 text-sm">
        <Link href={REPORT_PATHS.exportInvoices} className="font-semibold text-blue">Export invoices CSV</Link>
        <Link href={REPORT_PATHS.exportPayments} className="font-semibold text-blue">Export payments CSV</Link>
        <Link href={REPORT_PATHS.exportReceipts} className="font-semibold text-blue">Export receipts CSV</Link>
        <Link href={REPORT_PATHS.exportReconciliation} className="font-semibold text-blue">Export reconciliation CSV</Link>
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <SectionPanel title="Invoices by status">
          {report.invoicesByStatus.map((group) => (
            <div key={group.status} className="mb-4">
              <p className="text-sm font-semibold text-navy-deep">{financialStatusLabel(group.status)}</p>
              <Totals totals={group.totals} />
            </div>
          ))}
        </SectionPanel>
        <SectionPanel title="Outstanding invoice balances">
          <Totals totals={report.outstandingInvoiceBalances} />
        </SectionPanel>
        <SectionPanel title="Payments by status">
          {report.paymentsByStatus.map((group) => (
            <div key={group.status} className="mb-4">
              <p className="text-sm font-semibold text-navy-deep">{financialStatusLabel(group.status)}</p>
              <Totals totals={group.totals} />
            </div>
          ))}
        </SectionPanel>
        <SectionPanel title="Payments by source">
          {report.paymentsBySource.map((group) => (
            <div key={group.source} className="mb-4">
              <p className="text-sm font-semibold text-navy-deep">{group.source}</p>
              <Totals totals={group.totals} />
            </div>
          ))}
        </SectionPanel>
        <SectionPanel title="Receipts issued">
          <Totals totals={report.receiptsIssued} />
        </SectionPanel>
        <SectionPanel title="Unallocated payment amounts">
          <Totals totals={report.unallocatedPayments} />
        </SectionPanel>
        <SectionPanel title="Refund totals">
          <Totals totals={report.refundTotals} />
        </SectionPanel>
        <SectionPanel title="Reconciliation status">
          {report.reconciliationByStatus.map((group) => (
            <div key={group.status} className="mb-4">
              <p className="text-sm font-semibold text-navy-deep">{financialStatusLabel(group.status)}</p>
              <Totals totals={group.totals} />
            </div>
          ))}
        </SectionPanel>
      </div>
    </main>
  );
}
