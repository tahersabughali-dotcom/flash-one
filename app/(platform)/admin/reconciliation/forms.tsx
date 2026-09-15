"use client";

import { useActionState } from "react";
import { INVOICE_CURRENCIES } from "@/modules/invoices";
import type { AdminFinanceFormState } from "../finance-errors";
import {
  adminConfirmReconciliationAction,
  adminCreateReconciliationAction,
  adminMatchReconciliationAction,
} from "./actions";

const initialState: AdminFinanceFormState = { error: null };

export function CreateReconciliationForm() {
  const [state, formAction, pending] = useActionState(
    adminCreateReconciliationAction,
    initialState,
  );
  return (
    <form action={formAction} className="mt-6 space-y-4">
      <p className="text-sm text-muted">
        Manual development reconciliation item. This is not bank or provider evidence.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <select
          name="currency"
          defaultValue="GBP"
          className="rounded-2xl border border-line bg-white px-4 py-3 text-[15px]"
        >
          {INVOICE_CURRENCIES.map((currency) => (
            <option key={currency} value={currency}>
              {currency}
            </option>
          ))}
        </select>
        <input
          name="amount"
          required
          placeholder="Amount 0.00"
          className="rounded-2xl border border-line bg-white px-4 py-3 text-[15px]"
        />
      </div>
      <input
        name="notes"
        placeholder="Optional note"
        className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-[15px]"
      />
      {state.error ? (
        <p className="text-sm font-medium text-red-700" role="alert">
          {state.error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="rounded-(--radius-button) bg-blue px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
      >
        {pending ? "Creating…" : "Create test item"}
      </button>
    </form>
  );
}

export function MatchReconciliationForm({ itemPublicId }: { itemPublicId: string }) {
  const [state, formAction, pending] = useActionState(
    adminMatchReconciliationAction,
    initialState,
  );
  return (
    <form action={formAction} className="mt-3 flex flex-wrap gap-2">
      <input type="hidden" name="itemPublicId" value={itemPublicId} />
      <input
        name="paymentPublicId"
        required
        placeholder="Payment public ID"
        className="rounded-2xl border border-line bg-white px-4 py-2 text-sm"
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded-(--radius-button) border border-line bg-white px-4 py-2 text-sm font-semibold"
      >
        Match
      </button>
      {state.error ? (
        <p className="w-full text-sm font-medium text-red-700" role="alert">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}

export function ConfirmReconciliationButton({ itemPublicId }: { itemPublicId: string }) {
  return (
    <form action={adminConfirmReconciliationAction} className="mt-3">
      <input type="hidden" name="itemPublicId" value={itemPublicId} />
      <button
        type="submit"
        className="rounded-(--radius-button) bg-blue px-4 py-2 text-sm font-semibold text-white"
      >
        Confirm reconciled
      </button>
    </form>
  );
}
