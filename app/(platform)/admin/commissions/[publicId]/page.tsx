import { notFound } from "next/navigation";
import { requirePlatformAdmin } from "@/lib/server/auth";
import { getCommission } from "@/lib/server/operations";
import { OPERATIONS_PATHS } from "@/modules/operations";
import { PageHeader } from "@/components/platform/PageHeader";
import { StatusBadge } from "@/components/platform/StatusBadge";
import { CommissionForm } from "../../ops-forms";

export default async function Page({ params }: { params: Promise<{ publicId: string }> }) {
  const { publicId } = await params;
  await requirePlatformAdmin(OPERATIONS_PATHS.commission(publicId));
  const record = await getCommission(publicId);
  if (!record) notFound();
  return (
    <main>
      <PageHeader
        eyebrow={record.public_id}
        title={record.reason}
        actions={<StatusBadge status={record.status} label={record.status.replace(/_/g, " ")} />}
      />
      <CommissionForm record={record} />
    </main>
  );
}
