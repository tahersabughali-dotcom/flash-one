import { notFound } from "next/navigation";
import { requirePlatformAdmin } from "@/lib/server/auth";
import { getCommunication } from "@/lib/server/operations";
import { OPERATIONS_PATHS, COMMUNICATION_CHANNEL_LABELS, COMMUNICATION_SOURCE_LABELS } from "@/modules/operations";
import { PageHeader } from "@/components/platform/PageHeader";
import { StatusBadge } from "@/components/platform/StatusBadge";
import { formatDisplayDate } from "@/lib/format/display";

export default async function Page({ params }: { params: Promise<{ publicId: string }> }) {
  const { publicId } = await params;
  await requirePlatformAdmin(OPERATIONS_PATHS.communication(publicId));
  const record = await getCommunication(publicId);
  if (!record) notFound();
  return (
    <main>
      <PageHeader
        eyebrow={record.public_id}
        title={record.title}
        description={`${COMMUNICATION_CHANNEL_LABELS[record.channel as keyof typeof COMMUNICATION_CHANNEL_LABELS] ?? record.channel} · ${COMMUNICATION_SOURCE_LABELS[record.source_kind as keyof typeof COMMUNICATION_SOURCE_LABELS] ?? record.source_kind}`}
        actions={<StatusBadge status={record.source_kind} label={record.source_kind.replace(/_/g, " ")} />}
      />
      <p className="mt-4 text-sm">Occurred {formatDisplayDate(record.occurred_at)}</p>
      <p className="mt-2 text-sm text-muted">Recorded {formatDisplayDate(record.recorded_at)}</p>
      {record.body ? <p className="mt-6 whitespace-pre-wrap text-[15px]">{record.body}</p> : null}
    </main>
  );
}
