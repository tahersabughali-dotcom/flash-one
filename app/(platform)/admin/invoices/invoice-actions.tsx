"use client";

import { useActionState } from "react";
import { ConfirmSubmitButton } from "@/components/platform/ConfirmSubmitButton";
import type { AdminFinanceFormState } from "../finance-errors";
import {
  adminAllocatePaymentAction,
  adminIssueInvoiceAction,
  adminVoidInvoiceAction,
} from "./actions";

const initialState: AdminFinanceFormState = { error: null };

export function IssueInvoiceButton({ publicId }: { publicId: string }) {
  return (
    <form action={adminIssueInvoiceAction}>
      <input type="hidden" name="publicId" value={publicId} />
      <button
        type="submit"
        className="rounded-(--radius-button) bg-blue px-5 py-2.5 text-sm font-semibold text-white"
      >
        Issue invoice
      </button>
    </form>
  );
}

export function VoidInvoiceForm({ publicId }: { publicId: string }) {
  const [state, formAction, pending] = useActionState(
    adminVoidInvoiceAction,
    initialState,
  );
  return (
    <form action={formAction} className="mt-4 space-y-3">
      <input type="hidden" name="publicId" value={publicId} />
      <input
        name="reason"
        placeholder="Optional void reason"
        className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-[15px]"
      />
      {state.error ? (
        <p className="text-sm font-medium text-red-700" role="alert">
          {state.error}
        </p>
      ) : null}
      <ConfirmSubmitButton
        confirmMessage="Void this invoice? This cannot be undone from the customer view."
        disabled={pending}
        className="rounded-(--radius-button) border border-line bg-white px-5 py-2.5 text-sm font-semibold"
      >
        {pending ? "Voiding…" : "Void invoice"}
      </ConfirmSubmitButton>
    </form>
  );
}

export function AllocatePaymentForm({ invoicePublicId }: { invoicePublicId: string }) {
  const [state, formAction, pending] = useActionState(
    adminAllocatePaymentAction,
    initialState,
  );
  return (
    <form action={formAction} className="mt-4 space-y-3">
      <input type="hidden" name="invoicePublicId" value={invoicePublicId} />
      <input
        name="paymentPublicId"
        required
        placeholder="Payment public ID"
        className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-[15px]"
      />
      <input
        name="amount"
        required
        placeholder="Allocation amount 0.00"
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
        {pending ? "Allocating…" : "Allocate recorded payment"}
      </button>
    </form>
  );
}
