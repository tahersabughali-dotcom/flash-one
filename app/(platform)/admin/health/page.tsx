import { requirePlatformAdmin } from "@/lib/server/auth";
import { getOperationalHealth } from "@/lib/server/platform/health";
import { OPERATIONS_PATHS } from "@/modules/operations";
import { PageHeader } from "@/components/platform/PageHeader";
import { SectionPanel } from "@/components/platform/SectionPanel";

export default async function Page() {
  await requirePlatformAdmin(OPERATIONS_PATHS.health);
  const health = await getOperationalHealth();
  return (
    <main>
      <PageHeader
        eyebrow="System"
        title="Health"
        description="Configuration and application connectivity. This is not provider uptime and not a backup proof."
      />
      <SectionPanel title="Connectivity">
        <ul className="space-y-2 text-sm">
          <li>Database: {health.databaseConnected ? "connected" : "unavailable"}</li>
          <li>Failed automations: {health.failedAutomationCount}</li>
          <li>Payments needing review: {health.reviewRequiredPaymentCount}</li>
          <li>
            Providers:{" "}
            {health.providers
              .map(
                (provider) =>
                  `${provider.code} ${provider.checkoutReady ? "checkout ready" : provider.configured ? "configured" : "not configured"}`,
              )
              .join(" · ") || "none"}
          </li>
          <li>Backups / PITR: deferred until production launch readiness</li>
        </ul>
      </SectionPanel>
    </main>
  );
}
