"use client";

import { useActionState } from "react";
import Link from "next/link";
import { INVOICE_CURRENCIES, formatMinor } from "@/modules/invoices";
import { WORK_REQUEST_PATHS } from "@/modules/work-requests";
import type { StoreProductDetail } from "@/lib/server/store/core";
import { checkoutStoreProductAction, type StoreFormState } from "../actions";

const initialState: StoreFormState = { error: null };

export function StoreProductForm({
  product,
  organizations,
  isAuthenticated,
}: {
  product: StoreProductDetail;
  organizations: Array<{ publicId: string; name: string }>;
  isAuthenticated: boolean;
}) {
  const [state, formAction, pending] = useActionState(checkoutStoreProductAction, initialState);
  const pricedCurrencies = product.prices.map((price) => price.currency);

  if (product.commercialMode === "quote_required") {
    return (
      <p className="mt-8 text-[15px] text-muted">
        This offering does not have a store price.{" "}
        <Link href={WORK_REQUEST_PATHS.new} className="font-semibold text-blue">
          Submit a work request
        </Link>{" "}
        to request a quote.
      </p>
    );
  }

  if (pricedCurrencies.length === 0) {
    return <p className="mt-8 text-[15px] text-muted">No price is available yet.</p>;
  }

  return (
    <form action={formAction} className="mt-8 space-y-4">
      <input type="hidden" name="productPublicId" value={product.publicId} />
      {!isAuthenticated ? (
        <>
          <label className="block">
            <span className="text-sm font-semibold text-navy-deep">Name</span>
            <input
              name="guestName"
              required
              autoComplete="name"
              className="mt-2 w-full rounded-2xl border border-line bg-white px-4 py-3 text-[15px]"
            />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-navy-deep">Email</span>
            <input
              name="guestEmail"
              type="email"
              required
              autoComplete="email"
              className="mt-2 w-full rounded-2xl border border-line bg-white px-4 py-3 text-[15px]"
            />
          </label>
        </>
      ) : organizations.length > 0 ? (
        <label className="block">
          <span className="text-sm font-semibold text-navy-deep">Order for</span>
          <select
            name="organizationPublicId"
            className="mt-2 w-full rounded-2xl border border-line bg-white px-4 py-3 text-[15px]"
            defaultValue=""
          >
            <option value="">Myself</option>
            {organizations.map((organization) => (
              <option key={organization.publicId} value={organization.publicId}>
                {organization.name}
              </option>
            ))}
          </select>
        </label>
      ) : null}
      <label className="block">
        <span className="text-sm font-semibold text-navy-deep">Currency</span>
        <select
          name="currency"
          defaultValue={pricedCurrencies[0]}
          className="mt-2 w-full rounded-2xl border border-line bg-white px-4 py-3 text-[15px]"
        >
          {INVOICE_CURRENCIES.filter((currency) => pricedCurrencies.includes(currency)).map(
            (currency) => {
              const price = product.prices.find((item) => item.currency === currency);
              return (
                <option key={currency} value={currency}>
                  {currency}
                  {price ? ` · ${formatMinor(price.amountMinor, currency)}` : ""}
                </option>
              );
            },
          )}
        </select>
      </label>
      {product.quantityMode === "multiple" ? (
        <label className="block">
          <span className="text-sm font-semibold text-navy-deep">Quantity</span>
          <input
            name="quantity"
            type="number"
            min={1}
            max={20}
            defaultValue={1}
            className="mt-2 w-full rounded-2xl border border-line bg-white px-4 py-3 text-[15px]"
          />
        </label>
      ) : (
        <input type="hidden" name="quantity" value="1" />
      )}
      {state.error ? (
        <p className="text-sm font-medium text-red-700" role="alert">
          {state.error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="rounded-(--radius-button) bg-blue px-5 py-2.5 text-sm font-semibold text-white"
      >
        {pending ? "Continuing\u2026" : "Continue to payment"}
      </button>
    </form>
  );
}
