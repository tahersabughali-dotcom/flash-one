import { notFound } from "next/navigation";
import { requirePlatformAdmin } from "@/lib/server/auth";
import { logoutAction } from "@/app/(auth)/actions";
import { getAdminStoreOrder } from "@/lib/server/platform/queries";
import { formatMinor, parseMinor } from "@/modules/invoices";
import { ORDER_STATUS_LABELS, STORE_PATHS, orderPaymentLabel, orderFulfillmentLabel, type OrderStatus } from "@/modules/store";
import { adminSetOrderStatusAction } from "../../actions";

export default async function AdminStoreOrderDetailPage({
  params,
}: {
  params: Promise<{ publicId: string }>;
}) {
  const { publicId } = await params;
  const access = await requirePlatformAdmin(STORE_PATHS.adminOrder(publicId));
  if (!access.authorized) {
    return (
      <main>
        <h1 className="text-3xl font-extrabold text-navy-deep">Not authorized</h1>
        <form action={logoutAction} className="mt-8">
          <button type="submit" className="rounded-(--radius-button) border border-line bg-white px-5 py-2.5 text-sm font-semibold">Sign out</button>
        </form>
      </main>
    );
  }
  const order = await getAdminStoreOrder(publicId);
  if (!order) {
    notFound();
  }
  const items = Array.isArray(order.store_order_items) ? order.store_order_items : [];
  const status = order.status as OrderStatus;
  return (
    <main>
      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-navy/50">
        {order.public_id}
      </p>
      <h1 className="mt-3 text-3xl font-extrabold tracking-[-0.04em] text-navy-deep">
        {ORDER_STATUS_LABELS[status] ?? order.status}
      </h1>
      <p className="mt-2 text-sm text-muted">
        {formatMinor(parseMinor(order.total_minor) ?? 0, order.currency)}
      </p>
      <p className="mt-2 text-sm text-muted">
        Payment: {orderPaymentLabel(status)} · Fulfillment: {orderFulfillmentLabel(status)}
      </p>
      <ul className="mt-6 space-y-2 text-sm">
        {items.map((item) => (
          <li key={`${item.product_public_id}-${item.product_name}`}>
            {item.product_name} · {item.quantity} × {formatMinor(parseMinor(item.unit_price_minor) ?? 0, order.currency)}
          </li>
        ))}
      </ul>
      <div className="mt-6 flex flex-wrap gap-2">
        {["processing", "completed", "cancelled"].map((status) => (
          <form key={status} action={adminSetOrderStatusAction}>
            <input type="hidden" name="publicId" value={order.public_id} />
            <input type="hidden" name="status" value={status} />
            <button type="submit" className="rounded-(--radius-button) border border-line bg-white px-4 py-2 text-sm font-semibold">
              {status}
            </button>
          </form>
        ))}
      </div>
      <p className="mt-4 text-sm text-muted">Paid cannot be set from Store. Payment Core records money.</p>
    </main>
  );
}
