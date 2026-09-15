"use client";

import { useActionState } from "react";
import {
  uploadProjectFileAction,
  type ProjectWorkspaceFormState,
} from "./actions";

const initialState: ProjectWorkspaceFormState = { error: null };

export function CustomerFileUploadForm({
  projectPublicId,
}: {
  projectPublicId: string;
}) {
  const [state, formAction, pending] = useActionState(
    uploadProjectFileAction,
    initialState,
  );

  return (
    <form action={formAction} className="mt-4 space-y-3">
      <input type="hidden" name="projectPublicId" value={projectPublicId} />
      <input
        name="file"
        type="file"
        required
        className="block w-full text-sm text-navy"
      />
      <p className="text-xs text-muted">
        PDF, images, Word, Excel, CSV, TXT or ZIP. Maximum 20 MB.
      </p>
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
        {pending ? "Uploading…" : "Upload file"}
      </button>
    </form>
  );
}
