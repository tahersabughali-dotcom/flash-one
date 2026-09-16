"use client";

import { useActionState } from "react";
import { adminAddInternalNoteAction, type AdminOpsFormState } from "./operations-actions";
import type { NoteEntityKind } from "@/modules/operations";

const initial: AdminOpsFormState = { error: null };

export function InternalNoteForm({
  entityKind,
  entityPublicId,
}: {
  entityKind: NoteEntityKind;
  entityPublicId: string;
}) {
  const [state, action, pending] = useActionState(adminAddInternalNoteAction, initial);
  return (
    <form action={action} className="mt-4 space-y-3">
      <input type="hidden" name="entityKind" value={entityKind} />
      <input type="hidden" name="entityPublicId" value={entityPublicId} />
      <textarea
        name="content"
        required
        rows={3}
        placeholder="Internal note"
        className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-[15px]"
      />
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
        {pending ? "Saving…" : "Add internal note"}
      </button>
    </form>
  );
}
