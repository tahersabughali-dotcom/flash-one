import { requirePlatformAdmin } from "@/lib/server/auth";
import { listIncidents } from "@/lib/server/platform/settings-queries";
import { parseListPage } from "@/lib/server/pagination";
import { INTEGRATION_PATHS } from "@/modules/integrations";
import { OpsList } from "../ops-list";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  await requirePlatformAdmin(INTEGRATION_PATHS.incidents);
  const page = parseListPage((await searchParams).page);
  const rows = await listIncidents(page);
  return (
    <OpsList
      eyebrow="System"
      title="Incidents"
      description="Internal operational incidents. Not a public status page and not uptime claims."
      createHref={INTEGRATION_PATHS.incidentNew}
      createLabel="New incident"
      emptyTitle="No incidents"
      emptyDescription="Record an internal incident when something needs operational tracking."
      page={page}
      items={rows.map((row) => ({
        href: INTEGRATION_PATHS.incident(row.public_id),
        publicId: row.public_id,
        title: row.title,
        status: row.status,
        statusLabel: row.status.replace(/_/g, " "),
        meta: `${row.severity} · ${row.affected_module}`,
      }))}
    />
  );
}
