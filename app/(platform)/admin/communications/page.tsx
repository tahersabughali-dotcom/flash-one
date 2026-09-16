import { requirePlatformAdmin } from "@/lib/server/auth";
import { listCommunications } from "@/lib/server/operations";
import { parseListPage } from "@/lib/server/pagination";
import {
  OPERATIONS_PATHS,
  COMMUNICATION_CHANNEL_LABELS,
  COMMUNICATION_SOURCE_LABELS,
} from "@/modules/operations";
import { OpsList } from "../ops-list";

export default async function Page({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  await requirePlatformAdmin(OPERATIONS_PATHS.communications);
  const page = parseListPage((await searchParams).page);
  const rows = await listCommunications(page);
  return (
    <OpsList
      eyebrow="System"
      title="Communications"
      description="Operational records across channels. External channels are manual records until integrated."
      createHref={OPERATIONS_PATHS.communicationNew}
      createLabel="Record communication"
      emptyTitle="No communications"
      emptyDescription="Record an email, call, meeting, or other interaction. This does not send messages."
      page={page}
      items={rows.map((row) => ({
        href: OPERATIONS_PATHS.communication(row.public_id),
        publicId: row.public_id,
        title: row.title,
        status: row.source_kind,
        statusLabel: COMMUNICATION_SOURCE_LABELS[row.source_kind as keyof typeof COMMUNICATION_SOURCE_LABELS] ?? row.source_kind,
        meta: COMMUNICATION_CHANNEL_LABELS[row.channel as keyof typeof COMMUNICATION_CHANNEL_LABELS] ?? row.channel,
      }))}
    />
  );
}
