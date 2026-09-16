import Link from "next/link";
import { requirePlatformAdmin } from "@/lib/server/auth";
import { listAdminStoreProducts } from "@/lib/server/platform/queries";
import { PRODUCT_STATUS_LABELS, STORE_PATHS } from "@/modules/store";
import { PageHeader } from "@/components/platform/PageHeader";
import { EmptyState } from "@/components/platform/EmptyState";
import { RecordCard } from "@/components/platform/RecordCard";

export default async function AdminStorePage() {
  await requirePlatformAdmin(STORE_PATHS.admin);
  const products = await listAdminStoreProducts();

  return (
    <main>
      <PageHeader
        eyebrow="Store"
        title="Catalog and orders"
        description="Store paid state comes from Payment Core. This is not a second payment system."
        actions={
          <>
            <Link
              href={STORE_PATHS.adminProducts}
              className="rounded-(--radius-button) border border-line bg-white px-4 py-2 text-sm font-semibold text-navy"
            >
              Products
            </Link>
            <Link
              href={STORE_PATHS.adminOrders}
              className="rounded-(--radius-button) border border-line bg-white px-4 py-2 text-sm font-semibold text-navy"
            >
              Orders
            </Link>
          </>
        }
      />
      {products.length === 0 ? (
        <EmptyState
          title="No products yet"
          description="Create a catalog product to start taking store orders."
          actionHref={STORE_PATHS.adminProductNew}
          actionLabel="New product"
        />
      ) : (
        <ul className="mt-8 space-y-3">
          {products.slice(0, 8).map((product) => (
            <li key={product.public_id}>
              <RecordCard
                href={STORE_PATHS.adminProduct(product.public_id)}
                title={product.name}
                status={product.status}
                statusLabel={
                  PRODUCT_STATUS_LABELS[product.status as keyof typeof PRODUCT_STATUS_LABELS]
                }
                meta={product.slug}
              />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
