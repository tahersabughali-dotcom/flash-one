import Link from "next/link";
import { notFound } from "next/navigation";
import { requireCompletedOnboarding } from "@/lib/server/account";
import { getCreditNoteByPublicId } from "@/lib/server/credit-notes";
import { formatMinor } from "@/modules/invoices";
import { INVOICE_PATHS } from "@/modules/invoices";
import { CREDIT_NOTE_PATHS, CREDIT_NOTE_STATUS_LABELS } from "@/modules/credit-notes";
import { PageHeader } from "@/components/platform/PageHeader";
import { StatusBadge } from "@/components/platform/StatusBadge";
import { formatDisplayDate } from "@/lib/format/display";

export default async function CustomerCreditNotePage({
  params,
}: {
  params: Promise<{ publicId: string }>;
}) {
  const { publicId } = await params;
  await requireCompletedOnboarding(CREDIT_NOTE_PATHS.detail(publicId));
  const note = await getCreditNoteByPublicId(publicId);
  if (!note || note.status !== "issued") {
    notFound();
  }
  return (
    <main>
      <PageHeader
        eyebrow={note.creditNoteNumber ?? note.publicId}
        title="Credit note"
        description={
          note.issuedAt ? `Issued ${formatDisplayDate(note.issuedAt)}` : "Issued credit note"
        }
        actions={
          <div className="flex flex-wrap gap-3">
            <StatusBadge status={note.status} label={CREDIT_NOTE_STATUS_LABELS[note.status]} />
            <Link
              href={CREDIT_NOTE_PATHS.pdf(note.publicId)}
              className="rounded-(--radius-button) border border-line bg-white px-4 py-2 text-sm font-semibold"
            >
              Download PDF
            </Link>
          </div>
        }
      />
      <p className="mt-4 text-lg font-extrabold text-navy-deep">
        {formatMinor(note.amountMinor, note.currency)}
      </p>
      <p className="mt-2 text-sm">{note.reason}</p>
      {note.invoicePublicId ? (
        <p className="mt-4 text-sm">
          Invoice{" "}
          <Link href={INVOICE_PATHS.detail(note.invoicePublicId)} className="font-semibold text-blue">
            {note.invoicePublicId}
          </Link>
        </p>
      ) : null}
    </main>
  );
}
