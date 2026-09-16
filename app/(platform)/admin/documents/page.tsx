import { requirePlatformAdmin } from "@/lib/server/auth";
import { listDocuments } from "@/lib/server/operations";
import { parseListPage } from "@/lib/server/pagination";
import { OPERATIONS_PATHS, DOCUMENT_TYPE_LABELS } from "@/modules/operations";
import { OpsList } from "../ops-list";

export default async function Page({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  await requirePlatformAdmin(OPERATIONS_PATHS.documents);
  const page = parseListPage((await searchParams).page);
  const rows = await listDocuments(page);
  return (
    <OpsList
      eyebrow="System"
      title="Document Center"
      description="Business and operational documents. Project delivery files remain on the project."
      createHref={OPERATIONS_PATHS.documentNew}
      createLabel="Upload document"
      emptyTitle="No documents"
      emptyDescription="Upload customer, supplier, contract, procurement, or internal documents here."
      page={page}
      items={rows.map((row) => ({
        href: OPERATIONS_PATHS.document(row.public_id),
        publicId: row.public_id,
        title: row.title,
        status: row.document_type,
        statusLabel: DOCUMENT_TYPE_LABELS[row.document_type as keyof typeof DOCUMENT_TYPE_LABELS] ?? row.document_type,
        meta: row.entity_public_id ?? undefined,
      }))}
    />
  );
}
