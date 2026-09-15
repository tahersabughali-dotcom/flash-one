"use client";

import { useActionState } from "react";
import { INVOICE_CURRENCIES } from "@/modules/invoices";
import { PAYMENT_SERVICES, PAYMENT_SERVICE_LABELS } from "@/modules/payment-requests";
import { createGuestPaymentAction, type PayFormState } from "./actions";

const initialState: PayFormState = { error: null };

export function GuestPayForm() {
  const [state, formAction, pending] = useActionState(createGuestPaymentAction, initialState);
  return (
    <form action={formAction} className="mt-8 space-y-4">
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
      <label className="block">
        <span className="text-sm font-semibold text-navy-deep">Currency</span>
        <select
          name="currency"
          defaultValue="GBP"
          className="mt-2 w-full rounded-2xl border border-line bg-white px-4 py-3 text-[15px]"
        >
          {INVOICE_CURRENCIES.map((currency) => (
            <option key={currency} value={currency}>
              {currency}
            </option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="text-sm font-semibold text-navy-deep">Amount</span>
        <input
          name="amount"
          required
          inputMode="decimal"
          placeholder="0.00"
          className="mt-2 w-full rounded-2xl border border-line bg-white px-4 py-3 text-[15px]"
        />
      </label>
      <label className="block">
        <span className="text-sm font-semibold text-navy-deep">Service</span>
        <select
          name="serviceCode"
          required
          className="mt-2 w-full rounded-2xl border border-line bg-white px-4 py-3 text-[15px]"
        >
          {PAYMENT_SERVICES.map((code) => (
            <option key={code} value={code}>
              {PAYMENT_SERVICE_LABELS[code]}
            </option>
          ))}
        </select>
      </label>
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
        {pending ? "Continuing…" : "Continue"}
      </button>
    </form>
  );
}
