import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePlatformAdmin } from "@/lib/server/auth";
import { getCreditNoteByPublicId } from "@/lib/server/credit-notes";
import { formatMinor } from "@/modules/invoices";
import { INVOICE_PATHS } from "@/modules/invoices";
import { CREDIT_NOTE_PATHS, CREDIT_NOTE_STATUS_LABELS } from "@/modules/credit-notes";
import { PageHeader } from "@/components/platform/PageHeader";
import { StatusBadge } from "@/components/platform/StatusBadge";
import { adminIssueCreditNoteAction, adminVoidCreditNoteAction } from "../../commercial-actions";

export default async function AdminCreditNoteDetailPage({
  params,
}: {
  params: Promise<{ publicId: string }>;
}) {
  const { publicId } = await params;
  await requirePlatformAdmin(CREDIT_NOTE_PATHS.adminDetail(publicId));
  const note = await getCreditNoteByPublicId(publicId);
  if (!note) {
    notFound();
  }
  return (
    <main>
      <PageHeader
        eyebrow={note.creditNoteNumber ?? note.publicId}
        title={formatMinor(note.amountMinor, note.currency)}
        actions={<StatusBadge status={note.status} label={CREDIT_NOTE_STATUS_LABELS[note.status]} />}
      />
      <p className="mt-4 text-sm">{note.reason}</p>
      <p className="mt-4 text-sm">
        Invoice{" "}
        <Link href={INVOICE_PATHS.adminDetail(note.invoicePublicId)} className="font-semibold text-blue">
          {note.invoicePublicId}
        </Link>
      </p>
      {note.status === "draft" ? (
        <div className="mt-6 flex flex-wrap gap-3">
          <form action={adminIssueCreditNoteAction}>
            <input type="hidden" name="publicId" value={note.publicId} />
            <button type="submit" className="rounded-(--radius-button) bg-blue px-5 py-2.5 text-sm font-semibold text-white">
              Issue credit note
            </button>
          </form>
          <form action={adminVoidCreditNoteAction}>
            <input type="hidden" name="publicId" value={note.publicId} />
            <button type="submit" className="rounded-(--radius-button) border border-line bg-white px-5 py-2.5 text-sm font-semibold">
              Void draft
            </button>
          </form>
        </div>
      ) : null}
    </main>
  );
}
