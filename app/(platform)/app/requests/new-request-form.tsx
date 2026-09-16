"use client";

import { useActionState } from "react";
import type { AccountSummary } from "@/modules/account";
import {
  SERVICE_CATEGORIES,
  SERVICE_CATEGORY_LABELS,
} from "@/modules/work-requests";
import type { CatalogService } from "@/lib/server/services";
import {
  createWorkRequestAction,
  type WorkflowFormState,
} from "./actions";

const initialState: WorkflowFormState = { error: null };

export function NewWorkRequestForm({
  summary,
  catalogServices,
}: {
  summary: AccountSummary;
  catalogServices: CatalogService[];
}) {
  const [state, formAction, pending] = useActionState(
    createWorkRequestAction,
    initialState,
  );
  const canIndividual = summary.individual;
  const businesses = summary.organizations;
  const values = state.values;
  const defaultOwner =
    values?.owner ||
    (canIndividual ? "individual" : businesses[0] ? `org:${businesses[0].publicId}` : "");

  return (
    <form
      action={formAction}
      className="mt-8 space-y-5"
      key={`${state.error ?? "ok"}-${values?.title ?? ""}`}
    >
      <label className="block">
        <span className="text-sm font-semibold text-navy-deep">Request for</span>
        <select
          name="owner"
          required
          className="mt-2 w-full rounded-2xl border border-line bg-white px-4 py-3 text-[15px] text-navy outline-none"
          defaultValue={defaultOwner}
        >
          {canIndividual ? <option value="individual">Myself</option> : null}
          {businesses.map((organization) => (
            <option key={organization.publicId} value={`org:${organization.publicId}`}>
              {organization.name}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="text-sm font-semibold text-navy-deep">Catalog service (optional)</span>
        <select
          name="catalogServicePublicId"
          className="mt-2 w-full rounded-2xl border border-line bg-white px-4 py-3 text-[15px] text-navy outline-none"
          defaultValue={values?.catalogServicePublicId || ""}
        >
          <option value="">Custom request — not from catalog</option>
          {catalogServices.map((service) => (
            <option key={service.publicId} value={service.publicId}>
              {service.name}
              {service.commercialMode === "quote_required" ? " · quote required" : ""}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="text-sm font-semibold text-navy-deep">Service</span>
        <select
          name="serviceCategory"
          required
          className="mt-2 w-full rounded-2xl border border-line bg-white px-4 py-3 text-[15px] text-navy outline-none"
          defaultValue={values?.serviceCategory || "software_development"}
        >
          {SERVICE_CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {SERVICE_CATEGORY_LABELS[category]}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="text-sm font-semibold text-navy-deep">Title</span>
        <input
          name="title"
          type="text"
          required
          maxLength={160}
          defaultValue={values?.title ?? ""}
          className="mt-2 w-full rounded-2xl border border-line bg-white px-4 py-3 text-[15px] text-navy outline-none"
        />
      </label>

      <label className="block">
        <span className="text-sm font-semibold text-navy-deep">Short description</span>
        <textarea
          name="summary"
          required
          rows={4}
          maxLength={2000}
          defaultValue={values?.summary ?? ""}
          className="mt-2 w-full rounded-2xl border border-line bg-white px-4 py-3 text-[15px] text-navy outline-none"
        />
      </label>

      <label className="block">
        <span className="text-sm font-semibold text-navy-deep">Detailed requirements</span>
        <textarea
          name="details"
          rows={6}
          maxLength={8000}
          defaultValue={values?.details ?? ""}
          className="mt-2 w-full rounded-2xl border border-line bg-white px-4 py-3 text-[15px] text-navy outline-none"
        />
      </label>

      <label className="block">
        <span className="text-sm font-semibold text-navy-deep">Budget indication</span>
        <input
          name="budgetIndication"
          type="text"
          maxLength={120}
          placeholder="Optional"
          defaultValue={values?.budgetIndication ?? ""}
          className="mt-2 w-full rounded-2xl border border-line bg-white px-4 py-3 text-[15px] text-navy outline-none"
        />
      </label>

      <label className="block">
        <span className="text-sm font-semibold text-navy-deep">Desired timeline</span>
        <input
          name="desiredTimeline"
          type="text"
          maxLength={120}
          placeholder="Optional"
          defaultValue={values?.desiredTimeline ?? ""}
          className="mt-2 w-full rounded-2xl border border-line bg-white px-4 py-3 text-[15px] text-navy outline-none"
        />
      </label>

      {state.error ? (
        <p className="text-sm font-medium text-red-700" role="alert">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending || (!canIndividual && businesses.length === 0)}
        className="inline-flex w-full items-center justify-center rounded-(--radius-button) bg-blue px-5 py-3 text-sm font-semibold text-white shadow-(--shadow-button) hover:bg-blue-bright disabled:opacity-60"
      >
        {pending ? "Submitting…" : "Submit request"}
      </button>
    </form>
  );
}
