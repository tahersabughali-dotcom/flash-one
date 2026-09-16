import { requirePlatformAdmin } from "@/lib/server/auth";
import { listImportBatches } from "@/lib/server/platform/settings-queries";
import { parseListPage } from "@/lib/server/pagination";
import { INTEGRATION_PATHS } from "@/modules/integrations";
import { OpsList } from "../ops-list";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  await requirePlatformAdmin(INTEGRATION_PATHS.imports);
  const page = parseListPage((await searchParams).page);
  const rows = await listImportBatches(page);
  return (
    <OpsList
      eyebrow="System"
      title="Import Center"
      description="Upload → parse → validate → preview → human approval → apply. Imports never become financial truth automatically."
      createHref={INTEGRATION_PATHS.importNew}
      createLabel="New import"
      emptyTitle="No imports"
      emptyDescription="Create an import batch when you need to review business data before applying non-financial records."
      page={page}
      items={rows.map((row) => ({
        href: INTEGRATION_PATHS.importDetail(row.public_id),
        publicId: row.public_id,
        title: row.filename || row.import_type,
        status: row.status,
        statusLabel: row.status.replace(/_/g, " "),
        meta: `${row.row_count} rows · ${row.error_count} errors · ${row.review_state}`,
      }))}
    />
  );
}
