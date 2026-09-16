import { requirePlatformAdmin } from "@/lib/server/auth";
import { listProcurement } from "@/lib/server/operations";
import { parseListPage } from "@/lib/server/pagination";
import { OPERATIONS_PATHS, PROCUREMENT_STATUS_LABELS } from "@/modules/operations";
import { OpsList } from "../ops-list";

export default async function Page({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  await requirePlatformAdmin(OPERATIONS_PATHS.procurement);
  const page = parseListPage((await searchParams).page);
  const rows = await listProcurement(page);
  return (
    <OpsList
      eyebrow="Finance"
      title="Procurement"
      description="Flash One buying something. This is not customer revenue and is not automatically paid."
      createHref={OPERATIONS_PATHS.procurementNew}
      createLabel="New purchase"
      emptyTitle="No purchases"
      emptyDescription="Record a purchase when Flash One buys software, services, freelance work, or infrastructure."
      page={page}
      items={rows.map((row) => ({
        href: OPERATIONS_PATHS.purchase(row.publicId),
        publicId: row.publicId,
        title: row.title,
        status: row.status,
        statusLabel: PROCUREMENT_STATUS_LABELS[row.status as keyof typeof PROCUREMENT_STATUS_LABELS] ?? row.status,
        meta: row.meta,
      }))}
    />
  );
}
