"use client";

import { ConfirmSubmitButton } from "@/components/platform/ConfirmSubmitButton";
import { useActionState } from "react";
import {
  CATALOG_CATEGORIES,
  CATALOG_CATEGORY_LABELS,
  CATALOG_MODES,
  CATALOG_MODE_LABELS,
  CATALOG_STATUSES,
  CATALOG_STATUS_LABELS,
} from "@/modules/services";
import { INVOICE_CURRENCIES } from "@/modules/invoices";
import { adminUpsertServiceAction } from "../commercial-actions";
import type { AdminFinanceFormState } from "../finance-errors";
import type { CatalogService } from "@/lib/server/services";
import { formatMinor } from "@/modules/invoices";

const initialState: AdminFinanceFormState = { error: null };

export function CatalogServiceForm({ service }: { service?: CatalogService }) {
  const [state, formAction, pending] = useActionState(adminUpsertServiceAction, initialState);
  return (
    <form action={formAction} className="mt-6 space-y-5">
      {service ? <input type="hidden" name="publicId" value={service.publicId} /> : null}
      <label className="block">
        <span className="text-sm font-semibold text-navy-deep">Name</span>
        <input
          name="name"
          required
          defaultValue={service?.name ?? ""}
          className="mt-2 w-full rounded-2xl border border-line bg-white px-4 py-3 text-[15px]"
        />
      </label>
      <label className="block">
        <span className="text-sm font-semibold text-navy-deep">Description</span>
        <textarea
          name="description"
          required
          rows={4}
          defaultValue={service?.description ?? ""}
          className="mt-2 w-full rounded-2xl border border-line bg-white px-4 py-3 text-[15px]"
        />
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-semibold text-navy-deep">Category</span>
          <select
            name="category"
            defaultValue={service?.category ?? "software_development"}
            className="mt-2 w-full rounded-2xl border border-line bg-white px-4 py-3 text-[15px]"
          >
            {CATALOG_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {CATALOG_CATEGORY_LABELS[category]}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-navy-deep">Status</span>
          <select
            name="status"
            defaultValue={service?.status ?? "active"}
            className="mt-2 w-full rounded-2xl border border-line bg-white px-4 py-3 text-[15px]"
          >
            {CATALOG_STATUSES.map((status) => (
              <option key={status} value={status}>
                {CATALOG_STATUS_LABELS[status]}
              </option>
            ))}
          </select>
        </label>
      </div>
      <label className="flex items-center gap-2 text-sm font-semibold text-navy-deep">
        <input type="checkbox" name="customerVisible" defaultChecked={service?.customerVisible} />
        Visible to customers
      </label>
      <label className="block">
        <span className="text-sm font-semibold text-navy-deep">Commercial mode</span>
        <select
          name="commercialMode"
          defaultValue={service?.commercialMode ?? "quote_required"}
          className="mt-2 w-full rounded-2xl border border-line bg-white px-4 py-3 text-[15px]"
        >
          {CATALOG_MODES.map((mode) => (
            <option key={mode} value={mode}>
              {CATALOG_MODE_LABELS[mode]}
            </option>
          ))}
        </select>
      </label>
      <p className="text-sm text-muted">
        Quote-required services do not store a default price. Fixed-price is optional and only where appropriate.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-semibold text-navy-deep">Default currency</span>
          <select
            name="defaultCurrency"
            defaultValue={service?.defaultCurrency ?? ""}
            className="mt-2 w-full rounded-2xl border border-line bg-white px-4 py-3 text-[15px]"
          >
            <option value="">None</option>
            {INVOICE_CURRENCIES.map((currency) => (
              <option key={currency} value={currency}>
                {currency}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-navy-deep">Default price</span>
          <input
            name="defaultPrice"
            placeholder="Only for fixed-price"
            defaultValue={
              service?.defaultPriceMinor !== null && service?.defaultCurrency
                ? formatMinor(service.defaultPriceMinor, service.defaultCurrency).replace(/[^\d.]/g, "")
                : ""
            }
            className="mt-2 w-full rounded-2xl border border-line bg-white px-4 py-3 text-[15px]"
          />
        </label>
      </div>
      <label className="block">
        <span className="text-sm font-semibold text-navy-deep">Internal notes</span>
        <textarea
          name="internalNotes"
          rows={3}
          defaultValue={service?.internalNotes ?? ""}
          className="mt-2 w-full rounded-2xl border border-line bg-white px-4 py-3 text-[15px]"
        />
      </label>
      {state.error ? (
        <p className="text-sm font-medium text-red-700" role="alert">
          {state.error}
        </p>
      ) : null}
      {service ? (
        <ConfirmSubmitButton
          confirmMessage="Save service changes? Setting status to Archived removes it from the customer catalog."
          disabled={pending}
          className="rounded-(--radius-button) bg-blue px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save service"}
        </ConfirmSubmitButton>
      ) : (
        <button
          type="submit"
          disabled={pending}
          className="rounded-(--radius-button) bg-blue px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save service"}
        </button>
      )}
    </form>
  );
}
