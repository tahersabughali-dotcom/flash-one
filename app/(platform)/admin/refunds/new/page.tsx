import { requirePlatformAdmin } from "@/lib/server/auth";
import { REFUND_PATHS } from "@/modules/refunds";
import { PageHeader } from "@/components/platform/PageHeader";
import { RefundForm } from "../refund-form";

export default async function AdminNewRefundPage({
  searchParams,
}: {
  searchParams: Promise<{ payment?: string }>;
}) {
  await requirePlatformAdmin(REFUND_PATHS.adminNew);
  const paymentPublicId = (await searchParams).payment;
  return (
    <main>
      <PageHeader
        eyebrow="Finance"
        title="Record refund"
        description="Choose recorded or completed manually for an internal accounting event. Pending external means a later provider refund is still required."
      />
      <RefundForm paymentPublicId={paymentPublicId} />
    </main>
  );
}
