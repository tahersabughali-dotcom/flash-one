import { notFound } from "next/navigation";
import { requirePlatformAdmin } from "@/lib/server/auth";
import { getPartner, listInternalNotes, listOperationalActivity } from "@/lib/server/operations";
import { OPERATIONS_PATHS } from "@/modules/operations";
import { PageHeader } from "@/components/platform/PageHeader";
import { StatusBadge } from "@/components/platform/StatusBadge";
import { SectionPanel } from "@/components/platform/SectionPanel";
import { PartnerForm } from "../../ops-forms";
import { InternalNoteForm } from "../../internal-note-form";
import { formatDisplayDate } from "@/lib/format/display";

export default async function Page({ params }: { params: Promise<{ publicId: string }> }) {
  const { publicId } = await params;
  await requirePlatformAdmin(OPERATIONS_PATHS.partner(publicId));
  const record = await getPartner(publicId);
  if (!record) notFound();
  const [notes, activity] = await Promise.all([
    listInternalNotes("partner", record.public_id),
    listOperationalActivity("partner", record.public_id),
  ]);
  return (
    <main>
      <PageHeader
        eyebrow={record.public_id}
        title={record.name}
        actions={<StatusBadge status={record.status} label={record.status.replace(/_/g, " ")} />}
      />
      <PartnerForm record={record} />
      <SectionPanel title="Internal notes">
        <InternalNoteForm entityKind="partner" entityPublicId={record.public_id} />
        {notes.length === 0 ? (
          <p className="mt-4 text-sm text-muted">No internal notes.</p>
        ) : (
          <ul className="mt-4 space-y-3 text-sm">
            {notes.map((note) => (
              <li key={note.public_id} className="rounded-2xl border border-line bg-white px-4 py-3">
                <p>{note.content}</p>
                <p className="mt-2 text-muted">{formatDisplayDate(note.created_at)}</p>
              </li>
            ))}
          </ul>
        )}
      </SectionPanel>
      <SectionPanel title="Activity">
        {activity.length === 0 ? (
          <p className="text-sm text-muted">No recorded activity.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {activity.map((item) => (
              <li key={item.created_at + item.summary}>
                {item.summary} · {formatDisplayDate(item.occurred_at)}
              </li>
            ))}
          </ul>
        )}
      </SectionPanel>
    </main>
  );
}
