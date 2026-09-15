"use client";

import { useActionState } from "react";
import { INVOICE_CURRENCIES } from "@/modules/invoices";
import { PAYMENT_SERVICES, PAYMENT_SERVICE_LABELS } from "@/modules/payment-requests";
import type { AdminFinanceFormState } from "../../finance-errors";
import { adminCreatePaymentRequestAction } from "../actions";

const initialState: AdminFinanceFormState = { error: null };

export function PaymentRequestForm({
  customers,
  organizations,
}: {
  customers: Array<{ publicId: string; displayName: string }>;
  organizations: Array<{ publicId: string; name: string }>;
}) {
  const [state, formAction, pending] = useActionState(
    adminCreatePaymentRequestAction,
    initialState,
  );
  return (
    <form action={formAction} className="mt-6 space-y-5">
      <label className="block">
        <span className="text-sm font-semibold text-navy-deep">Invoice public ID</span>
        <input
          name="invoicePublicId"
          placeholder="Optional. Uses invoice amount due."
          className="mt-2 w-full rounded-2xl border border-line bg-white px-4 py-3 text-[15px]"
        />
      </label>
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
          <span className="text-sm font-semibold text-navy-deep">Guest email</span>
          <input
            name="guestEmail"
            type="email"
            className="mt-2 w-full rounded-2xl border border-line bg-white px-4 py-3 text-[15px]"
          />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-navy-deep">Guest name</span>
          <input
            name="guestName"
            className="mt-2 w-full rounded-2xl border border-line bg-white px-4 py-3 text-[15px]"
          />
        </label>
      </div>
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
          <span className="text-sm font-semibold text-navy-deep">Amount mode</span>
          <select
            name="amountMode"
            defaultValue="fixed"
            className="mt-2 w-full rounded-2xl border border-line bg-white px-4 py-3 text-[15px]"
          >
            <option value="fixed">Fixed amount</option>
            <option value="customer_entered">Customer entered</option>
          </select>
        </label>
      </div>
      <label className="block">
        <span className="text-sm font-semibold text-navy-deep">Amount</span>
        <input
          name="amount"
          placeholder="Required for fixed standalone requests"
          className="mt-2 w-full rounded-2xl border border-line bg-white px-4 py-3 text-[15px]"
        />
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-semibold text-navy-deep">Minimum</span>
          <input
            name="minAmount"
            className="mt-2 w-full rounded-2xl border border-line bg-white px-4 py-3 text-[15px]"
          />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-navy-deep">Maximum</span>
          <input
            name="maxAmount"
            className="mt-2 w-full rounded-2xl border border-line bg-white px-4 py-3 text-[15px]"
          />
        </label>
      </div>
      <label className="block">
        <span className="text-sm font-semibold text-navy-deep">Service</span>
        <select
          name="serviceCode"
          className="mt-2 w-full rounded-2xl border border-line bg-white px-4 py-3 text-[15px]"
          defaultValue=""
        >
          <option value="">None</option>
          {PAYMENT_SERVICES.map((code) => (
            <option key={code} value={code}>
              {PAYMENT_SERVICE_LABELS[code]}
            </option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="text-sm font-semibold text-navy-deep">Description</span>
        <input
          name="description"
          className="mt-2 w-full rounded-2xl border border-line bg-white px-4 py-3 text-[15px]"
        />
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
        {pending ? "Creating…" : "Create payment request"}
      </button>
    </form>
  );
}
