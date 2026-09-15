"use client";

import { useActionState } from "react";
import {
  completeBusinessOnboardingAction,
  type OnboardingFormState,
} from "../actions";

const initialState: OnboardingFormState = { error: null };

export function BusinessOnboardingForm() {
  const [state, formAction, pending] = useActionState(
    completeBusinessOnboardingAction,
    initialState,
  );

  return (
    <form action={formAction} className="mt-8 space-y-5">
      <label className="block">
        <span className="text-sm font-semibold text-navy-deep">
          Organization name
        </span>
        <input
          name="organizationName"
          type="text"
          autoComplete="organization"
          required
          maxLength={120}
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
        disabled={pending}
        className="inline-flex w-full items-center justify-center rounded-(--radius-button) bg-blue px-5 py-3 text-sm font-semibold text-white shadow-(--shadow-button) hover:bg-blue-bright disabled:opacity-60"
      >
        {pending ? "Creating organization…" : "Create organization"}
      </button>
    </form>
  );
}
