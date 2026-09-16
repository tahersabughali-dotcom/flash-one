import Link from "next/link";
import { requirePlatformAdmin } from "@/lib/server/auth";
import { listAdjustments } from "@/lib/server/adjustments";
import { parseListPage } from "@/lib/server/pagination";
import { ListPager } from "@/components/platform/ListPager";
import { PageHeader } from "@/components/platform/PageHeader";
import { EmptyState } from "@/components/platform/EmptyState";
import { RecordCard } from "@/components/platform/RecordCard";
import { formatMinor } from "@/modules/invoices";
import { ADJUSTMENT_KIND_LABELS, ADJUSTMENT_PATHS } from "@/modules/adjustments";

export default async function AdminAdjustmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  await requirePlatformAdmin(ADJUSTMENT_PATHS.adminList);
  const page = parseListPage((await searchParams).page);
  const adjustments = await listAdjustments(page);
  return (
    <main>
      <PageHeader
        eyebrow="Finance"
        title="Adjustments"
        description="Corrections that do not rewrite immutable payment or invoice history. Every adjustment needs a reason."
        actions={
          <Link href={ADJUSTMENT_PATHS.adminNew} className="rounded-(--radius-button) bg-blue px-5 py-2.5 text-sm font-semibold text-white">
            Record adjustment
          </Link>
        }
      />
      {adjustments.length === 0 ? (
        <EmptyState title="No adjustments" description="Use an adjustment instead of editing historical financial records." />
      ) : (
        <ul className="mt-8 space-y-3">
          {adjustments.map((item) => (
            <li key={item.publicId}>
              <RecordCard
                href={ADJUSTMENT_PATHS.adminDetail(item.publicId)}
                reference={item.publicId}
                title={formatMinor(item.amountMinor, item.currency)}
                meta={`${ADJUSTMENT_KIND_LABELS[item.kind]} · ${item.reason}`}
              />
            </li>
          ))}
        </ul>
      )}
      <ListPager page={page} itemCount={adjustments.length} />
    </main>
  );
}
