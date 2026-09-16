import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePlatformAdmin } from "@/lib/server/auth";
import { getAdjustmentByPublicId } from "@/lib/server/adjustments";
import { formatMinor } from "@/modules/invoices";
import { INVOICE_PATHS } from "@/modules/invoices";
import { PAYMENT_PATHS } from "@/modules/payments";
import { ADJUSTMENT_KIND_LABELS, ADJUSTMENT_PATHS } from "@/modules/adjustments";
import { PageHeader } from "@/components/platform/PageHeader";
import { formatDisplayDateTime } from "@/lib/format/display";

export default async function AdminAdjustmentDetailPage({
  params,
}: {
  params: Promise<{ publicId: string }>;
}) {
  const { publicId } = await params;
  await requirePlatformAdmin(ADJUSTMENT_PATHS.adminDetail(publicId));
  const item = await getAdjustmentByPublicId(publicId);
  if (!item) {
    notFound();
  }
  return (
    <main>
      <PageHeader eyebrow={item.publicId} title={formatMinor(item.amountMinor, item.currency)} description={ADJUSTMENT_KIND_LABELS[item.kind]} />
      <p className="mt-4 text-sm">{item.reason}</p>
      <p className="mt-2 text-sm text-muted">{formatDisplayDateTime(item.createdAt)}</p>
      {item.paymentPublicId ? (
        <p className="mt-4 text-sm">
          Payment{" "}
          <Link href={PAYMENT_PATHS.adminDetail(item.paymentPublicId)} className="font-semibold text-blue">
            {item.paymentPublicId}
          </Link>
        </p>
      ) : null}
      {item.invoicePublicId ? (
        <p className="mt-2 text-sm">
          Invoice{" "}
          <Link href={INVOICE_PATHS.adminDetail(item.invoicePublicId)} className="font-semibold text-blue">
            {item.invoicePublicId}
          </Link>
        </p>
      ) : null}
    </main>
  );
}
