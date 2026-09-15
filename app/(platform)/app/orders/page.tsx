import Link from "next/link";
import { requireCompletedOnboarding } from "@/lib/server/account";
import { listCustomerOrders } from "@/lib/server/store/core";
import { parseListPage } from "@/lib/server/pagination";
import { ListPager } from "@/components/platform/ListPager";
import { formatMinor } from "@/modules/invoices";
import { ORDER_STATUS_LABELS, STORE_PATHS } from "@/modules/store";

export default async function CustomerOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  await requireCompletedOnboarding(STORE_PATHS.orders);
  const page = parseListPage((await searchParams).page);
  const orders = await listCustomerOrders(page);

  return (
    <main>
      <h1 className="text-3xl font-extrabold tracking-[-0.04em] text-navy-deep">Orders</h1>
      <p className="mt-4 text-[15px] text-muted">
        Store orders for your individual relationship or businesses you belong to. An order is not a payment.
      </p>
      {orders.length === 0 ? (
        <p className="mt-8 text-[15px] text-muted">No orders yet.</p>
      ) : (
        <ul className="mt-8 space-y-3">
          {orders.map((order) => (
            <li key={order.publicId}>
              <Link
                href={STORE_PATHS.order(order.publicId)}
                className="block rounded-(--radius-panel) border border-white/70 bg-white/80 p-5 shadow-(--shadow-soft)"
              >
                <p className="text-xs font-semibold tracking-[0.14em] text-navy/50">{order.publicId}</p>
                <p className="mt-2 font-extrabold text-navy-deep">
                  {formatMinor(order.totalMinor, order.currency)}
                </p>
                <p className="mt-1 text-sm text-muted">{ORDER_STATUS_LABELS[order.status]}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
      <ListPager page={page} itemCount={orders.length} />
    </main>
  );
}
