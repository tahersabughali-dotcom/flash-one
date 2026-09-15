"use client";

import { useActionState } from "react";
import type { AccountSummary } from "@/modules/account";
import {
  SERVICE_CATEGORIES,
  SERVICE_CATEGORY_LABELS,
} from "@/modules/work-requests";
import {
  createWorkRequestAction,
  type WorkflowFormState,
} from "./actions";

const initialState: WorkflowFormState = { error: null };

export function NewWorkRequestForm({ summary }: { summary: AccountSummary }) {
  const [state, formAction, pending] = useActionState(
    createWorkRequestAction,
    initialState,
  );
  const canIndividual = summary.individual;
  const businesses = summary.organizations;

  return (
    <form action={formAction} className="mt-8 space-y-5">
      <label className="block">
        <span className="text-sm font-semibold text-navy-deep">Request for</span>
        <select
          name="owner"
          required
          className="mt-2 w-full rounded-2xl border border-line bg-white px-4 py-3 text-[15px] text-navy outline-none"
          defaultValue={canIndividual ? "individual" : businesses[0] ? `org:${businesses[0].publicId}` : ""}
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
        <span className="text-sm font-semibold text-navy-deep">Service</span>
        <select
          name="serviceCategory"
          required
          className="mt-2 w-full rounded-2xl border border-line bg-white px-4 py-3 text-[15px] text-navy outline-none"
          defaultValue="software_development"
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
          className="mt-2 w-full rounded-2xl border border-line bg-white px-4 py-3 text-[15px] text-navy outline-none"
        />
      </label>

      <label className="block">
        <span className="text-sm font-semibold text-navy-deep">Detailed requirements</span>
        <textarea
          name="details"
          rows={6}
          maxLength={8000}
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
