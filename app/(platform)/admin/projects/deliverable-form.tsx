"use client";

import { useActionState } from "react";
import type { ProjectFile } from "@/lib/server/files";
import {
  adminCreateDeliverableAction,
  type AdminProjectFormState,
} from "./actions";

const initialState: AdminProjectFormState = { error: null };

export function AdminDeliverableForm({
  projectPublicId,
  files,
}: {
  projectPublicId: string;
  files: ProjectFile[];
}) {
  const [state, formAction, pending] = useActionState(
    adminCreateDeliverableAction,
    initialState,
  );
  const customerFiles = files.filter((file) => file.visibility === "customer");

  return (
    <form action={formAction} className="mt-4 space-y-3">
      <input type="hidden" name="projectPublicId" value={projectPublicId} />
      <input
        name="title"
        required
        maxLength={160}
        placeholder="Deliverable title"
        className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-[15px] outline-none"
      />
      <textarea
        name="description"
        rows={3}
        maxLength={4000}
        placeholder="What is being delivered?"
        className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-[15px] outline-none"
      />
      {customerFiles.length > 0 ? (
        <fieldset className="space-y-2">
          <legend className="text-sm font-semibold text-navy-deep">Attach files</legend>
          {customerFiles.map((file) => (
            <label key={file.publicId} className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="filePublicId" value={file.publicId} />
              {file.originalFilename}
            </label>
          ))}
        </fieldset>
      ) : (
        <p className="text-sm text-muted">Upload a customer-visible file first to attach it.</p>
      )}
      {state.error ? <p className="text-sm font-medium text-red-700">{state.error}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center justify-center rounded-(--radius-button) bg-blue px-5 py-2.5 text-sm font-semibold text-white shadow-(--shadow-button) disabled:opacity-60"
      >
        {pending ? "Submitting…" : "Submit deliverable"}
      </button>
    </form>
  );
}
