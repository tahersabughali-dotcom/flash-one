import { requirePlatformAdmin } from "@/lib/server/auth";
import { listFeatureFlags } from "@/lib/server/platform/settings-queries";
import { SETTINGS_PATHS } from "@/modules/settings";
import { PageHeader } from "@/components/platform/PageHeader";
import { SectionPanel } from "@/components/platform/SectionPanel";
import { setFeatureFlagAction } from "../../settings-actions";

export default async function Page() {
  await requirePlatformAdmin(SETTINGS_PATHS.features);
  const flags = await listFeatureFlags();
  return (
    <main>
      <PageHeader
        eyebrow="Settings"
        title="Feature flags"
        description="UI availability only. Disabling a flag is not a security boundary. Authorization remains explicit."
      />
      <SectionPanel title="Flags">
        <ul className="space-y-3">
          {flags.map((flag) => (
            <li key={flag.code} className="rounded-2xl border border-line bg-white px-4 py-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-navy">{flag.label}</p>
                  <p className="mt-1 text-sm text-muted">{flag.description}</p>
                  <p className="mt-1 text-xs text-muted">Scope: {flag.environment_scope}</p>
                </div>
                <form action={setFeatureFlagAction}>
                  <input type="hidden" name="code" value={flag.code} />
                  <input type="hidden" name="enabled" value={flag.enabled ? "false" : "true"} />
                  <button type="submit" className="rounded-(--radius-button) border border-line px-3 py-1.5 text-sm font-semibold">
                    {flag.enabled ? "Enabled" : "Disabled"}
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      </SectionPanel>
    </main>
  );
}
