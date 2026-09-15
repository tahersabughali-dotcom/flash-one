"use client";

import { useActionState } from "react";
import {
  acceptDeliverableAction,
  requestDeliverableChangesAction,
  type ProjectWorkspaceFormState,
} from "./actions";

const initialState: ProjectWorkspaceFormState = { error: null };

export function CustomerDeliverableReview({
  projectPublicId,
  deliverablePublicId,
}: {
  projectPublicId: string;
  deliverablePublicId: string;
}) {
  const [acceptState, acceptAction, accepting] = useActionState(
    acceptDeliverableAction,
    initialState,
  );
  const [changeState, changeAction, requesting] = useActionState(
    requestDeliverableChangesAction,
    initialState,
  );

  return (
    <div className="mt-4 space-y-4">
      {acceptState.error ? (
        <p className="text-sm font-medium text-red-700">{acceptState.error}</p>
      ) : null}
      {changeState.error ? (
        <p className="text-sm font-medium text-red-700">{changeState.error}</p>
      ) : null}
      <form action={acceptAction}>
        <input type="hidden" name="projectPublicId" value={projectPublicId} />
        <input type="hidden" name="deliverablePublicId" value={deliverablePublicId} />
        <button
          type="submit"
          disabled={accepting || requesting}
          className="inline-flex w-full items-center justify-center rounded-(--radius-button) bg-blue px-5 py-2.5 text-sm font-semibold text-white shadow-(--shadow-button) disabled:opacity-60"
        >
          {accepting ? "Saving…" : "Accept this delivery"}
        </button>
      </form>
      <form action={changeAction} className="space-y-3">
        <input type="hidden" name="projectPublicId" value={projectPublicId} />
        <input type="hidden" name="deliverablePublicId" value={deliverablePublicId} />
        <textarea
          name="note"
          required
          rows={3}
          maxLength={2000}
          placeholder="What needs to change?"
          className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-[15px] outline-none"
        />
        <button
          type="submit"
          disabled={accepting || requesting}
          className="inline-flex w-full items-center justify-center rounded-(--radius-button) border border-line bg-white px-5 py-2.5 text-sm font-semibold text-navy disabled:opacity-60"
        >
          {requesting ? "Sending…" : "Request changes"}
        </button>
      </form>
    </div>
  );
}
