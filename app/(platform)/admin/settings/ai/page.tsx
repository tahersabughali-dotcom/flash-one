import { requirePlatformAdmin } from "@/lib/server/auth";
import { listAiAdapters } from "@/lib/server/ai/providers";
import { describeAiToolBoundary } from "@/lib/server/ai/tools";
import { SETTINGS_PATHS } from "@/modules/settings";
import { PageHeader } from "@/components/platform/PageHeader";
import { SectionPanel } from "@/components/platform/SectionPanel";
import { StatusBadge } from "@/components/platform/StatusBadge";

export default async function Page() {
  await requirePlatformAdmin(SETTINGS_PATHS.ai);
  const adapters = listAiAdapters();
  const tools = describeAiToolBoundary();
  return (
    <main>
      <PageHeader
        eyebrow="Settings"
        title="AI"
        description="Assistive only. AI must not move money, issue refunds, approve payouts, modify ledger, grant admin, or send external messages."
      />
      <SectionPanel title="Providers">
        <ul className="space-y-3">
          {adapters.map((adapter) => (
            <li key={adapter.code} className="flex items-center justify-between gap-3 rounded-2xl border border-line bg-white px-4 py-3">
              <p className="font-semibold text-navy">{adapter.displayName}</p>
              <StatusBadge
                status={adapter.isConfigured() ? "configured" : "configuration_required"}
                label={adapter.isConfigured() ? "Configured" : "Requires setup"}
              />
            </li>
          ))}
        </ul>
      </SectionPanel>
      <SectionPanel title="Tool boundary">
        <p className="text-sm text-muted">{tools.note}</p>
        <p className="mt-2 text-sm">Allowlist: {tools.allowlist.join(", ")}</p>
      </SectionPanel>
    </main>
  );
}
