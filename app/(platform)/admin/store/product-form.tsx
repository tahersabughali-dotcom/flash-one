"use client";

import { useActionState } from "react";
import {
  COMMERCIAL_MODES,
  COMMERCIAL_MODE_LABELS,
  PRODUCT_TYPES,
  PRODUCT_TYPE_LABELS,
  QUANTITY_MODES,
} from "@/modules/store";
import { adminUpsertProductAction, type AdminStoreFormState } from "./actions";

const initialState: AdminStoreFormState = { error: null };

export function AdminProductForm({
  product,
}: {
  product?: {
    public_id: string;
    slug: string;
    name: string;
    short_description: string;
    description: string | null;
    product_type: string;
    commercial_mode: string;
    quantity_mode: string;
    customer_visible: boolean;
  };
}) {
  const [state, formAction, pending] = useActionState(adminUpsertProductAction, initialState);
  return (
    <form action={formAction} className="mt-6 space-y-4">
      {product ? <input type="hidden" name="publicId" value={product.public_id} /> : null}
      <label className="block">
        <span className="text-sm font-semibold text-navy-deep">Name</span>
        <input name="name" required defaultValue={product?.name} className="mt-2 w-full rounded-2xl border border-line bg-white px-4 py-3 text-[15px]" />
      </label>
      <label className="block">
        <span className="text-sm font-semibold text-navy-deep">Slug</span>
        <input name="slug" required defaultValue={product?.slug} className="mt-2 w-full rounded-2xl border border-line bg-white px-4 py-3 text-[15px]" />
      </label>
      <label className="block">
        <span className="text-sm font-semibold text-navy-deep">Short description</span>
        <input name="shortDescription" required defaultValue={product?.short_description} className="mt-2 w-full rounded-2xl border border-line bg-white px-4 py-3 text-[15px]" />
      </label>
      <label className="block">
        <span className="text-sm font-semibold text-navy-deep">Description</span>
        <textarea name="description" rows={4} defaultValue={product?.description ?? ""} className="mt-2 w-full rounded-2xl border border-line bg-white px-4 py-3 text-[15px]" />
      </label>
      <label className="block">
        <span className="text-sm font-semibold text-navy-deep">Type</span>
        <select name="productType" defaultValue={product?.product_type ?? "service"} className="mt-2 w-full rounded-2xl border border-line bg-white px-4 py-3 text-[15px]">
          {PRODUCT_TYPES.map((type) => (
            <option key={type} value={type}>{PRODUCT_TYPE_LABELS[type]}</option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="text-sm font-semibold text-navy-deep">Commercial mode</span>
        <select name="commercialMode" defaultValue={product?.commercial_mode ?? "fixed_price"} className="mt-2 w-full rounded-2xl border border-line bg-white px-4 py-3 text-[15px]">
          {COMMERCIAL_MODES.map((mode) => (
            <option key={mode} value={mode}>{COMMERCIAL_MODE_LABELS[mode]}</option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="text-sm font-semibold text-navy-deep">Quantity</span>
        <select name="quantityMode" defaultValue={product?.quantity_mode ?? "single"} className="mt-2 w-full rounded-2xl border border-line bg-white px-4 py-3 text-[15px]">
          {QUANTITY_MODES.map((mode) => (
            <option key={mode} value={mode}>{mode}</option>
          ))}
        </select>
      </label>
      <label className="flex items-center gap-2 text-sm font-semibold text-navy-deep">
        <input type="checkbox" name="customerVisible" defaultChecked={product?.customer_visible} />
        Customer visible when active
      </label>
      {state.error ? <p className="text-sm font-medium text-red-700" role="alert">{state.error}</p> : null}
      <button type="submit" disabled={pending} className="rounded-(--radius-button) bg-blue px-5 py-2.5 text-sm font-semibold text-white">
        {pending ? "Saving\u2026" : "Save draft"}
      </button>
    </form>
  );
}
