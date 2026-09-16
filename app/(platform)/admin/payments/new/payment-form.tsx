"use client";

import { useActionState } from "react";
import { INVOICE_CURRENCIES } from "@/modules/invoices";
import { adminRecordManualPaymentAction } from "../actions";
import type { AdminFinanceFormState } from "../../finance-errors";

const initialState: AdminFinanceFormState = { error: null };

export function ManualPaymentForm({
  customers,
  organizations,
}: {
  customers: Array<{ publicId: string; displayName: string }>;
  organizations: Array<{ publicId: string; name: string }>;
}) {
  const [state, formAction, pending] = useActionState(
    adminRecordManualPaymentAction,
    initialState,
  );
  return (
    <form action={formAction} className="mt-6 space-y-5">
      <p className="rounded-2xl border border-line bg-white px-4 py-3 text-sm text-muted">
        This creates a manual development financial record. It is not PayPal, Stripe, Wise, WorldFirst, or USDT.
      </p>
      <label className="block">
        <span className="text-sm font-semibold text-navy-deep">Individual customer</span>
        <select
          name="individualPublicId"
          className="mt-2 w-full rounded-2xl border border-line bg-white px-4 py-3 text-[15px]"
          defaultValue=""
        >
          <option value="">None</option>
          {customers.map((customer) => (
            <option key={customer.publicId} value={customer.publicId}>
              {customer.displayName} · {customer.publicId}
            </option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="text-sm font-semibold text-navy-deep">Business</span>
        <select
          name="organizationPublicId"
          className="mt-2 w-full rounded-2xl border border-line bg-white px-4 py-3 text-[15px]"
          defaultValue=""
        >
          <option value="">None</option>
          {organizations.map((organization) => (
            <option key={organization.publicId} value={organization.publicId}>
              {organization.name} · {organization.publicId}
            </option>
          ))}
        </select>
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
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
            placeholder="0.00"
            className="mt-2 w-full rounded-2xl border border-line bg-white px-4 py-3 text-[15px]"
          />
        </label>
      </div>
      <label className="block">
        <span className="text-sm font-semibold text-navy-deep">Received date</span>
        <input name="receivedAt" type="datetime-local" className="mt-2 w-full rounded-2xl border border-line bg-white px-4 py-3 text-[15px]" />
      </label>
      <label className="block">
        <span className="text-sm font-semibold text-navy-deep">Manual reference</span>
        <input name="manualReference" placeholder="Bank reference or settlement note" className="mt-2 w-full rounded-2xl border border-line bg-white px-4 py-3 text-[15px]" />
      </label>
      <label className="block">
        <span className="text-sm font-semibold text-navy-deep">Notes</span>
        <textarea name="notes" rows={3} className="mt-2 w-full rounded-2xl border border-line bg-white px-4 py-3 text-[15px]" />
      </label>
      {state.error ? (
        <p className="text-sm font-medium text-red-700" role="alert">
          {state.error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="inline-flex w-full items-center justify-center rounded-(--radius-button) bg-blue px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
      >
        {pending ? "Recording…" : "Record manual payment"}
      </button>
    </form>
  );
}
