"use client";

import { useActionState } from "react";
import {
  sendDeveloperProjectMessageAction,
  uploadDeveloperProjectFileAction,
  type DeveloperWorkspaceFormState,
} from "./actions";

const initialState: DeveloperWorkspaceFormState = { error: null };

export function DeveloperFileUploadForm({ projectPublicId }: { projectPublicId: string }) {
  const [state, action, pending] = useActionState(uploadDeveloperProjectFileAction, initialState);
  return (
    <form action={action} className="mt-4 space-y-3">
      <input type="hidden" name="projectPublicId" value={projectPublicId} />
      <input name="file" type="file" required className="block w-full text-sm" />
      <p className="text-xs text-muted">Shared with the project team, not as an internal-only file.</p>
      {state.error ? <p className="text-sm font-medium text-red-700">{state.error}</p> : null}
      <button type="submit" disabled={pending} className="rounded-(--radius-button) bg-blue px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60">
        {pending ? "Uploading…" : "Upload file"}
      </button>
    </form>
  );
}

export function DeveloperMessageForm({ projectPublicId }: { projectPublicId: string }) {
  const [state, action, pending] = useActionState(sendDeveloperProjectMessageAction, initialState);
  return (
    <form action={action} className="mt-4 space-y-3">
      <input type="hidden" name="projectPublicId" value={projectPublicId} />
      <textarea name="body" required rows={4} maxLength={4000} className="w-full rounded-2xl border border-line px-4 py-3" />
      {state.error ? <p className="text-sm font-medium text-red-700">{state.error}</p> : null}
      <button type="submit" disabled={pending} className="rounded-(--radius-button) bg-blue px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60">
        {pending ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
