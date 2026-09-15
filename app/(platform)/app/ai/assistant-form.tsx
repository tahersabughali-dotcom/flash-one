"use client";

import { useActionState } from "react";
import { sendAiMessageAction, confirmAiSuggestionAction, type AiFormState } from "./actions";

const initialState: AiFormState = { error: null };

export function AiAssistantForm({
  conversationPublicId,
  organizations,
  hasIndividual,
  configured,
}: {
  conversationPublicId?: string;
  organizations: Array<{ publicId: string; name: string }>;
  hasIndividual: boolean;
  configured: boolean;
}) {
  const [state, formAction, pending] = useActionState(sendAiMessageAction, initialState);
  const [confirmState, confirmAction, confirmPending] = useActionState(
    confirmAiSuggestionAction,
    initialState,
  );

  return (
    <div className="mt-8 space-y-8">
      <form action={formAction} className="space-y-4">
        {conversationPublicId ? (
          <input type="hidden" name="conversationPublicId" value={conversationPublicId} />
        ) : null}
        <label className="block">
          <span className="text-sm font-semibold text-navy-deep">Idea</span>
          <input
            name="idea"
            className="mt-2 w-full rounded-2xl border border-line bg-white px-4 py-3 text-[15px]"
          />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-navy-deep">Goal</span>
          <input
            name="goal"
            className="mt-2 w-full rounded-2xl border border-line bg-white px-4 py-3 text-[15px]"
          />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-navy-deep">Business context</span>
          <textarea
            name="businessContext"
            rows={3}
            className="mt-2 w-full rounded-2xl border border-line bg-white px-4 py-3 text-[15px]"
          />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-navy-deep">Desired outcome</span>
          <textarea
            name="desiredOutcome"
            rows={3}
            className="mt-2 w-full rounded-2xl border border-line bg-white px-4 py-3 text-[15px]"
          />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-navy-deep">Message</span>
          <textarea
            name="body"
            required
            rows={4}
            className="mt-2 w-full rounded-2xl border border-line bg-white px-4 py-3 text-[15px]"
          />
        </label>
        {state.error ? (
          <p className="text-sm font-medium text-red-700" role="alert">
            {state.error}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={pending || !configured}
          className="rounded-(--radius-button) bg-blue px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
        >
          {pending ? "Working\u2026" : configured ? "Ask the assistant" : "AI is not configured"}
        </button>
      </form>
      {conversationPublicId && (hasIndividual || organizations.length > 0) ? (
        <form action={confirmAction} className="space-y-4">
          <input type="hidden" name="conversationPublicId" value={conversationPublicId} />
          <label className="block">
            <span className="text-sm font-semibold text-navy-deep">Create work request for</span>
            <select
              name="owner"
              required
              className="mt-2 w-full rounded-2xl border border-line bg-white px-4 py-3 text-[15px]"
              defaultValue={hasIndividual ? "individual" : `org:${organizations[0]?.publicId ?? ""}`}
            >
              {hasIndividual ? <option value="individual">Myself</option> : null}
              {organizations.map((organization) => (
                <option key={organization.publicId} value={`org:${organization.publicId}`}>
                  {organization.name}
                </option>
              ))}
            </select>
          </label>
          {confirmState.error ? (
            <p className="text-sm font-medium text-red-700" role="alert">
              {confirmState.error}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={confirmPending}
            className="rounded-(--radius-button) border border-line bg-white px-5 py-2.5 text-sm font-semibold text-navy"
          >
            {confirmPending ? "Creating\u2026" : "Review and create work request"}
          </button>
        </form>
      ) : null}
    </div>
  );
}
