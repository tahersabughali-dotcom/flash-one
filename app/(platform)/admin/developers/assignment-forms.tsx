"use client";

import { useActionState } from "react";
import {
  assignDeveloperToProjectAction,
  unassignDeveloperFromProjectAction,
  type RelationshipFormState,
} from "@/app/(platform)/app/relationships/actions";

const initialState: RelationshipFormState = { error: null };

export function AssignDeveloperForm({ developerPublicId }: { developerPublicId: string }) {
  const [state, action, pending] = useActionState(assignDeveloperToProjectAction, initialState);
  return (
    <form action={action} className="mt-4 space-y-3 rounded-2xl border border-line bg-white p-5">
      <input type="hidden" name="developerPublicId" value={developerPublicId} />
      <p className="font-semibold text-navy-deep">Assign to project</p>
      <input
        name="projectPublicId"
        required
        placeholder="Project public ID"
        className="w-full rounded-2xl border border-line px-4 py-3"
      />
      {state.error ? <p className="text-sm font-medium text-red-700">{state.error}</p> : null}
      <button type="submit" disabled={pending} className="rounded-(--radius-button) bg-blue px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
        {pending ? "Assigning…" : "Assign developer"}
      </button>
    </form>
  );
}

export function UnassignDeveloperForm({
  developerPublicId,
  projectPublicId,
}: {
  developerPublicId: string;
  projectPublicId: string;
}) {
  const [state, action, pending] = useActionState(unassignDeveloperFromProjectAction, initialState);
  return (
    <form action={action}>
      <input type="hidden" name="developerPublicId" value={developerPublicId} />
      <input type="hidden" name="projectPublicId" value={projectPublicId} />
      {state.error ? <p className="text-sm font-medium text-red-700">{state.error}</p> : null}
      <button type="submit" disabled={pending} className="text-sm font-semibold text-red-700 disabled:opacity-60">
        {pending ? "Removing…" : "Unassign"}
      </button>
    </form>
  );
}
