import Link from "next/link";
import { notFound } from "next/navigation";
import { requireCompletedOnboarding } from "@/lib/server/account";
import { getCustomerOrder } from "@/lib/server/store/core";
import { formatMinor, parseMinor, INVOICE_PATHS } from "@/modules/invoices";
import { PAYMENT_REQUEST_PATHS } from "@/modules/payment-requests";
import {
  ORDER_STATUS_LABELS,
  STORE_PATHS,
  orderPaymentLabel,
  orderFulfillmentLabel,
  type OrderStatus,
} from "@/modules/store";
import { formatDisplayDate } from "@/lib/format/display";
import { PageHeader } from "@/components/platform/PageHeader";
import { SectionPanel } from "@/components/platform/SectionPanel";
import { StatusBadge } from "@/components/platform/StatusBadge";

export default async function CustomerOrderDetailPage({
  params,
}: {
  params: Promise<{ publicId: string }>;
}) {
  await requireCompletedOnboarding(STORE_PATHS.orders);
  const { publicId } = await params;
  const order = await getCustomerOrder(publicId);
  if (!order) {
    notFound();
  }
  const request = order.payment_requests;
  const requestPublicId =
    request && typeof request === "object" && "public_id" in request
      ? String(request.public_id)
      : null;
  const items = Array.isArray(order.store_order_items) ? order.store_order_items : [];
  const status = order.status as OrderStatus;

  return (
    <main>
      <PageHeader
        eyebrow={order.public_id}
        title={ORDER_STATUS_LABELS[status] ?? order.status}
        description={`${formatMinor(parseMinor(order.total_minor) ?? 0, order.currency)} · ${formatDisplayDate(order.created_at)}`}
        actions={<StatusBadge status={status} label={ORDER_STATUS_LABELS[status] ?? order.status} />}
      />
      <dl className="mt-6 grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-muted">Payment</dt>
          <dd className="mt-1 font-semibold text-navy-deep">{orderPaymentLabel(status)}</dd>
        </div>
        <div>
          <dt className="text-muted">Fulfillment</dt>
          <dd className="mt-1 font-semibold text-navy-deep">{orderFulfillmentLabel(status)}</dd>
        </div>
      </dl>
      <SectionPanel title="Items">
        {items.length === 0 ? (
          <p className="text-[15px] text-muted">No line items on this order.</p>
        ) : (
          <ul className="space-y-3">
            {items.map((item) => (
              <li
                key={`${item.product_public_id}-${item.product_name}`}
                className="rounded-(--radius-panel) border border-line bg-white px-5 py-4"
              >
                <p className="font-semibold text-navy-deep">{item.product_name}</p>
                <p className="text-sm text-muted">
                  {item.quantity} × {formatMinor(parseMinor(item.unit_price_minor) ?? 0, order.currency)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </SectionPanel>
      {order.status === "pending_payment" && requestPublicId ? (
        <p className="mt-6 text-sm">
          <Link href={PAYMENT_REQUEST_PATHS.payRequest(requestPublicId)} className="font-semibold text-blue">
            Continue to payment
          </Link>
        </p>
      ) : null}
      {order.invoicePublicId ? (
        <p className="mt-6 text-sm">
          Invoice{" "}
          <Link href={INVOICE_PATHS.detail(order.invoicePublicId)} className="font-semibold text-blue">
            {order.invoicePublicId}
          </Link>
        </p>
      ) : null}
      <p className="mt-6 text-sm">
        <Link href={STORE_PATHS.orders} className="font-semibold text-blue">
          Back to orders
        </Link>
      </p>
    </main>
  );
}
