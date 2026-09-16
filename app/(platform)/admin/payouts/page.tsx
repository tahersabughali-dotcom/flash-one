import { requirePlatformAdmin } from "@/lib/server/auth";
import { listPayouts } from "@/lib/server/operations";
import { parseListPage } from "@/lib/server/pagination";
import { OPERATIONS_PATHS, PAYOUT_STATUS_LABELS } from "@/modules/operations";
import { formatMinor, asMinor } from "@/modules/invoices/money";
import { OpsList } from "../ops-list";

export default async function Page({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  await requirePlatformAdmin(OPERATIONS_PATHS.payouts);
  const page = parseListPage((await searchParams).page);
  const rows = await listPayouts(page);
  return (
    <OpsList
      eyebrow="Finance"
      title="Payouts"
      description="Provider-independent payables. Paid only when a truthful manual payment is recorded."
      createHref={OPERATIONS_PATHS.payoutNew}
      createLabel="New payout"
      emptyTitle="No payouts"
      emptyDescription="Create a payout when Flash One may owe a freelancer, employee, supplier, or partner."
      page={page}
      items={rows.map((row) => ({
        href: OPERATIONS_PATHS.payout(row.public_id),
        publicId: row.public_id,
        title: row.reason,
        status: row.status,
        statusLabel: PAYOUT_STATUS_LABELS[row.status as keyof typeof PAYOUT_STATUS_LABELS] ?? row.status,
        meta: `${formatMinor(asMinor(row.amount_minor), row.currency)} · ${row.beneficiary_kind}`,
      }))}
    />
  );
}
