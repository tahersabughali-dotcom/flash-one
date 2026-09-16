import { notFound } from "next/navigation";
import { requirePlatformAdmin } from "@/lib/server/auth";
import { getIntegrationView } from "@/lib/server/integrations/registry";
import { listUsdtNetworkSettings } from "@/lib/server/platform/settings-queries";
import { CAPABILITY_LABELS, INTEGRATION_PATHS } from "@/modules/integrations";
import { PageHeader } from "@/components/platform/PageHeader";
import { SectionPanel } from "@/components/platform/SectionPanel";
import { StatusBadge } from "@/components/platform/StatusBadge";
import { setIntegrationStateAction } from "../../settings-actions";

export default async function Page({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  await requirePlatformAdmin(INTEGRATION_PATHS.detail(code));
  const row = await getIntegrationView(code);
  if (!row) {
    notFound();
  }
  const usdt = code === "usdt" ? await listUsdtNetworkSettings() : [];
  const caps = Object.entries(row.capabilities)
    .filter(([, enabled]) => enabled)
    .map(([key]) => CAPABILITY_LABELS[key] ?? key);
  return (
    <main>
      <PageHeader
        eyebrow={row.category}
        title={row.displayName}
        description={row.notes ?? "Integration metadata only. Secrets stay in environment storage."}
        actions={
          <StatusBadge status={String(row.displayState)} label={row.displayStateLabel} />
        }
      />
      <SectionPanel title="Configuration">
        <ul className="space-y-2 text-sm">
          <li>Runtime secrets present: {row.runtimeConfigured ? "yes (values hidden)" : "no"}</li>
          <li>Environment label: {row.environmentLabel}</li>
          <li>Requirements: {row.configurationRequirements}</li>
          <li>Capabilities: {caps.length > 0 ? caps.join(", ") : "none claimed"}</li>
        </ul>
        <form action={setIntegrationStateAction} className="mt-4 flex flex-wrap gap-2">
          <input type="hidden" name="code" value={row.code} />
          {(["configuration_required", "disabled", "maintenance", "unavailable"] as const).map((state) => (
            <button
              key={state}
              type="submit"
              name="state"
              value={state}
              className="rounded-(--radius-button) border border-line px-3 py-1.5 text-sm font-semibold"
            >
              Mark {state.replace(/_/g, " ")}
            </button>
          ))}
        </form>
      </SectionPanel>
      {usdt.length > 0 ? (
        <SectionPanel title="USDT networks">
          <ul className="space-y-2 text-sm">
            {usdt.map((network) => (
              <li key={network.network}>
                {network.network}: {network.asset}, {network.decimals} decimals, confirmations{" "}
                {network.confirmation_requirement}, wallet enabled {String(network.wallet_enabled)}, address
                configured {String(network.address_configured)}
              </li>
            ))}
          </ul>
        </SectionPanel>
      ) : null}
    </main>
  );
}
