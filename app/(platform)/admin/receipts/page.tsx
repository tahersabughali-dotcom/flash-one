import { requirePlatformAdmin } from "@/lib/server/auth";
import { listReceipts } from "@/lib/server/receipts";
import { parseListPage } from "@/lib/server/pagination";
import { ListPager } from "@/components/platform/ListPager";
import { PageHeader } from "@/components/platform/PageHeader";
import { EmptyState } from "@/components/platform/EmptyState";
import { RecordCard } from "@/components/platform/RecordCard";
import { formatMinor } from "@/modules/invoices";
import { formatDisplayDate } from "@/lib/format/display";
import { RECEIPT_PATHS } from "@/modules/receipts";

export default async function AdminReceiptsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  await requirePlatformAdmin(RECEIPT_PATHS.adminList);
  const page = parseListPage((await searchParams).page);
  const receipts = await listReceipts(page);

  return (
    <main>
      <PageHeader
        eyebrow="Finance"
        title="Receipts"
        description="Customer-facing evidence that money was recorded. This is not a ledger or reconciliation view."
      />
      {receipts.length === 0 ? (
        <EmptyState
          title="No receipts yet"
          description="Receipts are created from recorded payments."
        />
      ) : (
        <ul className="mt-8 space-y-3">
          {receipts.map((receipt) => (
            <li key={receipt.publicId}>
              <RecordCard
                href={RECEIPT_PATHS.adminDetail(receipt.publicId)}
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
