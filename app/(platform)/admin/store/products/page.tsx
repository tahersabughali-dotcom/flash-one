import Link from "next/link";
import { requirePlatformAdmin } from "@/lib/server/auth";
import { logoutAction } from "@/app/(auth)/actions";
import { listAdminStoreProducts } from "@/lib/server/platform/queries";
import { parseListPage } from "@/lib/server/pagination";
import { ListPager } from "@/components/platform/ListPager";
import { PRODUCT_STATUS_LABELS, STORE_PATHS } from "@/modules/store";

export default async function AdminStoreProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const access = await requirePlatformAdmin(STORE_PATHS.adminProducts);
  if (!access.authorized) {
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
  const page = parseListPage((await searchParams).page);
  const products = await listAdminStoreProducts(page);
  return (
    <main>
      <h1 className="text-3xl font-extrabold tracking-[-0.04em] text-navy-deep">Products</h1>
      <p className="mt-4 text-sm">
        <Link href={STORE_PATHS.adminProductNew} className="font-semibold text-blue">
          New product
        </Link>
      </p>
      {products.length === 0 ? (
        <p className="mt-8 text-[15px] text-muted">No products yet.</p>
      ) : (
        <ul className="mt-8 space-y-3">
          {products.map((product) => (
            <li key={product.public_id}>
              <Link
                href={STORE_PATHS.adminProduct(product.public_id)}
                className="block rounded-(--radius-panel) border border-white/70 bg-white/80 p-5 shadow-(--shadow-soft)"
              >
                <p className="font-extrabold text-navy-deep">{product.name}</p>
                <p className="text-sm text-muted">
                  {product.slug} · {PRODUCT_STATUS_LABELS[product.status as keyof typeof PRODUCT_STATUS_LABELS]}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
      <ListPager page={page} itemCount={products.length} />
    </main>
  );
}
