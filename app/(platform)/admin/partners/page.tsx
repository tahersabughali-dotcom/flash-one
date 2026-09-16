import { requirePlatformAdmin } from "@/lib/server/auth";
import { listPartners } from "@/lib/server/operations";
import { parseListPage } from "@/lib/server/pagination";
import { OPERATIONS_PATHS, NETWORK_STATUS_LABELS } from "@/modules/operations";
import { OpsList } from "../ops-list";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  await requirePlatformAdmin(OPERATIONS_PATHS.partners);
  const page = parseListPage((await searchParams).page);
  const rows = await listPartners(page);
  return (
    <OpsList
      eyebrow="People & network"
      title="Partner companies"
      description="Internal partner records. This is not a public partnership claim."
      createHref={OPERATIONS_PATHS.partnerNew}
      createLabel="New partner"
      emptyTitle="No partner companies"
      emptyDescription="Add a partner company when Flash One cooperates with another technology business."
      page={page}
      items={rows.map((row) => ({
        href: OPERATIONS_PATHS.partner(row.publicId),
        publicId: row.publicId,
        title: row.title,
        status: row.status,
        statusLabel: NETWORK_STATUS_LABELS[row.status as keyof typeof NETWORK_STATUS_LABELS] ?? row.status,
        meta: row.meta,
      }))}
    />
  );
}
