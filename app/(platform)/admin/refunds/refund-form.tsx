"use client";

import { useActionState } from "react";
import { REFUND_STATUSES, REFUND_STATUS_LABELS } from "@/modules/refunds";
import { adminRecordRefundAction } from "../commercial-actions";
import type { AdminFinanceFormState } from "../finance-errors";

const initialState: AdminFinanceFormState = { error: null };

export function RefundForm({ paymentPublicId }: { paymentPublicId?: string }) {
  const [state, formAction, pending] = useActionState(adminRecordRefundAction, initialState);
  return (
    <form action={formAction} className="mt-6 space-y-5">
      <p className="rounded-2xl border border-line bg-white px-4 py-3 text-sm text-muted">
        This records an internal refund. It does not execute a provider refund API.
      </p>
      <label className="block">
        <span className="text-sm font-semibold text-navy-deep">Payment reference</span>
        <input
          name="paymentPublicId"
          required
          defaultValue={paymentPublicId ?? ""}
          className="mt-2 w-full rounded-2xl border border-line bg-white px-4 py-3 text-[15px]"
        />
      </label>
      <label className="block">
        <span className="text-sm font-semibold text-navy-deep">Amount</span>
        <input name="amount" required placeholder="0.00" className="mt-2 w-full rounded-2xl border border-line bg-white px-4 py-3 text-[15px]" />
      </label>
      <label className="block">
        <span className="text-sm font-semibold text-navy-deep">Status</span>
        <select name="status" defaultValue="recorded" className="mt-2 w-full rounded-2xl border border-line bg-white px-4 py-3 text-[15px]">
          {REFUND_STATUSES.map((status) => (
            <option key={status} value={status}>
              {REFUND_STATUS_LABELS[status]}
            </option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="text-sm font-semibold text-navy-deep">Reason</span>
        <textarea name="reason" required rows={3} className="mt-2 w-full rounded-2xl border border-line bg-white px-4 py-3 text-[15px]" />
      </label>
      {state.error ? <p className="text-sm font-medium text-red-700" role="alert">{state.error}</p> : null}
      <button type="submit" disabled={pending} className="rounded-(--radius-button) bg-blue px-5 py-3 text-sm font-semibold text-white disabled:opacity-60">
        {pending ? "Recording…" : "Record refund"}
      </button>
    </form>
  );
}
