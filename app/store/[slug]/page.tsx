import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublicStoreProduct } from "@/lib/server/store/core";
import { getVerifiedSession } from "@/lib/server/auth";
import { getAccountSummary } from "@/lib/server/account";
import { PRODUCT_TYPE_LABELS, STORE_PATHS } from "@/modules/store";
import { StoreProductForm } from "./product-form";

export default async function StoreProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getPublicStoreProduct(slug);
  if (!product) {
    notFound();
  }
  const session = await getVerifiedSession();
  const summary = session ? await getAccountSummary(session.userId) : null;

  return (
    <main>
      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-navy/50">
        {PRODUCT_TYPE_LABELS[product.productType]}
      </p>
      <h1 className="mt-3 text-3xl font-extrabold tracking-[-0.04em] text-navy-deep">
        {product.name}
      </h1>
      <p className="mt-4 text-[15px] leading-relaxed text-muted">{product.shortDescription}</p>
      {product.description ? (
        <p className="mt-4 whitespace-pre-wrap text-[15px] leading-relaxed text-navy">
          {product.description}
        </p>
      ) : null}
      <StoreProductForm
        product={product}
        organizations={summary?.organizations ?? []}
        isAuthenticated={Boolean(session)}
      />
      <p className="mt-8 text-sm">
        <Link href={STORE_PATHS.catalog} className="font-semibold text-blue">
          Back to store
        </Link>
      </p>
    </main>
  );
}
