import { notFound } from "next/navigation";
import { requireCompletedOnboarding } from "@/lib/server/account/require-onboarding";
import { getSupportCase } from "@/lib/server/operations";
import { OPERATIONS_PATHS, CASE_STATUS_LABELS } from "@/modules/operations";
import { PageHeader } from "@/components/platform/PageHeader";
import { StatusBadge } from "@/components/platform/StatusBadge";

export default async function Page({ params }: { params: Promise<{ publicId: string }> }) {
  const { publicId } = await params;
  await requireCompletedOnboarding(OPERATIONS_PATHS.customerCase(publicId));
  const record = await getSupportCase(publicId);
  if (!record || !record.customer_visible) notFound();
  return (
    <main>
      <PageHeader
        eyebrow={record.public_id}
        title={record.title}
        description={record.description ?? undefined}
        actions={
          <StatusBadge
            status={record.status}
            label={CASE_STATUS_LABELS[record.status as keyof typeof CASE_STATUS_LABELS] ?? record.status}
          />
        }
      />
    </main>
  );
}
