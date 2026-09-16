import Link from "next/link";
import { requirePlatformAdmin } from "@/lib/server/auth";
import { listCreditNotes } from "@/lib/server/credit-notes";
import { parseListPage } from "@/lib/server/pagination";
import { ListPager } from "@/components/platform/ListPager";
import { PageHeader } from "@/components/platform/PageHeader";
import { EmptyState } from "@/components/platform/EmptyState";
import { RecordCard } from "@/components/platform/RecordCard";
import { formatMinor } from "@/modules/invoices";
import { CREDIT_NOTE_PATHS, CREDIT_NOTE_STATUS_LABELS } from "@/modules/credit-notes";

export default async function AdminCreditNotesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  await requirePlatformAdmin(CREDIT_NOTE_PATHS.adminList);
  const page = parseListPage((await searchParams).page);
  const notes = await listCreditNotes(page);
  return (
    <main>
      <PageHeader
        eyebrow="Finance"
        title="Credit notes"
        description="Reduce remaining invoice balance without rewriting the original invoice. This is not a UK VAT credit-note claim."
        actions={
          <Link
            href={CREDIT_NOTE_PATHS.adminNew}
            className="rounded-(--radius-button) bg-blue px-5 py-2.5 text-sm font-semibold text-white"
          >
            New credit note
          </Link>
        }
      />
      {notes.length === 0 ? (
        <EmptyState title="No credit notes" description="Create a draft against an issued invoice with remaining balance." />
      ) : (
        <ul className="mt-8 space-y-3">
          {notes.map((note) => (
            <li key={note.publicId}>
              <RecordCard
                href={CREDIT_NOTE_PATHS.adminDetail(note.publicId)}
                reference={note.creditNoteNumber ?? note.publicId}
                title={formatMinor(note.amountMinor, note.currency)}
                status={note.status}
                statusLabel={CREDIT_NOTE_STATUS_LABELS[note.status]}
                meta={note.invoicePublicId}
              />
            </li>
          ))}
        </ul>
      )}
      <ListPager page={page} itemCount={notes.length} />
    </main>
  );
}
