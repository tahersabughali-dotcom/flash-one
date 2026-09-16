import { requirePlatformAdmin } from "@/lib/server/auth";
import { listFreelancers } from "@/lib/server/operations";
import { parseListPage } from "@/lib/server/pagination";
import { OPERATIONS_PATHS, NETWORK_STATUS_LABELS } from "@/modules/operations";
import { OpsList } from "../ops-list";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  await requirePlatformAdmin(OPERATIONS_PATHS.freelancers);
  const page = parseListPage((await searchParams).page);
  const rows = await listFreelancers(page);
  return (
    <OpsList
      eyebrow="People & network"
      title="Freelancers"
      description="Freelancer commercial relationships. A freelancer may also be a developer, but these remain separate."
      createHref={OPERATIONS_PATHS.freelancerNew}
      createLabel="New freelancer"
      emptyTitle="No freelancers"
      emptyDescription="Add a freelancer when Flash One has a genuine freelance relationship."
      page={page}
      items={rows.map((row) => ({
        href: OPERATIONS_PATHS.freelancer(row.publicId),
        publicId: row.publicId,
        title: row.title,
        status: row.status,
        statusLabel: NETWORK_STATUS_LABELS[row.status as keyof typeof NETWORK_STATUS_LABELS] ?? row.status,
        meta: row.meta,
      }))}
    />
  );
}
