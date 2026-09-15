"use client";

import { useActionState } from "react";
import {
  updateDeveloperProfileAction,
  type RelationshipFormState,
} from "@/app/(platform)/app/relationships/actions";

const initialState: RelationshipFormState = { error: null };

export function DeveloperProfileForm({
  displayName,
  headline,
  bio,
  availabilityStatus,
  country,
  timezone,
  skills,
  links,
}: {
  displayName: string;
  headline: string | null;
  bio: string | null;
  availabilityStatus: string;
  country: string | null;
  timezone: string | null;
  skills: string[];
  links: Array<{ label: string; url: string }>;
}) {
  const [state, action, pending] = useActionState(updateDeveloperProfileAction, initialState);
  const linkRows = [...links, { label: "", url: "" }, { label: "", url: "" }].slice(0, 8);

  return (
    <form action={action} className="mt-8 space-y-4">
      <label className="block">
        <span className="text-sm font-semibold">Display name</span>
        <input name="displayName" defaultValue={displayName} required maxLength={120} className="mt-2 w-full rounded-2xl border border-line px-4 py-3" />
      </label>
      <label className="block">
        <span className="text-sm font-semibold">Headline</span>
        <input name="headline" defaultValue={headline ?? ""} maxLength={160} className="mt-2 w-full rounded-2xl border border-line px-4 py-3" />
      </label>
      <label className="block">
        <span className="text-sm font-semibold">Bio</span>
        <textarea name="bio" defaultValue={bio ?? ""} rows={4} maxLength={1000} className="mt-2 w-full rounded-2xl border border-line px-4 py-3" />
      </label>
      <label className="block">
        <span className="text-sm font-semibold">Availability</span>
        <select name="availabilityStatus" defaultValue={availabilityStatus} className="mt-2 w-full rounded-2xl border border-line px-4 py-3">
          <option value="available">Available</option>
          <option value="limited">Limited</option>
          <option value="unavailable">Unavailable</option>
        </select>
      </label>
      <label className="block">
        <span className="text-sm font-semibold">Country</span>
        <input name="country" defaultValue={country ?? ""} maxLength={80} className="mt-2 w-full rounded-2xl border border-line px-4 py-3" />
      </label>
      <label className="block">
        <span className="text-sm font-semibold">Timezone</span>
        <input name="timezone" defaultValue={timezone ?? ""} maxLength={80} className="mt-2 w-full rounded-2xl border border-line px-4 py-3" />
      </label>
      <label className="block">
        <span className="text-sm font-semibold">Skills</span>
        <textarea
          name="skills"
          defaultValue={skills.join(", ")}
          rows={3}
          className="mt-2 w-full rounded-2xl border border-line px-4 py-3"
          placeholder="Comma-separated skills"
        />
      </label>
      <div>
        <p className="text-sm font-semibold">Portfolio links</p>
        <p className="mt-1 text-xs text-muted">https:// only. No embeds.</p>
        {linkRows.map((link, index) => (
          <div key={`${link.url}-${index}`} className="mt-2 grid gap-2 sm:grid-cols-2">
            <input name="linkLabel" defaultValue={link.label} placeholder="Label" className="rounded-2xl border border-line px-4 py-3" />
            <input name="linkUrl" defaultValue={link.url} placeholder="https://" className="rounded-2xl border border-line px-4 py-3" />
          </div>
        ))}
      </div>
      {state.error ? <p className="text-sm font-medium text-red-700">{state.error}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="rounded-(--radius-button) bg-blue px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save profile"}
      </button>
    </form>
  );
}
