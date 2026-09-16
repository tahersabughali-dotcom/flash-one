import Link from "next/link";
import { requirePlatformAdmin } from "@/lib/server/auth";
import { listRefunds } from "@/lib/server/refunds";
import { parseListPage } from "@/lib/server/pagination";
import { ListPager } from "@/components/platform/ListPager";
import { PageHeader } from "@/components/platform/PageHeader";
import { EmptyState } from "@/components/platform/EmptyState";
import { RecordCard } from "@/components/platform/RecordCard";
import { formatMinor } from "@/modules/invoices";
import { REFUND_PATHS, REFUND_STATUS_LABELS } from "@/modules/refunds";
import { formatDisplayDate } from "@/lib/format/display";

export default async function AdminRefundsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  await requirePlatformAdmin(REFUND_PATHS.adminList);
  const page = parseListPage((await searchParams).page);
  const refunds = await listRefunds(page);
  return (
    <main>
      <PageHeader
        eyebrow="Finance"
        title="Refunds"
        description="Internal refund records. These do not call PayPal, Stripe, Wise, WorldFirst, or USDT. The original payment amount stays unchanged."
        actions={
          <Link
            href={REFUND_PATHS.adminNew}
            className="rounded-(--radius-button) bg-blue px-5 py-2.5 text-sm font-semibold text-white"
          >
            Record refund
          </Link>
        }
      />
      {refunds.length === 0 ? (
        <EmptyState title="No refunds" description="Record a refund against a genuine payment." />
      ) : (
        <ul className="mt-8 space-y-3">
          {refunds.map((refund) => (
            <li key={refund.publicId}>
              <RecordCard
                href={REFUND_PATHS.adminDetail(refund.publicId)}
                reference={refund.publicId}
                title={formatMinor(refund.amountMinor, refund.currency)}
                status={refund.status}
                statusLabel={REFUND_STATUS_LABELS[refund.status]}
                meta={`${refund.paymentPublicId} · ${formatDisplayDate(refund.recordedAt)}`}
              />
            </li>
          ))}
        </ul>
      )}
      <ListPager page={page} itemCount={refunds.length} />
    </main>
  );
}
