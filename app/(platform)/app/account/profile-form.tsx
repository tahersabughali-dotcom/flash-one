"use client";

import { useActionState } from "react";
import { updateProfileNameAction, type AccountFormState } from "./actions";

const initialState: AccountFormState = { error: null, message: null };

export function AccountProfileForm({ fullName }: { fullName: string }) {
  const [state, formAction, pending] = useActionState(updateProfileNameAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <label className="block">
        <span className="text-sm font-semibold text-navy-deep">Full name</span>
        <input
          name="fullName"
          type="text"
          required
          maxLength={120}
          defaultValue={fullName}
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
        className="rounded-(--radius-button) bg-blue px-5 py-2.5 text-sm font-semibold text-white shadow-(--shadow-button) disabled:opacity-50"
      >
        {pending ? "Saving…" : "Save name"}
      </button>
    </form>
  );
}
