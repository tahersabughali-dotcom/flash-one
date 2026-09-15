"use client";

import { useActionState } from "react";
import { PROJECT_STATUSES, PROJECT_STATUS_LABELS } from "@/modules/projects";
import {
  adminUpdateProjectStatusAction,
  type AdminWorkflowFormState,
} from "../requests/actions";

const initialState: AdminWorkflowFormState = { error: null };

export function AdminProjectStatusForm({
  publicId,
  currentStatus,
}: {
  publicId: string;
  currentStatus: string;
}) {
  const [state, formAction, pending] = useActionState(
    adminUpdateProjectStatusAction,
    initialState,
  );

  return (
    <form action={formAction} className="mt-6 space-y-4">
      <input type="hidden" name="publicId" value={publicId} />
      <label className="block">
        <span className="text-sm font-semibold text-navy-deep">Status</span>
        <select
          name="status"
          defaultValue={currentStatus}
          className="mt-2 w-full rounded-2xl border border-line bg-white px-4 py-3 text-[15px] outline-none"
        >
          {PROJECT_STATUSES.map((status) => (
            <option key={status} value={status}>
              {PROJECT_STATUS_LABELS[status]}
            </option>
          ))}
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
        className="inline-flex items-center justify-center rounded-(--radius-button) bg-blue px-5 py-2.5 text-sm font-semibold text-white shadow-(--shadow-button) disabled:opacity-60"
      >
        {pending ? "Saving…" : "Update status"}
      </button>
    </form>
  );
}
