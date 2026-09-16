import { requirePlatformAdmin } from "@/lib/server/auth";
import { listSuppliers } from "@/lib/server/operations";
import { parseListPage } from "@/lib/server/pagination";
import { OPERATIONS_PATHS, NETWORK_STATUS_LABELS } from "@/modules/operations";
import { OpsList } from "../ops-list";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  await requirePlatformAdmin(OPERATIONS_PATHS.suppliers);
  const page = parseListPage((await searchParams).page);
  const rows = await listSuppliers(page);
  return (
    <OpsList
      eyebrow="People & network"
      title="Suppliers"
      description="Suppliers Flash One buys from. Separate from customers and partners."
      createHref={OPERATIONS_PATHS.supplierNew}
      createLabel="New supplier"
      emptyTitle="No suppliers"
      emptyDescription="Add a supplier for software, hosting, freelance, or professional services Flash One buys."
      page={page}
      items={rows.map((row) => ({
        href: OPERATIONS_PATHS.supplier(row.publicId),
        publicId: row.publicId,
        title: row.title,
        status: row.status,
        statusLabel: NETWORK_STATUS_LABELS[row.status as keyof typeof NETWORK_STATUS_LABELS] ?? row.status,
        meta: row.meta,
      }))}
    />
  );
}
