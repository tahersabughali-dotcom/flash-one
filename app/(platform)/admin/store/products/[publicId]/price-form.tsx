"use client";

import { useActionState } from "react";
import { adminSetProductPriceAction, type AdminStoreFormState } from "../../actions";

const initialState: AdminStoreFormState = { error: null };

export function AdminPriceForm({
  productPublicId,
  currencies,
}: {
  productPublicId: string;
  currencies: string[];
}) {
  const [state, formAction, pending] = useActionState(adminSetProductPriceAction, initialState);
  return (
    <form action={formAction} className="mt-4 space-y-3">
      <input type="hidden" name="productPublicId" value={productPublicId} />
      <select name="currency" className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-[15px]">
        {currencies.map((currency) => (
          <option key={currency} value={currency}>{currency}</option>
        ))}
      </select>
      <input name="amount" placeholder="0.00" className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-[15px]" />
      <label className="flex items-center gap-2 text-sm font-semibold">
        <input type="checkbox" name="active" defaultChecked />
        Active
      </label>
      {state.error ? <p className="text-sm font-medium text-red-700">{state.error}</p> : null}
      <button type="submit" disabled={pending} className="rounded-(--radius-button) bg-blue px-5 py-2.5 text-sm font-semibold text-white">
        Save price
      </button>
    </form>
  );
}
