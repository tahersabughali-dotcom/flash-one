"use client";

import { useActionState } from "react";
import { acceptOrganizationInvitationAction, type RelationshipFormState } from "@/app/(platform)/app/relationships/actions";

const initialState: RelationshipFormState = { error: null };

export function InvitationAcceptForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState(acceptOrganizationInvitationAction, initialState);
  return (
    <form action={action} className="mt-8 space-y-4">
      <input type="hidden" name="token" value={token} />
      {state.error ? <p className="text-sm font-medium text-red-700">{state.error}</p> : null}
      <button
        type="submit"
        disabled={pending || !token}
        className="rounded-(--radius-button) bg-blue px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
      >
        {pending ? "Joining…" : "Accept invitation"}
      </button>
    </form>
  );
}
