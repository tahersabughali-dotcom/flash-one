"use client";

import { useActionState } from "react";
import {
  AUTOMATION_ACTIONS,
  AUTOMATION_ACTION_LABELS,
  AUTOMATION_EVENT_TYPES,
  AUTOMATION_EVENT_LABELS,
} from "@/modules/automations/constants";
import { upsertAutomationRuleAction, type SettingsFormState } from "../../settings-actions";

const initial: SettingsFormState = { error: null };

export default function Page() {
  const [state, action] = useActionState(upsertAutomationRuleAction, initial);
  return (
    <main>
      <h1 className="text-3xl font-extrabold text-navy">New automation rule</h1>
      <p className="mt-2 max-w-2xl text-[15px] text-muted">
        Allowlisted actions only. Automation cannot move money, run SQL, or call arbitrary HTTP.
      </p>
      <form action={action} className="mt-8 max-w-xl space-y-4">
        {state.error ? <p className="text-sm text-red-700">{state.error}</p> : null}
        <input type="hidden" name="publicId" value="" />
        <label className="block text-sm">
          <span className="font-semibold">Name</span>
          <input name="name" required className="mt-1 w-full rounded-xl border border-line px-3 py-2" />
        </label>
        <label className="block text-sm">
          <span className="font-semibold">Trigger</span>
          <select name="eventType" className="mt-1 w-full rounded-xl border border-line px-3 py-2">
            {AUTOMATION_EVENT_TYPES.map((eventType) => (
              <option key={eventType} value={eventType}>
                {AUTOMATION_EVENT_LABELS[eventType]}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          <span className="font-semibold">Action</span>
          <select name="actionType" className="mt-1 w-full rounded-xl border border-line px-3 py-2">
            {AUTOMATION_ACTIONS.filter((actionType) => actionType !== "development_fail").map(
              (actionType) => (
                <option key={actionType} value={actionType}>
                  {AUTOMATION_ACTION_LABELS[actionType]}
                </option>
              ),
            )}
          </select>
        </label>
        <label className="block text-sm">
          <span className="font-semibold">Title</span>
          <input name="title" className="mt-1 w-full rounded-xl border border-line px-3 py-2" />
        </label>
        <label className="block text-sm">
          <span className="font-semibold">Body</span>
          <textarea name="body" rows={4} className="mt-1 w-full rounded-xl border border-line px-3 py-2" />
        </label>
        <label className="inline-flex items-center gap-2 text-sm font-semibold">
          <input type="checkbox" name="enabled" value="true" />
          Enable rule
        </label>
        <button type="submit" className="block rounded-(--radius-button) bg-blue px-5 py-2.5 text-sm font-semibold text-white">
          Save rule
        </button>
      </form>
    </main>
  );
}
