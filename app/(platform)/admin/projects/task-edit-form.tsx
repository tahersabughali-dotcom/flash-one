"use client";

import { useActionState } from "react";
import {
  TASK_PRIORITIES,
  TASK_PRIORITY_LABELS,
  TASK_STATUSES,
  TASK_STATUS_LABELS,
} from "@/modules/tasks";
import type { ProjectTask } from "@/lib/server/tasks";
import {
  adminUpdateTaskAction,
  type AdminProjectFormState,
} from "./actions";

const initialState: AdminProjectFormState = { error: null };

export function AdminTaskEditForm({
  projectPublicId,
  task,
}: {
  projectPublicId: string;
  task: ProjectTask;
}) {
  const [state, formAction, pending] = useActionState(
    adminUpdateTaskAction,
    initialState,
  );

  return (
    <form action={formAction} className="mt-3 space-y-3">
      <input type="hidden" name="projectPublicId" value={projectPublicId} />
      <input type="hidden" name="taskPublicId" value={task.publicId} />
      <input
        name="title"
        required
        defaultValue={task.title}
        maxLength={160}
        className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-[15px] outline-none"
      />
      <textarea
        name="description"
        rows={2}
        defaultValue={task.description ?? ""}
        className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm outline-none"
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <select name="status" defaultValue={task.status} className="rounded-2xl border border-line bg-white px-4 py-3 text-sm">
          {TASK_STATUSES.map((status) => (
            <option key={status} value={status}>
              {TASK_STATUS_LABELS[status]}
            </option>
          ))}
        </select>
        <select name="priority" defaultValue={task.priority} className="rounded-2xl border border-line bg-white px-4 py-3 text-sm">
          {TASK_PRIORITIES.map((priority) => (
            <option key={priority} value={priority}>
              {TASK_PRIORITY_LABELS[priority]}
            </option>
          ))}
        </select>
      </div>
      <input
        name="dueAt"
        type="date"
        defaultValue={task.dueAt ? task.dueAt.slice(0, 10) : ""}
        className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm"
      />
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="customerVisible"
          value="true"
          defaultChecked={task.customerVisible}
        />
        Visible to customer
      </label>
      {state.error ? <p className="text-sm font-medium text-red-700">{state.error}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="text-sm font-semibold text-blue disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save task"}
      </button>
    </form>
  );
}
