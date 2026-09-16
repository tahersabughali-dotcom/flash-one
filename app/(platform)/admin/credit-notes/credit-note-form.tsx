"use client";

import { useActionState } from "react";
import { adminCreateCreditNoteAction } from "../commercial-actions";
import type { AdminFinanceFormState } from "../finance-errors";

const initialState: AdminFinanceFormState = { error: null };

export function CreditNoteForm({ invoicePublicId }: { invoicePublicId?: string }) {
  const [state, formAction, pending] = useActionState(adminCreateCreditNoteAction, initialState);
  return (
    <form action={formAction} className="mt-6 space-y-5">
      <label className="block">
        <span className="text-sm font-semibold text-navy-deep">Invoice reference</span>
        <input name="invoicePublicId" required defaultValue={invoicePublicId ?? ""} className="mt-2 w-full rounded-2xl border border-line bg-white px-4 py-3 text-[15px]" />
      </label>
      <label className="block">
        <span className="text-sm font-semibold text-navy-deep">Amount</span>
        <input name="amount" required placeholder="0.00" className="mt-2 w-full rounded-2xl border border-line bg-white px-4 py-3 text-[15px]" />
      </label>
      <label className="block">
        <span className="text-sm font-semibold text-navy-deep">Reason</span>
        <textarea name="reason" required rows={3} className="mt-2 w-full rounded-2xl border border-line bg-white px-4 py-3 text-[15px]" />
      </label>
      <label className="block">
        <span className="text-sm font-semibold text-navy-deep">Notes</span>
        <textarea name="notes" rows={2} className="mt-2 w-full rounded-2xl border border-line bg-white px-4 py-3 text-[15px]" />
      </label>
      {state.error ? <p className="text-sm font-medium text-red-700" role="alert">{state.error}</p> : null}
      <button type="submit" disabled={pending} className="rounded-(--radius-button) bg-blue px-5 py-3 text-sm font-semibold text-white disabled:opacity-60">
        {pending ? "Saving…" : "Create draft"}
      </button>
    </form>
  );
}
