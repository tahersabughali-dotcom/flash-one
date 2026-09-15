import Link from "next/link";
import { requirePlatformAdmin } from "@/lib/server/auth";
import { logoutAction } from "@/app/(auth)/actions";
import { listAdminStoreProducts } from "@/lib/server/platform/queries";
import { PRODUCT_STATUS_LABELS, STORE_PATHS } from "@/modules/store";

export default async function AdminStorePage() {
  const access = await requirePlatformAdmin(STORE_PATHS.admin);
  if (!access.authorized) {
    return <Unauthorized />;
  }
  const products = await listAdminStoreProducts();

  return (
    <main>
      <h1 className="text-3xl font-extrabold tracking-[-0.04em] text-navy-deep">Store</h1>
      <p className="mt-4 text-[15px] text-muted">
        Catalog and orders. Store paid state comes from Payment Core.
      </p>
      <p className="mt-4 flex gap-4 text-sm">
        <Link href={STORE_PATHS.adminProducts} className="font-semibold text-blue">
          Products
        </Link>
        <Link href={STORE_PATHS.adminOrders} className="font-semibold text-blue">
          Orders
        </Link>
      </p>
      {products.length === 0 ? (
        <p className="mt-8 text-[15px] text-muted">No products yet.</p>
      ) : (
        <ul className="mt-8 space-y-3">
          {products.slice(0, 8).map((product) => (
            <li key={product.public_id}>
              <Link href={STORE_PATHS.adminProduct(product.public_id)} className="font-semibold text-blue">
                {product.name}
              </Link>{" "}
              <span className="text-sm text-muted">
                · {PRODUCT_STATUS_LABELS[product.status as keyof typeof PRODUCT_STATUS_LABELS]}
              </span>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

function Unauthorized() {
  return (
    <main>
      <h1 className="text-3xl font-extrabold text-navy-deep">Not authorized</h1>
      <form action={logoutAction} className="mt-8">
        <button type="submit" className="rounded-(--radius-button) border border-line bg-white px-5 py-2.5 text-sm font-semibold">
          Sign out
        </button>
      </form>
    </main>
  );
}
