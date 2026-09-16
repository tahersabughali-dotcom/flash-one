import Link from "next/link";
import { requirePlatformAdmin } from "@/lib/server/auth";
import { getFinanceReport } from "@/lib/server/reports";
import { getOperationsReport } from "@/lib/server/operations";
import { OPERATIONS_PATHS } from "@/modules/operations";
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
  const [report, operations] = await Promise.all([getFinanceReport(), getOperationsReport()]);
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
        <Link href={OPERATIONS_PATHS.exportExpenses} className="font-semibold text-blue">Export expenses CSV</Link>
        <Link href={OPERATIONS_PATHS.exportPayouts} className="font-semibold text-blue">Export payouts CSV</Link>
        <Link href={OPERATIONS_PATHS.exportCases} className="font-semibold text-blue">Export cases CSV</Link>
        <Link href={OPERATIONS_PATHS.exportSuppliers} className="font-semibold text-blue">Export suppliers CSV</Link>
        <Link href={OPERATIONS_PATHS.exportFreelancers} className="font-semibold text-blue">Export freelancers CSV</Link>
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
        <SectionPanel title="Projects by status">
          {operations.projectsByStatus.map((group) => (
            <p key={group.status} className="mb-2 text-sm">
              {financialStatusLabel(group.status)} · {group.count}
            </p>
          ))}
        </SectionPanel>
        <SectionPanel title="Tasks by status">
          {operations.tasksByStatus.map((group) => (
            <p key={group.status} className="mb-2 text-sm">
              {financialStatusLabel(group.status)} · {group.count}
            </p>
          ))}
        </SectionPanel>
        <SectionPanel title="Open cases">
          <p className="text-sm">{operations.openCases}</p>
        </SectionPanel>
        <SectionPanel title="Expenses by category">
          {operations.expensesByCategory.length === 0 ? (
            <p className="text-sm text-muted">None.</p>
          ) : (
            operations.expensesByCategory.map((row) => (
              <p key={`${row.category}-${row.currency}`} className="mb-2 text-sm">
                {row.category} · {row.currency} {formatMinor(row.amountMinor, row.currency)} · {row.count}
              </p>
            ))
          )}
        </SectionPanel>
        <SectionPanel title="Payouts by status">
          {operations.payoutsByStatus.length === 0 ? (
            <p className="text-sm text-muted">None.</p>
          ) : (
            operations.payoutsByStatus.map((row) => (
              <p key={`${row.status}-${row.currency}`} className="mb-2 text-sm">
                {row.status} · {row.currency} {formatMinor(row.amountMinor, row.currency)} · {row.count}
              </p>
            ))
          )}
        </SectionPanel>
        <SectionPanel title="Freelancer obligations">
          {operations.freelancerObligations.length === 0 ? (
            <p className="text-sm text-muted">None.</p>
          ) : (
            operations.freelancerObligations.map((row) => (
              <p key={row.currency} className="mb-2 text-sm">
                {row.currency} {formatMinor(row.amountMinor, row.currency)} · {row.count}
              </p>
            ))
          )}
        </SectionPanel>
        <SectionPanel title="Supplier obligations">
          {operations.supplierObligations.length === 0 ? (
            <p className="text-sm text-muted">None.</p>
          ) : (
            operations.supplierObligations.map((row) => (
              <p key={row.currency} className="mb-2 text-sm">
                {row.currency} {formatMinor(row.amountMinor, row.currency)} · {row.count}
              </p>
            ))
          )}
        </SectionPanel>
        <SectionPanel title="Commission status">
          {operations.commissionsByStatus.length === 0 ? (
            <p className="text-sm text-muted">None.</p>
          ) : (
            operations.commissionsByStatus.map((row) => (
              <p key={`${row.status}-${row.currency}`} className="mb-2 text-sm">
                {row.status} · {row.currency} {formatMinor(row.amountMinor, row.currency)} · {row.count}
              </p>
            ))
          )}
        </SectionPanel>
      </div>
    </main>
  );
}
