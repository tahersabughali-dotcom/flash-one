"use client";

import { useActionState } from "react";
import {
  adminUploadProjectFileAction,
  type AdminProjectFormState,
} from "./actions";

const initialState: AdminProjectFormState = { error: null };

export function AdminFileUploadForm({
  projectPublicId,
}: {
  projectPublicId: string;
}) {
  const [state, formAction, pending] = useActionState(
    adminUploadProjectFileAction,
    initialState,
  );

  return (
    <form action={formAction} className="mt-4 space-y-3">
      <input type="hidden" name="projectPublicId" value={projectPublicId} />
      <input name="file" type="file" required className="block w-full text-sm" />
      <select name="visibility" defaultValue="customer" className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm">
        <option value="customer">Visible to customer</option>
        <option value="project_team">Project team</option>
        <option value="internal">Internal only</option>
      </select>
      {state.error ? <p className="text-sm font-medium text-red-700">{state.error}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center justify-center rounded-(--radius-button) bg-blue px-5 py-2.5 text-sm font-semibold text-white shadow-(--shadow-button) disabled:opacity-60"
      >
        {pending ? "Uploading…" : "Upload file"}
      </button>
    </form>
  );
}
