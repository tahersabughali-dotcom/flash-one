"use client";

import { useActionState } from "react";
import { customerCreateSupportCaseAction, type CaseFormState } from "./actions";

const initial: CaseFormState = { error: null };

export function CustomerCaseForm() {
  const [state, formAction, pending] = useActionState(customerCreateSupportCaseAction, initial);
  return (
    <form action={formAction} className="mt-6 space-y-4">
      <label className="block">
        <span className="text-sm font-semibold text-navy-deep">Title</span>
        <input
          name="title"
          required
          maxLength={160}
          className="mt-2 w-full rounded-2xl border border-line bg-white px-4 py-3 text-[15px]"
        />
      </label>
      <label className="block">
        <span className="text-sm font-semibold text-navy-deep">Description</span>
        <textarea
          name="description"
          rows={5}
          maxLength={8000}
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
        className="rounded-(--radius-button) bg-blue px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
      >
        {pending ? "Submitting…" : "Open case"}
      </button>
    </form>
  );
}
