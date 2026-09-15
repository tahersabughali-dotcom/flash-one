"use client";

import { useActionState } from "react";
import {
  TASK_PRIORITIES,
  TASK_PRIORITY_LABELS,
  TASK_STATUSES,
  TASK_STATUS_LABELS,
} from "@/modules/tasks";
import {
  adminCreateTaskAction,
  type AdminProjectFormState,
} from "./actions";

const initialState: AdminProjectFormState = { error: null };

export function AdminTaskCreateForm({
  projectPublicId,
}: {
  projectPublicId: string;
}) {
  const [state, formAction, pending] = useActionState(
    adminCreateTaskAction,
    initialState,
  );

  return (
    <form action={formAction} className="mt-4 space-y-3">
      <input type="hidden" name="projectPublicId" value={projectPublicId} />
      <input
        name="title"
        required
        maxLength={160}
        placeholder="Task title"
        className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-[15px] outline-none"
      />
      <textarea
        name="description"
        rows={3}
        maxLength={4000}
        placeholder="Optional description"
        className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-[15px] outline-none"
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <select name="status" defaultValue="todo" className="rounded-2xl border border-line bg-white px-4 py-3 text-sm">
          {TASK_STATUSES.map((status) => (
            <option key={status} value={status}>
              {TASK_STATUS_LABELS[status]}
            </option>
          ))}
        </select>
        <select name="priority" defaultValue="normal" className="rounded-2xl border border-line bg-white px-4 py-3 text-sm">
          {TASK_PRIORITIES.map((priority) => (
            <option key={priority} value={priority}>
              {TASK_PRIORITY_LABELS[priority]}
            </option>
          ))}
        </select>
      </div>
      <input name="dueAt" type="date" className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm" />
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="customerVisible" value="true" />
        Visible to customer
      </label>
      {state.error ? <p className="text-sm font-medium text-red-700">{state.error}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center justify-center rounded-(--radius-button) bg-blue px-5 py-2.5 text-sm font-semibold text-white shadow-(--shadow-button) disabled:opacity-60"
      >
        {pending ? "Saving…" : "Create task"}
      </button>
    </form>
  );
}
