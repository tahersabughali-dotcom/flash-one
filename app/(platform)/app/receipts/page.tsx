import { requireCompletedOnboarding } from "@/lib/server/account";
import { listCustomerReceipts } from "@/lib/server/receipts";
import { parseListPage } from "@/lib/server/pagination";
import { ListPager } from "@/components/platform/ListPager";
import { PageHeader } from "@/components/platform/PageHeader";
import { EmptyState } from "@/components/platform/EmptyState";
import { RecordCard } from "@/components/platform/RecordCard";
import { formatMinor } from "@/modules/invoices";
import { formatDisplayDate } from "@/lib/format/display";
import { RECEIPT_PATHS } from "@/modules/receipts";

export default async function CustomerReceiptsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { session } = await requireCompletedOnboarding(RECEIPT_PATHS.list);
  const page = parseListPage((await searchParams).page);
  const receipts = await listCustomerReceipts(session.userId, page);

  return (
    <main>
      <PageHeader
        eyebrow="Finance"
        title="Receipts"
        description="Evidence that Flash One recorded money received. A receipt is not an invoice."
      />
      {receipts.length === 0 ? (
        <EmptyState
          title="No receipts yet"
          description="Receipts appear after a recorded payment is issued to your relationship."
        />
      ) : (
        <ul className="mt-8 space-y-3">
          {receipts.map((receipt) => (
            <li key={receipt.publicId}>
              <RecordCard
                href={RECEIPT_PATHS.detail(receipt.publicId)}
                reference={receipt.receiptNumber}
                title={formatMinor(receipt.amountMinor, receipt.currency)}
                meta={`${receipt.sourceLabel} · ${formatDisplayDate(receipt.issuedAt)}`}
              />
            </li>
          ))}
        </ul>
      )}
      <ListPager page={page} itemCount={receipts.length} />
    </main>
  );
}
