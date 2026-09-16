"use client";

import { useActionState } from "react";
import { createReleaseAction, type SettingsFormState } from "../../settings-actions";

const initial: SettingsFormState = { error: null };

export default function Page() {
  const [state, action] = useActionState(createReleaseAction, initial);
  return (
    <main>
      <h1 className="text-3xl font-extrabold text-navy">Record release</h1>
      <p className="mt-2 text-[15px] text-muted">Does not claim deployment occurred.</p>
      <form action={action} className="mt-8 max-w-xl space-y-4">
        {state.error ? <p className="text-sm text-red-700">{state.error}</p> : null}
        <label className="block text-sm">
          <span className="font-semibold">Version / name</span>
          <input name="versionName" required className="mt-1 w-full rounded-xl border border-line px-3 py-2" />
        </label>
        <label className="block text-sm">
          <span className="font-semibold">Environment</span>
          <select name="environmentLabel" defaultValue="development" className="mt-1 w-full rounded-xl border border-line px-3 py-2">
            <option value="development">Development</option>
            <option value="production">Production</option>
            <option value="unknown">Unknown</option>
          </select>
        </label>
        <label className="block text-sm">
          <span className="font-semibold">Commit reference</span>
          <input name="commitReference" className="mt-1 w-full rounded-xl border border-line px-3 py-2" />
        </label>
        <label className="block text-sm">
          <span className="font-semibold">Notes</span>
          <textarea name="notes" rows={4} className="mt-1 w-full rounded-xl border border-line px-3 py-2" />
        </label>
        <button type="submit" className="rounded-(--radius-button) bg-blue px-5 py-2.5 text-sm font-semibold text-white">
          Save record
        </button>
      </form>
    </main>
  );
}
