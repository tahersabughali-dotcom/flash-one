"use client";

import { useActionState } from "react";
import { createImportBatchAction, type SettingsFormState } from "../../settings-actions";

const initial: SettingsFormState = { error: null };

export default function Page() {
  const [state, action] = useActionState(createImportBatchAction, initial);
  return (
    <main>
      <h1 className="text-3xl font-extrabold text-navy">New import</h1>
      <p className="mt-2 max-w-2xl text-[15px] text-muted">
        Bank and provider transaction files can be previewed but cannot become sales or payments.
      </p>
      <form action={action} className="mt-8 max-w-xl space-y-4">
        {state.error ? <p className="text-sm text-red-700">{state.error}</p> : null}
        <label className="block text-sm">
          <span className="font-semibold">Type</span>
          <select name="importType" className="mt-1 w-full rounded-xl border border-line px-3 py-2" defaultValue="csv_generic">
            <option value="csv_generic">CSV generic</option>
            <option value="csv_contacts">CSV contacts</option>
            <option value="excel_placeholder">Excel placeholder</option>
            <option value="bank_statement">Bank statement (preview only)</option>
            <option value="provider_transactions">Provider transactions (preview only)</option>
          </select>
        </label>
        <label className="block text-sm">
          <span className="font-semibold">Filename</span>
          <input name="filename" className="mt-1 w-full rounded-xl border border-line px-3 py-2" />
        </label>
        <label className="block text-sm">
          <span className="font-semibold">Rows JSON</span>
          <textarea
            name="rowsJson"
            rows={8}
            defaultValue='[{"values":{"name":"Example"},"validation_status":"pending"}]'
            className="mt-1 w-full rounded-xl border border-line px-3 py-2 font-mono text-xs"
          />
        </label>
        <button type="submit" className="rounded-(--radius-button) bg-blue px-5 py-2.5 text-sm font-semibold text-white">
          Create import preview
        </button>
      </form>
    </main>
  );
}
