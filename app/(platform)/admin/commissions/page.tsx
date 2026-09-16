import { requirePlatformAdmin } from "@/lib/server/auth";
import { listCommissions } from "@/lib/server/operations";
import { parseListPage } from "@/lib/server/pagination";
import { OPERATIONS_PATHS, COMMISSION_STATUS_LABELS } from "@/modules/operations";
import { formatMinor, asMinor } from "@/modules/invoices/money";
import { OpsList } from "../ops-list";

export default async function Page({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  await requirePlatformAdmin(OPERATIONS_PATHS.commissions);
  const page = parseListPage((await searchParams).page);
  const rows = await listCommissions(page);
  return (
    <OpsList
      eyebrow="Finance"
      title="Commissions"
      description="Explicit commission only. Not profit and not calculated from gross payments automatically."
      createHref={OPERATIONS_PATHS.commissionNew}
      createLabel="New commission"
      emptyTitle="No commissions"
      emptyDescription="Create a commission only when it is explicitly agreed."
      page={page}
      items={rows.map((row) => ({
        href: OPERATIONS_PATHS.commission(row.public_id),
        publicId: row.public_id,
        title: row.reason,
        status: row.status,
        statusLabel: COMMISSION_STATUS_LABELS[row.status as keyof typeof COMMISSION_STATUS_LABELS] ?? row.status,
        meta: `${formatMinor(asMinor(row.amount_minor), row.currency)} · ${row.calculation_type}`,
      }))}
    />
  );
}
