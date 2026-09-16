import { requirePlatformAdmin } from "@/lib/server/auth";
import { listReleaseRecords } from "@/lib/server/platform/settings-queries";
import { parseListPage } from "@/lib/server/pagination";
import { INTEGRATION_PATHS } from "@/modules/integrations";
import { OpsList } from "../ops-list";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  await requirePlatformAdmin(INTEGRATION_PATHS.releases);
  const page = parseListPage((await searchParams).page);
  const rows = await listReleaseRecords(page);
  return (
    <OpsList
      eyebrow="System"
      title="Releases"
      description="Lightweight change records. Recording a release does not mean deployment occurred."
      createHref={INTEGRATION_PATHS.releaseNew}
      createLabel="Record release"
      emptyTitle="No release records"
      emptyDescription="Record a version or change note when useful. This is not automatic deployment proof."
      page={page}
      items={rows.map((row) => ({
        href: INTEGRATION_PATHS.releases,
        publicId: row.public_id,
        title: row.version_name,
        status: row.status,
        statusLabel: row.status,
        meta: `${row.environment_label}${row.commit_reference ? ` · ${row.commit_reference}` : ""}`,
      }))}
    />
  );
}
