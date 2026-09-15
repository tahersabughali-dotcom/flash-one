"use client";

import { useActionState } from "react";
import {
  adminSendProjectMessageAction,
  type AdminProjectFormState,
} from "./actions";

const initialState: AdminProjectFormState = { error: null };

export function AdminMessageForm({
  projectPublicId,
}: {
  projectPublicId: string;
}) {
  const [state, formAction, pending] = useActionState(
    adminSendProjectMessageAction,
    initialState,
  );

  return (
    <form action={formAction} className="mt-4 space-y-3">
      <input type="hidden" name="projectPublicId" value={projectPublicId} />
      <textarea
        name="body"
        required
        rows={4}
        maxLength={4000}
        className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-[15px] outline-none"
      />
      {state.error ? <p className="text-sm font-medium text-red-700">{state.error}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center justify-center rounded-(--radius-button) bg-blue px-5 py-2.5 text-sm font-semibold text-white shadow-(--shadow-button) disabled:opacity-60"
      >
        {pending ? "Sending…" : "Send reply"}
      </button>
    </form>
  );
}
