import { notFound } from "next/navigation";
import { requirePlatformAdmin } from "@/lib/server/auth";
import { getExpense, listInternalNotes, optionLists } from "@/lib/server/operations";
import { OPERATIONS_PATHS } from "@/modules/operations";
import { PageHeader } from "@/components/platform/PageHeader";
import { StatusBadge } from "@/components/platform/StatusBadge";
import { SectionPanel } from "@/components/platform/SectionPanel";
import { ExpenseForm } from "../../ops-forms";
import { InternalNoteForm } from "../../internal-note-form";
import { formatDisplayDate } from "@/lib/format/display";

export default async function Page({ params }: { params: Promise<{ publicId: string }> }) {
  const { publicId } = await params;
  await requirePlatformAdmin(OPERATIONS_PATHS.expense(publicId));
  const [record, options] = await Promise.all([getExpense(publicId), optionLists()]);
  if (!record) notFound();
  const notes = await listInternalNotes("expense", record.public_id);
  return (
    <main>
      <PageHeader
        eyebrow={record.public_id}
        title={record.description}
        actions={<StatusBadge status={record.status} label={record.status.replace(/_/g, " ")} />}
      />
      <ExpenseForm record={record} options={options} />
      <SectionPanel title="Internal notes">
        <InternalNoteForm entityKind="expense" entityPublicId={record.public_id} />
        {notes.length === 0 ? <p className="mt-4 text-sm text-muted">No internal notes.</p> : (
          <ul className="mt-4 space-y-3 text-sm">
            {notes.map((note) => (
              <li key={note.public_id}>{note.content} · {formatDisplayDate(note.created_at)}</li>
            ))}
          </ul>
        )}
      </SectionPanel>
    </main>
  );
}
