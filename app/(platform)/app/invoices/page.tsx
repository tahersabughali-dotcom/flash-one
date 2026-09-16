import { requireCompletedOnboarding } from "@/lib/server/account";
import { listCustomerInvoices } from "@/lib/server/invoices";
import { parseListPage } from "@/lib/server/pagination";
import { ListPager } from "@/components/platform/ListPager";
import { PageHeader } from "@/components/platform/PageHeader";
import { EmptyState } from "@/components/platform/EmptyState";
import { RecordCard } from "@/components/platform/RecordCard";
import { formatDisplayDate } from "@/lib/format/display";
import {
  formatMinor,
  INVOICE_PATHS,
  INVOICE_STATUS_LABELS,
} from "@/modules/invoices";

export default async function CustomerInvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { session } = await requireCompletedOnboarding(INVOICE_PATHS.list);
  const page = parseListPage((await searchParams).page);
  const invoices = await listCustomerInvoices(session.userId, page);

  return (
    <main>
      <PageHeader
        eyebrow="Finance"
        title="Invoices"
        description="Issued invoices for your individual relationship or organizations you belong to."
      />
      {invoices.length === 0 ? (
        <EmptyState
          title="No invoices yet"
          description="Issued invoices appear here when Flash One bills work or store purchases."
        />
      ) : (
        <ul className="mt-8 space-y-3">
          {invoices.map((invoice) => (
            <li key={invoice.publicId}>
              <RecordCard
                href={INVOICE_PATHS.detail(invoice.publicId)}
                reference={invoice.invoiceNumber ?? invoice.publicId}
                title={formatMinor(invoice.totalMinor, invoice.currency)}
                status={invoice.displayStatus}
                statusLabel={
                  invoice.displayStatus === "overdue"
                    ? "Overdue"
                    : INVOICE_STATUS_LABELS[invoice.status]
                }
                meta={invoice.issueDate ? formatDisplayDate(invoice.issueDate) : undefined}
              />
            </li>
          ))}
        </ul>
      )}
      <ListPager page={page} itemCount={invoices.length} />
    </main>
  );
}
