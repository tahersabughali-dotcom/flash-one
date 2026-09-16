"use client";

import { useActionState } from "react";
import { upsertIncidentAction, type SettingsFormState } from "../../settings-actions";

const initial: SettingsFormState = { error: null };

export default function Page() {
  const [state, action] = useActionState(upsertIncidentAction, initial);
  return (
    <main>
      <h1 className="text-3xl font-extrabold text-navy">New incident</h1>
      <form action={action} className="mt-8 max-w-xl space-y-4">
        {state.error ? <p className="text-sm text-red-700">{state.error}</p> : null}
        <input type="hidden" name="publicId" value="" />
        <label className="block text-sm">
          <span className="font-semibold">Title</span>
          <input name="title" required className="mt-1 w-full rounded-xl border border-line px-3 py-2" />
        </label>
        <label className="block text-sm">
          <span className="font-semibold">Severity</span>
          <select name="severity" defaultValue="medium" className="mt-1 w-full rounded-xl border border-line px-3 py-2">
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </label>
        <label className="block text-sm">
          <span className="font-semibold">Status</span>
          <select name="status" defaultValue="open" className="mt-1 w-full rounded-xl border border-line px-3 py-2">
            <option value="open">Open</option>
            <option value="investigating">Investigating</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </label>
        <label className="block text-sm">
          <span className="font-semibold">Affected module</span>
          <input name="affectedModule" required defaultValue="platform" className="mt-1 w-full rounded-xl border border-line px-3 py-2" />
        </label>
        <label className="block text-sm">
          <span className="font-semibold">Description</span>
          <textarea name="description" rows={5} className="mt-1 w-full rounded-xl border border-line px-3 py-2" />
        </label>
        <button type="submit" className="rounded-(--radius-button) bg-blue px-5 py-2.5 text-sm font-semibold text-white">
          Save incident
        </button>
      </form>
    </main>
  );
}
