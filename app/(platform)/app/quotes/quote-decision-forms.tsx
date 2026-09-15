"use client";

import { useActionState } from "react";
import {
  acceptQuoteAction,
  rejectQuoteAction,
  type WorkflowFormState,
} from "../requests/actions";

const initialState: WorkflowFormState = { error: null };

export function QuoteDecisionForms({
  quotePublicId,
}: {
  quotePublicId: string;
}) {
  const [acceptState, acceptAction, accepting] = useActionState(
    acceptQuoteAction,
    initialState,
  );
  const [rejectState, rejectAction, rejecting] = useActionState(
    rejectQuoteAction,
    initialState,
  );

  return (
    <div className="mt-8 space-y-4">
      {acceptState.error ? (
        <p className="text-sm font-medium text-red-700" role="alert">
          {acceptState.error}
        </p>
      ) : null}
      {rejectState.error ? (
        <p className="text-sm font-medium text-red-700" role="alert">
          {rejectState.error}
        </p>
      ) : null}
      <form action={acceptAction}>
        <input type="hidden" name="quotePublicId" value={quotePublicId} />
        <button
          type="submit"
          disabled={accepting || rejecting}
          className="inline-flex w-full items-center justify-center rounded-(--radius-button) bg-blue px-5 py-3 text-sm font-semibold text-white shadow-(--shadow-button) disabled:opacity-60"
        >
          {accepting ? "Accepting…" : "Accept quote"}
        </button>
      </form>
      <form action={rejectAction}>
        <input type="hidden" name="quotePublicId" value={quotePublicId} />
        <button
          type="submit"
          disabled={accepting || rejecting}
          className="inline-flex w-full items-center justify-center rounded-(--radius-button) border border-line bg-white px-5 py-3 text-sm font-semibold text-navy disabled:opacity-60"
        >
          {rejecting ? "Rejecting…" : "Reject quote"}
        </button>
      </form>
    </div>
  );
}
