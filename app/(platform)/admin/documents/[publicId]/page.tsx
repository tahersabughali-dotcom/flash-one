import { notFound } from "next/navigation";
import { requirePlatformAdmin } from "@/lib/server/auth";
import { getDocument } from "@/lib/server/operations";
import { OPERATIONS_PATHS } from "@/modules/operations";
import { PageHeader } from "@/components/platform/PageHeader";
import { StatusBadge } from "@/components/platform/StatusBadge";
import { adminDownloadDocumentAction } from "../../operations-actions";
import { formatDisplayDate, formatFileSize } from "@/lib/format/display";

export default async function Page({ params }: { params: Promise<{ publicId: string }> }) {
  const { publicId } = await params;
  await requirePlatformAdmin(OPERATIONS_PATHS.document(publicId));
  const record = await getDocument(publicId);
  if (!record) notFound();
  return (
    <main>
      <PageHeader
        eyebrow={record.public_id}
        title={record.title}
        description={`${record.original_filename} · ${formatFileSize(Number(record.size_bytes))} · ${formatDisplayDate(record.uploaded_at)}`}
        actions={<StatusBadge status={record.document_type} label={record.document_type.replace(/_/g, " ")} />}
      />
      <p className="mt-4 text-sm text-muted">
        Related: {record.entity_kind}
        {record.entity_public_id ? ` · ${record.entity_public_id}` : ""}
      </p>
      <form action={adminDownloadDocumentAction} className="mt-6">
        <input type="hidden" name="publicId" value={record.public_id} />
        <button type="submit" className="rounded-(--radius-button) bg-blue px-5 py-2.5 text-sm font-semibold text-white">
          Download
        </button>
      </form>
    </main>
  );
}
