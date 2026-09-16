import { notFound } from "next/navigation";
import { requirePlatformAdmin } from "@/lib/server/auth";
import { getImportBatch } from "@/lib/server/platform/settings-queries";
import { INTEGRATION_PATHS } from "@/modules/integrations";
import { PageHeader } from "@/components/platform/PageHeader";
import { SectionPanel } from "@/components/platform/SectionPanel";
import { StatusBadge } from "@/components/platform/StatusBadge";
import { reviewImportBatchAction } from "../../settings-actions";

export default async function Page({
  params,
}: {
  params: Promise<{ publicId: string }>;
}) {
  const { publicId } = await params;
  await requirePlatformAdmin(INTEGRATION_PATHS.importDetail(publicId));
  const batch = await getImportBatch(publicId);
  if (!batch) {
    notFound();
  }
  return (
    <main>
      <PageHeader
        eyebrow={batch.public_id}
        title={batch.filename || batch.import_type}
        description={`${batch.row_count} rows · ${batch.error_count} errors · review ${batch.review_state}`}
        actions={<StatusBadge status={batch.status} label={batch.status.replace(/_/g, " ")} />}
      />
      <SectionPanel title="Review">
        <div className="flex flex-wrap gap-2">
          {(["approve", "reject", "apply"] as const).map((decision) => (
            <form key={decision} action={reviewImportBatchAction}>
              <input type="hidden" name="publicId" value={batch.public_id} />
              <input type="hidden" name="decision" value={decision} />
              <button type="submit" className="rounded-(--radius-button) border border-line px-3 py-1.5 text-sm font-semibold">
                {decision}
              </button>
            </form>
          ))}
        </div>
        <p className="mt-3 text-sm text-muted">
          Bank and provider files cannot be applied as sales or payments.
        </p>
      </SectionPanel>
      <SectionPanel title="Preview rows">
        {(batch.rows as Array<Record<string, unknown>>).length === 0 ? (
          <p className="text-sm text-muted">No rows.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {(batch.rows as Array<Record<string, unknown>>).map((row) => (
              <li key={String(row.row_number)} className="rounded-xl border border-line px-3 py-2">
                #{String(row.row_number)} · {String(row.validation_status)}
                {row.validation_error ? ` · ${String(row.validation_error)}` : ""}
              </li>
            ))}
          </ul>
        )}
      </SectionPanel>
    </main>
  );
}
