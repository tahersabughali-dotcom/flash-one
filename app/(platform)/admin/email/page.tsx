import { requirePlatformAdmin } from "@/lib/server/auth";
import { listEmailMessages } from "@/lib/server/platform/settings-queries";
import { parseListPage } from "@/lib/server/pagination";
import { INTEGRATION_PATHS } from "@/modules/integrations";
import { OpsList } from "../ops-list";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  await requirePlatformAdmin(INTEGRATION_PATHS.email);
  const page = parseListPage((await searchParams).page);
  const rows = await listEmailMessages(page);
  return (
    <OpsList
      eyebrow="System"
      title="Email"
      description="Transactional email foundation. Without a provider, status remains unavailable. Messages are not marked sent."
      emptyTitle="No email records"
      emptyDescription="Queued transactional email records will appear here. In-app notifications continue normally."
      page={page}
      items={rows.map((row) => ({
        href: INTEGRATION_PATHS.email,
        publicId: row.public_id,
        title: row.subject,
        status: row.status,
        statusLabel: row.status,
        meta: `${row.template_code}${row.error_summary ? ` · ${row.error_summary}` : ""}`,
      }))}
    />
  );
}
