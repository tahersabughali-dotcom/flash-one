import Link from "next/link";
import { requirePlatformAdmin } from "@/lib/server/auth";
import { logoutAction } from "@/app/(auth)/actions";
import { listAdminStoreOrders } from "@/lib/server/platform/queries";
import { parseListPage } from "@/lib/server/pagination";
import { ListPager } from "@/components/platform/ListPager";
import { formatMinor } from "@/modules/invoices";
import { ORDER_STATUS_LABELS, STORE_PATHS } from "@/modules/store";

export default async function AdminStoreOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const access = await requirePlatformAdmin(STORE_PATHS.adminOrders);
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
  const page = parseListPage((await searchParams).page);
  const orders = await listAdminStoreOrders(page);
  return (
    <main>
      <h1 className="text-3xl font-extrabold tracking-[-0.04em] text-navy-deep">Store orders</h1>
      {orders.length === 0 ? (
        <p className="mt-8 text-[15px] text-muted">No orders yet.</p>
      ) : (
        <ul className="mt-8 space-y-3">
          {orders.map((order) => (
            <li key={order.publicId}>
              <Link href={STORE_PATHS.adminOrder(order.publicId)} className="block rounded-(--radius-panel) border border-white/70 bg-white/80 p-5 shadow-(--shadow-soft)">
                <p className="text-xs tracking-[0.14em] text-navy/50">{order.publicId}</p>
                <p className="mt-2 font-extrabold">{formatMinor(order.totalMinor, order.currency)}</p>
                <p className="text-sm text-muted">{ORDER_STATUS_LABELS[order.status]}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
      <ListPager page={page} itemCount={orders.length} />
    </main>
  );
}
