"use client";

import { useActionState } from "react";
import {
  acceptContractAction,
  type WorkflowFormState,
} from "../requests/actions";

const initialState: WorkflowFormState = { error: null };

export function ContractAcceptForm({
  contractPublicId,
}: {
  contractPublicId: string;
}) {
  const [state, formAction, pending] = useActionState(
    acceptContractAction,
    initialState,
  );

  return (
    <form action={formAction} className="mt-8 space-y-4">
      {state.error ? (
        <p className="text-sm font-medium text-red-700" role="alert">
          {state.error}
        </p>
      ) : null}
      <input type="hidden" name="contractPublicId" value={contractPublicId} />
      <button
        type="submit"
        disabled={pending}
        className="inline-flex w-full items-center justify-center rounded-(--radius-button) bg-blue px-5 py-3 text-sm font-semibold text-white shadow-(--shadow-button) disabled:opacity-60"
      >
        {pending ? "Recording…" : "Acknowledge this record"}
      </button>
    </form>
  );
}
