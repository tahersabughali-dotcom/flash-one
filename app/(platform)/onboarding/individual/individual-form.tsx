"use client";

import { useActionState } from "react";
import {
  completeIndividualOnboardingAction,
  type OnboardingFormState,
} from "../actions";

const initialState: OnboardingFormState = { error: null };

export function IndividualOnboardingForm() {
  const [state, formAction, pending] = useActionState(
    completeIndividualOnboardingAction,
    initialState,
  );

  return (
    <form action={formAction} className="mt-8 space-y-5">
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
        {pending ? "Continuing…" : "Continue as an individual"}
      </button>
    </form>
  );
}
