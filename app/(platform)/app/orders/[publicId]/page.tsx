import Link from "next/link";
import { notFound } from "next/navigation";
import { requireCompletedOnboarding } from "@/lib/server/account";
import { getCustomerOrder } from "@/lib/server/store/core";
import { formatMinor } from "@/modules/invoices";
import { PAYMENT_REQUEST_PATHS } from "@/modules/payment-requests";
import { ORDER_STATUS_LABELS, STORE_PATHS } from "@/modules/store";

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
  const request = Array.isArray(order.payment_requests)
    ? order.payment_requests[0]
    : order.payment_requests;
  const requestPublicId =
    request && typeof request === "object" && request && "public_id" in request
      ? String(request.public_id)
      : null;
  const items = Array.isArray(order.store_order_items) ? order.store_order_items : [];

  return (
    <main>
      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-navy/50">
        {order.public_id}
      </p>
      <h1 className="mt-3 text-3xl font-extrabold tracking-[-0.04em] text-navy-deep">
        {ORDER_STATUS_LABELS[order.status as keyof typeof ORDER_STATUS_LABELS] ?? order.status}
      </h1>
      <p className="mt-4 text-[15px] text-muted">
        {formatMinor(Number(order.total_minor), order.currency)}
      </p>
      <ul className="mt-8 space-y-3">
        {items.map((item) => (
          <li
            key={`${item.product_public_id}-${item.product_name}`}
            className="rounded-(--radius-panel) border border-white/70 bg-white/80 p-5 shadow-(--shadow-soft)"
          >
            <p className="font-semibold text-navy-deep">{item.product_name}</p>
            <p className="text-sm text-muted">
              {item.quantity} × {formatMinor(Number(item.unit_price_minor), order.currency)}
            </p>
          </li>
        ))}
      </ul>
      {order.status === "pending_payment" && requestPublicId ? (
        <p className="mt-6 text-sm">
          <Link href={PAYMENT_REQUEST_PATHS.payRequest(requestPublicId)} className="font-semibold text-blue">
            Continue to payment
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
