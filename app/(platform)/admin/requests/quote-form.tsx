"use client";

import { useActionState, useState } from "react";
import { QUOTE_CURRENCIES } from "@/modules/quotes";
import {
  adminIssueQuoteAction,
  type AdminWorkflowFormState,
} from "./actions";

const initialState: AdminWorkflowFormState = { error: null };

export function AdminQuoteForm({
  workRequestPublicId,
}: {
  workRequestPublicId: string;
}) {
  const [state, formAction, pending] = useActionState(
    adminIssueQuoteAction,
    initialState,
  );
  const [lineCount, setLineCount] = useState(1);

  return (
    <form action={formAction} className="mt-6 space-y-5">
      <input type="hidden" name="workRequestPublicId" value={workRequestPublicId} />
      <label className="block">
        <span className="text-sm font-semibold text-navy-deep">Currency</span>
        <select
          name="currency"
          defaultValue="GBP"
          className="mt-2 w-full rounded-2xl border border-line bg-white px-4 py-3 text-[15px] outline-none"
        >
          {QUOTE_CURRENCIES.map((currency) => (
            <option key={currency} value={currency}>
              {currency}
            </option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="text-sm font-semibold text-navy-deep">Valid until</span>
        <input
          name="validUntil"
          type="date"
          required
          className="mt-2 w-full rounded-2xl border border-line bg-white px-4 py-3 text-[15px] outline-none"
        />
      </label>
      <label className="block">
        <span className="text-sm font-semibold text-navy-deep">Customer notes</span>
        <textarea
          name="customerNotes"
          rows={3}
          className="mt-2 w-full rounded-2xl border border-line bg-white px-4 py-3 text-[15px] outline-none"
        />
      </label>
      <div className="space-y-4">
        {Array.from({ length: lineCount }, (_, index) => (
          <fieldset key={index} className="rounded-2xl border border-line p-4">
            <legend className="text-sm font-semibold text-navy-deep">
              Line {index + 1}
            </legend>
            <input
              name="lineDescription"
              required
              placeholder="Description"
              className="mt-2 w-full rounded-2xl border border-line bg-white px-4 py-3 text-[15px] outline-none"
            />
            <div className="mt-2 grid grid-cols-2 gap-3">
              <input
                name="lineQuantity"
                type="number"
                min={1}
                defaultValue={1}
                required
                className="rounded-2xl border border-line bg-white px-4 py-3 text-[15px] outline-none"
              />
              <input
                name="lineAmount"
                required
                placeholder="Amount 0.00"
                className="rounded-2xl border border-line bg-white px-4 py-3 text-[15px] outline-none"
              />
            </div>
          </fieldset>
        ))}
      </div>
      <button
        type="button"
        onClick={() => setLineCount((value) => value + 1)}
        className="text-sm font-semibold text-blue"
      >
        Add line
      </button>
      {state.error ? (
        <p className="text-sm font-medium text-red-700" role="alert">
          {state.error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="inline-flex w-full items-center justify-center rounded-(--radius-button) bg-blue px-5 py-3 text-sm font-semibold text-white shadow-(--shadow-button) disabled:opacity-60"
      >
        {pending ? "Sending…" : "Send quote"}
      </button>
    </form>
  );
}
