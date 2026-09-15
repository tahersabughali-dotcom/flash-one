import { notFound } from "next/navigation";
import { requirePlatformAdmin } from "@/lib/server/auth";
import { logoutAction } from "@/app/(auth)/actions";
import { getAdminStoreProduct } from "@/lib/server/platform/queries";
import { INVOICE_CURRENCIES, formatMinor, parseMinor } from "@/modules/invoices";
import { PRODUCT_STATUSES, STORE_PATHS } from "@/modules/store";
import { AdminProductForm } from "../../product-form";
import { adminSetProductStatusAction } from "../../actions";
import { AdminPriceForm } from "./price-form";

export default async function AdminProductDetailPage({
  params,
}: {
  params: Promise<{ publicId: string }>;
}) {
  const { publicId } = await params;
  const access = await requirePlatformAdmin(STORE_PATHS.adminProduct(publicId));
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
  const product = await getAdminStoreProduct(publicId);
  if (!product) {
    notFound();
  }
  const prices = Array.isArray(product.store_product_prices) ? product.store_product_prices : [];

  return (
    <main>
      <h1 className="text-3xl font-extrabold tracking-[-0.04em] text-navy-deep">{product.name}</h1>
      <p className="mt-2 text-sm text-muted">{product.public_id} · {product.status}</p>
      <AdminProductForm product={product} />
      <form action={adminSetProductStatusAction} className="mt-6 flex flex-wrap gap-2">
        <input type="hidden" name="publicId" value={product.public_id} />
        {PRODUCT_STATUSES.map((status) => (
          <button key={status} name="status" value={status} className="rounded-(--radius-button) border border-line bg-white px-4 py-2 text-sm font-semibold">
            Set {status}
          </button>
        ))}
      </form>
      <h2 className="mt-10 text-lg font-extrabold text-navy-deep">Prices</h2>
      <ul className="mt-3 space-y-2 text-sm">
        {prices.map((price) => (
          <li key={price.currency}>
            {formatMinor(parseMinor(price.amount_minor) ?? 0, price.currency)} {price.active ? "" : "(inactive)"}
          </li>
        ))}
      </ul>
      <AdminPriceForm productPublicId={product.public_id} currencies={[...INVOICE_CURRENCIES]} />
    </main>
  );
}
