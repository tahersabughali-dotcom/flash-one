"use client";

import { useActionState } from "react";
import {
  addBusinessRelationshipAction,
  addDeveloperRelationshipAction,
  addIndividualRelationshipAction,
  type RelationshipFormState,
} from "./actions";

const initialState: RelationshipFormState = { error: null };

export function AdditionalRelationshipForms({
  hasIndividual,
  hasDeveloper,
}: {
  hasIndividual: boolean;
  hasDeveloper: boolean;
}) {
  const [individualState, individualAction, individualPending] = useActionState(
    addIndividualRelationshipAction,
    initialState,
  );
  const [businessState, businessAction, businessPending] = useActionState(
    addBusinessRelationshipAction,
    initialState,
  );
  const [developerState, developerAction, developerPending] = useActionState(
    addDeveloperRelationshipAction,
    initialState,
  );

  return (
    <div className="mt-8 space-y-6">
      {hasIndividual ? null : (
        <form action={individualAction} className="rounded-2xl border border-line bg-white p-5">
          <p className="font-semibold text-navy-deep">Add individual relationship</p>
          {individualState.error ? (
            <p className="mt-2 text-sm font-medium text-red-700">{individualState.error}</p>
          ) : null}
          <button
            type="submit"
            disabled={individualPending}
            className="mt-4 rounded-(--radius-button) bg-blue px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {individualPending ? "Adding…" : "Add individual"}
          </button>
        </form>
      )}
      <form action={businessAction} className="rounded-2xl border border-line bg-white p-5">
        <p className="font-semibold text-navy-deep">Create a business</p>
        <input
          name="organizationName"
          required
          maxLength={120}
          placeholder="Organization name"
          className="mt-3 w-full rounded-2xl border border-line px-4 py-3 text-[15px]"
        />
        {businessState.error ? (
          <p className="mt-2 text-sm font-medium text-red-700">{businessState.error}</p>
        ) : null}
        <button
          type="submit"
          disabled={businessPending}
          className="mt-4 rounded-(--radius-button) bg-blue px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {businessPending ? "Creating…" : "Create business"}
        </button>
      </form>
      {hasDeveloper ? null : (
        <form action={developerAction} className="rounded-2xl border border-line bg-white p-5">
          <p className="font-semibold text-navy-deep">Add developer profile</p>
          <input
            name="displayName"
            required
            maxLength={120}
            placeholder="Display name"
            className="mt-3 w-full rounded-2xl border border-line px-4 py-3 text-[15px]"
          />
          {developerState.error ? (
            <p className="mt-2 text-sm font-medium text-red-700">{developerState.error}</p>
          ) : null}
          <button
            type="submit"
            disabled={developerPending}
            className="mt-4 rounded-(--radius-button) bg-blue px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {developerPending ? "Adding…" : "Add developer"}
          </button>
        </form>
      )}
    </div>
  );
}
