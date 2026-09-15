"use client";

import { useActionState } from "react";
import { startCheckoutAction, type PayFormState } from "./actions";

const initialState: PayFormState = { error: null };

export function CheckoutForm({
  requestPublicId,
  amountMode,
  guest,
  providers,
}: {
  requestPublicId: string;
  amountMode: string;
  guest: boolean;
  providers: Array<{ code: string; displayName: string; businessOnly: boolean }>;
}) {
  const [state, formAction, pending] = useActionState(startCheckoutAction, initialState);
  if (providers.length === 0) {
    return (
      <p className="mt-8 text-[15px] text-muted">
        Payment method unavailable.
      </p>
    );
  }
  return (
    <form action={formAction} className="mt-8 space-y-4">
      <input type="hidden" name="requestPublicId" value={requestPublicId} />
      {amountMode === "customer_entered" ? (
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
      ) : null}
      {guest ? (
        <>
          <label className="block">
            <span className="text-sm font-semibold text-navy-deep">Name</span>
            <input
              name="guestName"
              required
              className="mt-2 w-full rounded-2xl border border-line bg-white px-4 py-3 text-[15px]"
            />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-navy-deep">Email</span>
            <input
              name="guestEmail"
              type="email"
              required
              className="mt-2 w-full rounded-2xl border border-line bg-white px-4 py-3 text-[15px]"
            />
          </label>
        </>
      ) : null}
      <label className="block">
        <span className="text-sm font-semibold text-navy-deep">Payment method</span>
        <select
          name="provider"
          required
          className="mt-2 w-full rounded-2xl border border-line bg-white px-4 py-3 text-[15px]"
        >
          {providers.map((provider) => (
            <option key={provider.code} value={provider.code}>
              {provider.displayName}
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
        {pending ? "Starting…" : "Pay"}
      </button>
    </form>
  );
}
