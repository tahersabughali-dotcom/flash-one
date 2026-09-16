import { requirePlatformAdmin } from "@/lib/server/auth";
import { CREDIT_NOTE_PATHS } from "@/modules/credit-notes";
import { PageHeader } from "@/components/platform/PageHeader";
import { CreditNoteForm } from "../credit-note-form";

export default async function AdminNewCreditNotePage({
  searchParams,
}: {
  searchParams: Promise<{ invoice?: string }>;
}) {
  await requirePlatformAdmin(CREDIT_NOTE_PATHS.adminNew);
  return (
    <main>
      <PageHeader eyebrow="Finance" title="New credit note" description="Creates a draft. Issuing assigns FO-CRN-YYYY-000001 and reduces remaining invoice balance." />
      <CreditNoteForm invoicePublicId={(await searchParams).invoice} />
    </main>
  );
}
