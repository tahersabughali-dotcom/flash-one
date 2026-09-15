import Link from "next/link";
import { listPublicStoreProducts } from "@/lib/server/store/core";
import { formatMinor } from "@/modules/invoices";
import { PRODUCT_TYPE_LABELS, STORE_PATHS } from "@/modules/store";

export default async function StorePage() {
  const products = await listPublicStoreProducts();

  return (
    <main>
      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-navy/50">
        Flash One
      </p>
      <h1 className="mt-3 text-3xl font-extrabold tracking-[-0.04em] text-navy-deep">
        Store
      </h1>
      <p className="mt-4 text-[15px] leading-relaxed text-muted">
        Legitimate Flash One offerings. Prices are explicit. A store order is not a payment.
      </p>
      {products.length === 0 ? (
        <p className="mt-8 text-[15px] text-muted">No products available.</p>
      ) : (
        <ul className="mt-8 space-y-3">
          {products.map((product) => (
            <li key={product.publicId}>
              <Link
                href={STORE_PATHS.product(product.slug)}
                className="block rounded-(--radius-panel) border border-white/70 bg-white/80 p-5 shadow-(--shadow-soft)"
              >
                <p className="text-xs font-semibold tracking-[0.14em] text-navy/50">
                  {PRODUCT_TYPE_LABELS[product.productType]}
                </p>
                <p className="mt-2 font-extrabold text-navy-deep">{product.name}</p>
                <p className="mt-1 text-sm text-muted">{product.shortDescription}</p>
                <p className="mt-2 text-sm text-navy">
                  {product.commercialMode === "quote_required"
                    ? "Quote required"
                    : product.prices
                        .map((price) => formatMinor(price.amountMinor, price.currency))
                        .join(" · ") || "No price in selected currencies"}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
