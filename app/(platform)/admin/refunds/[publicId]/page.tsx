import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePlatformAdmin } from "@/lib/server/auth";
import { getRefundByPublicId } from "@/lib/server/refunds";
import { formatMinor } from "@/modules/invoices";
import { PAYMENT_PATHS } from "@/modules/payments";
import { REFUND_PATHS, REFUND_STATUS_LABELS } from "@/modules/refunds";
import { PageHeader } from "@/components/platform/PageHeader";
import { StatusBadge } from "@/components/platform/StatusBadge";
import { formatDisplayDateTime } from "@/lib/format/display";

export default async function AdminRefundDetailPage({
  params,
}: {
  params: Promise<{ publicId: string }>;
}) {
  const { publicId } = await params;
  await requirePlatformAdmin(REFUND_PATHS.adminDetail(publicId));
  const refund = await getRefundByPublicId(publicId);
  if (!refund) {
    notFound();
  }
  return (
    <main>
      <PageHeader
        eyebrow={refund.publicId}
        title={formatMinor(refund.amountMinor, refund.currency)}
        actions={<StatusBadge status={refund.status} label={REFUND_STATUS_LABELS[refund.status]} />}
      />
      <p className="mt-4 text-sm text-muted">{refund.reason}</p>
      <p className="mt-2 text-sm">{formatDisplayDateTime(refund.recordedAt)}</p>
      <p className="mt-4 text-sm">
        Payment{" "}
        <Link href={PAYMENT_PATHS.adminDetail(refund.paymentPublicId)} className="font-semibold text-blue">
          {refund.paymentPublicId}
        </Link>
      </p>
      <p className="mt-6 text-sm text-muted">
        This is an internal record. It does not claim a provider refund was executed.
      </p>
    </main>
  );
}
