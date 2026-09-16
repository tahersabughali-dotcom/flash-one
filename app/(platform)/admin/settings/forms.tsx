"use client";

import { useActionState } from "react";
import {
  updateBrandSettingsAction,
  updateCompanySettingsAction,
  type SettingsFormState,
} from "../settings-actions";

const initial: SettingsFormState = { error: null };

export function CompanySettingsForm({
  company,
}: {
  company: Record<string, unknown> | null;
}) {
  const [state, action] = useActionState(updateCompanySettingsAction, initial);
  return (
    <form action={action} className="space-y-4">
      {state.error ? <p className="text-sm text-red-700">{state.error}</p> : null}
      {(
        [
          ["legalCompanyName", "Legal company name", company?.legal_company_name],
          ["tradingName", "Trading name", company?.trading_name],
          ["companyNumber", "Company number", company?.company_number],
          ["registeredAddress", "Registered address", company?.registered_address],
          ["countryCode", "Country code", company?.country_code],
          ["vatNumber", "VAT number", company?.vat_number],
          ["publicEmail", "Public email", company?.public_email],
          ["publicPhone", "Public phone", company?.public_phone],
          ["website", "Website", company?.website],
          ["supportContact", "Support contact", company?.support_contact],
        ] as const
      ).map(([name, label, value]) => (
        <label key={name} className="block text-sm">
          <span className="font-semibold text-navy">{label}</span>
          <input
            name={name}
            defaultValue={value ? String(value) : ""}
            className="mt-1 w-full rounded-xl border border-line px-3 py-2"
          />
        </label>
      ))}
      <label className="block text-sm">
        <span className="font-semibold text-navy">VAT registered</span>
        <select
          name="vatRegistered"
          defaultValue={
            company?.vat_registered === true
              ? "true"
              : company?.vat_registered === false
                ? "false"
                : ""
          }
          className="mt-1 w-full rounded-xl border border-line px-3 py-2"
        >
          <option value="">Unknown / blank</option>
          <option value="true">Yes</option>
          <option value="false">No</option>
        </select>
      </label>
      <button type="submit" className="rounded-(--radius-button) bg-blue px-5 py-2.5 text-sm font-semibold text-white">
        Save company settings
      </button>
    </form>
  );
}

export function BrandSettingsForm({
  brand,
}: {
  brand: Record<string, unknown> | null;
}) {
  const [state, action] = useActionState(updateBrandSettingsAction, initial);
  return (
    <form action={action} className="space-y-4">
      {state.error ? <p className="text-sm text-red-700">{state.error}</p> : null}
      <label className="block text-sm">
        <span className="font-semibold text-navy">Brand name</span>
        <input
          name="brandName"
          required
          defaultValue={brand?.brand_name ? String(brand.brand_name) : "Flash One"}
          className="mt-1 w-full rounded-xl border border-line px-3 py-2"
        />
      </label>
      <label className="block text-sm">
        <span className="font-semibold text-navy">Website</span>
        <input
          name="website"
          required
          defaultValue={brand?.website ? String(brand.website) : "https://www.flashone.uk"}
          className="mt-1 w-full rounded-xl border border-line px-3 py-2"
        />
      </label>
      <label className="block text-sm">
        <span className="font-semibold text-navy">Invoice branding name</span>
        <input
          name="invoiceBrandingName"
          required
          defaultValue={
            brand?.invoice_branding_name ? String(brand.invoice_branding_name) : "Flash One"
          }
          className="mt-1 w-full rounded-xl border border-line px-3 py-2"
        />
      </label>
      <button type="submit" className="rounded-(--radius-button) bg-blue px-5 py-2.5 text-sm font-semibold text-white">
        Save brand settings
      </button>
    </form>
  );
}
