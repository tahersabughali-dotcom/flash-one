import { notFound } from "next/navigation";
import { requirePlatformAdmin } from "@/lib/server/auth";
import {
  getSupportCase,
  listCaseEvents,
  listCommunications,
  listInternalNotes,
  listDocuments,
  optionLists,
} from "@/lib/server/operations";
import { OPERATIONS_PATHS } from "@/modules/operations";
import { PageHeader } from "@/components/platform/PageHeader";
import { StatusBadge } from "@/components/platform/StatusBadge";
import { SectionPanel } from "@/components/platform/SectionPanel";
import { RelatedRecords } from "@/components/platform/RelatedRecords";
import { SupportCaseForm } from "../../ops-forms";
import { InternalNoteForm } from "../../internal-note-form";
import { formatDisplayDate } from "@/lib/format/display";

export default async function Page({ params }: { params: Promise<{ publicId: string }> }) {
  const { publicId } = await params;
  await requirePlatformAdmin(OPERATIONS_PATHS.caseDetail(publicId));
  const [record, options] = await Promise.all([getSupportCase(publicId), optionLists()]);
  if (!record) notFound();
  const [events, notes, documents, communications] = await Promise.all([
    listCaseEvents(record.id),
    listInternalNotes("case", record.public_id),
    listDocuments(1),
    listCommunications(1),
  ]);
  const relatedDocs = documents.filter((item) => item.entity_public_id === record.public_id);
  const relatedComms = communications.filter((item) => item.entity_public_id === record.public_id);
  return (
    <main>
      <PageHeader
        eyebrow={record.public_id}
        title={record.title}
        actions={<StatusBadge status={record.status} label={record.status.replace(/_/g, " ")} />}
      />
      <SupportCaseForm record={record} employees={options.employees} />
      <SectionPanel title="Timeline">
        {events.length === 0 ? (
          <p className="text-sm text-muted">No case events.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {events.map((event) => (
              <li key={event.created_at + event.summary}>
                {event.summary} · {formatDisplayDate(event.created_at)}
              </li>
            ))}
          </ul>
        )}
      </SectionPanel>
      <RelatedRecords
        title="Communications"
        empty="No related communication records."
        items={relatedComms.map((item) => ({
          href: OPERATIONS_PATHS.communication(item.public_id),
          reference: item.public_id,
          title: item.title,
          meta: `${item.channel} · ${item.source_kind}`,
        }))}
      />
      <RelatedRecords
        title="Documents"
        empty="No related documents."
        items={relatedDocs.map((item) => ({
          href: OPERATIONS_PATHS.document(item.public_id),
          reference: item.public_id,
          title: item.title,
        }))}
      />
      <SectionPanel title="Internal notes">
        <InternalNoteForm entityKind="case" entityPublicId={record.public_id} />
        {notes.length === 0 ? (
          <p className="mt-4 text-sm text-muted">No internal notes.</p>
        ) : (
          <ul className="mt-4 space-y-3 text-sm">
            {notes.map((note) => (
              <li key={note.public_id}>
                {note.content} · {formatDisplayDate(note.created_at)}
              </li>
            ))}
          </ul>
        )}
      </SectionPanel>
    </main>
  );
}
