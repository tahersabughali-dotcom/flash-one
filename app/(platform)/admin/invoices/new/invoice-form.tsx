"use client";

import { useActionState, useState } from "react";
import { INVOICE_CURRENCIES } from "@/modules/invoices";
import type { AdminFinanceFormState } from "../../finance-errors";
import { adminCreateInvoiceAction } from "../actions";

const initialState: AdminFinanceFormState = { error: null };

export function AdminInvoiceForm({
  customers,
  organizations,
}: {
  customers: Array<{ publicId: string; displayName: string }>;
  organizations: Array<{ publicId: string; name: string }>;
}) {
  const [state, formAction, pending] = useActionState(
    adminCreateInvoiceAction,
    initialState,
  );
  const [lineCount, setLineCount] = useState(1);

  return (
    <form action={formAction} className="mt-6 space-y-5">
      <label className="block">
        <span className="text-sm font-semibold text-navy-deep">Individual customer</span>
        <select
          name="individualPublicId"
          className="mt-2 w-full rounded-2xl border border-line bg-white px-4 py-3 text-[15px] outline-none"
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
          className="mt-2 w-full rounded-2xl border border-line bg-white px-4 py-3 text-[15px] outline-none"
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
      <label className="block">
        <span className="text-sm font-semibold text-navy-deep">Store order public ID</span>
        <input
          name="storeOrderPublicId"
          placeholder="Optional. Creates a draft from an eligible order. Store orders do not auto-invoice."
          className="mt-2 w-full rounded-2xl border border-line bg-white px-4 py-3 text-[15px] outline-none"
        />
      </label>
      <label className="block">
        <span className="text-sm font-semibold text-navy-deep">Accepted quote public ID</span>
        <input
          name="quotePublicId"
          placeholder="Optional. Copies lines from an accepted quote."
          className="mt-2 w-full rounded-2xl border border-line bg-white px-4 py-3 text-[15px] outline-none"
        />
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-semibold text-navy-deep">Project public ID</span>
          <input
            name="projectPublicId"
            className="mt-2 w-full rounded-2xl border border-line bg-white px-4 py-3 text-[15px] outline-none"
          />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-navy-deep">Contract public ID</span>
          <input
            name="contractPublicId"
            className="mt-2 w-full rounded-2xl border border-line bg-white px-4 py-3 text-[15px] outline-none"
          />
        </label>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-semibold text-navy-deep">Currency</span>
          <select
            name="currency"
            defaultValue="GBP"
            className="mt-2 w-full rounded-2xl border border-line bg-white px-4 py-3 text-[15px] outline-none"
          >
            {INVOICE_CURRENCIES.map((currency) => (
              <option key={currency} value={currency}>
                {currency}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-navy-deep">Due date</span>
          <input
            name="dueDate"
            type="date"
            className="mt-2 w-full rounded-2xl border border-line bg-white px-4 py-3 text-[15px] outline-none"
          />
        </label>
      </div>
      <label className="block">
        <span className="text-sm font-semibold text-navy-deep">Notes</span>
        <textarea
          name="notes"
          rows={3}
          className="mt-2 w-full rounded-2xl border border-line bg-white px-4 py-3 text-[15px] outline-none"
        />
      </label>
      <div className="space-y-4">
        {Array.from({ length: lineCount }, (_, index) => (
          <fieldset key={index} className="rounded-2xl border border-line p-4">
            <legend className="text-sm font-semibold text-navy-deep">Line {index + 1}</legend>
            <input
              name="lineDescription"
              placeholder="Description"
              className="mt-2 w-full rounded-2xl border border-line bg-white px-4 py-3 text-[15px] outline-none"
            />
            <div className="mt-2 grid grid-cols-2 gap-3">
              <input
                name="lineQuantity"
                type="number"
                min={1}
                defaultValue={1}
                className="rounded-2xl border border-line bg-white px-4 py-3 text-[15px] outline-none"
              />
              <input
                name="lineAmount"
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
        {pending ? "Saving…" : "Create draft invoice"}
      </button>
    </form>
  );
}
