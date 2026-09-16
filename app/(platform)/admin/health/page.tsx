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
        description="Truthful internal states. Configured is not healthy. This is not provider uptime and not a backup proof."
      />
      <SectionPanel title="Connectivity">
        <ul className="space-y-2 text-sm">
          <li>Database: {health.databaseConnected ? "connected" : "unavailable"}</li>
          <li>Failed automations: {health.failedAutomationCount}</li>
          <li>Payments needing review: {health.reviewRequiredPaymentCount}</li>
          <li>AI configured: {health.aiConfigured ? "yes" : "no"}</li>
          <li>Email configured: {health.emailConfigured ? "yes" : "no"}</li>
          <li>Payment providers with secrets present: {health.paymentProvidersConfiguredCount}</li>
          <li>Production environment: {health.productionEnvironment}</li>
          <li>
            Backup configured: {health.backupConfigured} · PITR: {health.pitrConfigured} · Last
            verified restore: {health.lastVerifiedRestore}
          </li>
          <li>Backups / PITR work: deferred until production launch readiness</li>
        </ul>
      </SectionPanel>
      <SectionPanel title="Integrations">
        <ul className="space-y-2 text-sm">
          {health.integrations.length === 0 ? (
            <li>No integration rows visible.</li>
          ) : (
            health.integrations.map((row) => (
              <li key={row.code}>
                {row.code}: {row.displayStateLabel}
              </li>
            ))
          )}
        </ul>
      </SectionPanel>
      <SectionPanel title="Payment providers">
        <ul className="space-y-2 text-sm">
          {health.providers.map((provider) => (
            <li key={provider.code}>
              {provider.code}:{" "}
              {provider.checkoutReady
                ? "checkout ready"
                : provider.configured
                  ? "configured"
                  : "not configured"}
            </li>
          ))}
        </ul>
      </SectionPanel>
    </main>
  );
}
