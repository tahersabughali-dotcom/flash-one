"use client";

import { useActionState } from "react";
import {
  completeDeveloperOnboardingAction,
  type OnboardingFormState,
} from "../actions";

const initialState: OnboardingFormState = { error: null };

export function DeveloperOnboardingForm({
  defaultDisplayName,
}: {
  defaultDisplayName: string;
}) {
  const [state, formAction, pending] = useActionState(
    completeDeveloperOnboardingAction,
    initialState,
  );

  return (
    <form action={formAction} className="mt-8 space-y-5">
      <label className="block">
        <span className="text-sm font-semibold text-navy-deep">Display name</span>
        <input
          name="displayName"
          type="text"
          defaultValue={defaultDisplayName}
          autoComplete="nickname"
          required
          maxLength={120}
          className="mt-2 w-full rounded-2xl border border-line bg-white px-4 py-3 text-[15px] text-navy outline-none"
        />
      </label>

      <label className="block">
        <span className="text-sm font-semibold text-navy-deep">Headline</span>
        <input
          name="headline"
          type="text"
          maxLength={160}
          placeholder="Optional"
          className="mt-2 w-full rounded-2xl border border-line bg-white px-4 py-3 text-[15px] text-navy outline-none"
        />
      </label>

      <label className="block">
        <span className="text-sm font-semibold text-navy-deep">Bio</span>
        <textarea
          name="bio"
          rows={4}
          maxLength={1000}
          placeholder="Optional"
          className="mt-2 w-full rounded-2xl border border-line bg-white px-4 py-3 text-[15px] text-navy outline-none"
        />
      </label>

      <label className="block">
        <span className="text-sm font-semibold text-navy-deep">Availability</span>
        <select
          name="availabilityStatus"
          defaultValue="available"
          className="mt-2 w-full rounded-2xl border border-line bg-white px-4 py-3 text-[15px] text-navy outline-none"
        >
          <option value="available">Available</option>
          <option value="limited">Limited</option>
          <option value="unavailable">Unavailable</option>
        </select>
      </label>

      {state.error ? (
        <p className="text-sm font-medium text-red-700" role="alert">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex w-full items-center justify-center rounded-(--radius-button) bg-blue px-5 py-3 text-sm font-semibold text-white shadow-(--shadow-button) hover:bg-blue-bright disabled:opacity-60"
      >
        {pending ? "Saving profile…" : "Create developer profile"}
      </button>
    </form>
  );
}
