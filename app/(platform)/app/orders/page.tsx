import { requireCompletedOnboarding } from "@/lib/server/account";
import { listCustomerOrders } from "@/lib/server/store/core";
import { parseListPage } from "@/lib/server/pagination";
import { ListPager } from "@/components/platform/ListPager";
import { PageHeader } from "@/components/platform/PageHeader";
import { EmptyState } from "@/components/platform/EmptyState";
import { RecordCard } from "@/components/platform/RecordCard";
import { formatMinor } from "@/modules/invoices";
import { formatDisplayDate } from "@/lib/format/display";
import {
  ORDER_STATUS_LABELS,
  STORE_PATHS,
  orderPaymentLabel,
  orderFulfillmentLabel,
} from "@/modules/store";

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
      <PageHeader
        eyebrow="Store"
        title="Orders"
        description="Store orders for your individual relationship or organizations you belong to. An order is not a payment."
      />
      {orders.length === 0 ? (
        <EmptyState
          title="No orders yet"
          description="Orders appear here after a catalog checkout is created for your account."
          actionHref={STORE_PATHS.catalog}
          actionLabel="Browse store"
        />
      ) : (
        <ul className="mt-8 space-y-3">
          {orders.map((order) => (
            <li key={order.publicId}>
              <RecordCard
                href={STORE_PATHS.order(order.publicId)}
                reference={order.publicId}
                title={formatMinor(order.totalMinor, order.currency)}
                status={order.status}
                statusLabel={ORDER_STATUS_LABELS[order.status]}
                meta={`${orderPaymentLabel(order.status)} · ${orderFulfillmentLabel(order.status)} · ${formatDisplayDate(order.createdAt)}`}
              />
            </li>
          ))}
        </ul>
      )}
      <ListPager page={page} itemCount={orders.length} />
    </main>
  );
}
