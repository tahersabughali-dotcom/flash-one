import { notFound } from "next/navigation";
import { requirePlatformAdmin } from "@/lib/server/auth";
import { getReferral } from "@/lib/server/operations";
import { OPERATIONS_PATHS } from "@/modules/operations";
import { PageHeader } from "@/components/platform/PageHeader";
import { StatusBadge } from "@/components/platform/StatusBadge";

export default async function Page({ params }: { params: Promise<{ publicId: string }> }) {
  const { publicId } = await params;
  await requirePlatformAdmin(OPERATIONS_PATHS.referral(publicId));
  const record = await getReferral(publicId);
  if (!record) notFound();
  return (
    <main>
      <PageHeader
        eyebrow={record.public_id}
        title={record.source_label || record.source_kind}
        description="Referral relationship only. Commission is created separately."
        actions={<StatusBadge status={record.source_kind} label={record.source_kind.replace(/_/g, " ")} />}
      />
    </main>
  );
}
