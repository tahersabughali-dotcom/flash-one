"use client";

import { useActionState } from "react";
import { ADJUSTMENT_KINDS, ADJUSTMENT_KIND_LABELS } from "@/modules/adjustments";
import { INVOICE_CURRENCIES } from "@/modules/invoices";
import { adminRecordAdjustmentAction } from "../commercial-actions";
import type { AdminFinanceFormState } from "../finance-errors";

const initialState: AdminFinanceFormState = { error: null };

export function AdjustmentForm() {
  const [state, formAction, pending] = useActionState(adminRecordAdjustmentAction, initialState);
  return (
    <form action={formAction} className="mt-6 space-y-5">
      <label className="block">
        <span className="text-sm font-semibold text-navy-deep">Kind</span>
        <select name="kind" className="mt-2 w-full rounded-2xl border border-line bg-white px-4 py-3 text-[15px]">
          {ADJUSTMENT_KINDS.map((kind) => (
            <option key={kind} value={kind}>{ADJUSTMENT_KIND_LABELS[kind]}</option>
          ))}
        </select>
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-semibold text-navy-deep">Currency</span>
          <select name="currency" defaultValue="GBP" className="mt-2 w-full rounded-2xl border border-line bg-white px-4 py-3 text-[15px]">
            {INVOICE_CURRENCIES.map((currency) => <option key={currency} value={currency}>{currency}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-navy-deep">Amount</span>
          <input name="amount" required placeholder="0.00" className="mt-2 w-full rounded-2xl border border-line bg-white px-4 py-3 text-[15px]" />
        </label>
      </div>
      <label className="block">
        <span className="text-sm font-semibold text-navy-deep">Payment reference</span>
        <input name="paymentPublicId" className="mt-2 w-full rounded-2xl border border-line bg-white px-4 py-3 text-[15px]" />
      </label>
      <label className="block">
        <span className="text-sm font-semibold text-navy-deep">Invoice reference</span>
        <input name="invoicePublicId" className="mt-2 w-full rounded-2xl border border-line bg-white px-4 py-3 text-[15px]" />
      </label>
      <label className="block">
        <span className="text-sm font-semibold text-navy-deep">Reason</span>
        <textarea name="reason" required rows={3} className="mt-2 w-full rounded-2xl border border-line bg-white px-4 py-3 text-[15px]" />
      </label>
      {state.error ? <p className="text-sm font-medium text-red-700" role="alert">{state.error}</p> : null}
      <button type="submit" disabled={pending} className="rounded-(--radius-button) bg-blue px-5 py-3 text-sm font-semibold text-white disabled:opacity-60">
        {pending ? "Recording…" : "Record adjustment"}
      </button>
    </form>
  );
}
