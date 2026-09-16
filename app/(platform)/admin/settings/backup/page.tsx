import { requirePlatformAdmin } from "@/lib/server/auth";
import { getBackupReadiness } from "@/lib/server/platform/settings-queries";
import { SETTINGS_PATHS } from "@/modules/settings";
import { PageHeader } from "@/components/platform/PageHeader";
import { SectionPanel } from "@/components/platform/SectionPanel";

export default async function Page() {
  await requirePlatformAdmin(SETTINGS_PATHS.backup);
  const backup = await getBackupReadiness();
  return (
    <main>
      <PageHeader
        eyebrow="Settings"
        title="Backup readiness"
        description="Launch-readiness representation only. Do not fake backup success. Production backup/PITR remains Phase 5."
      />
      <SectionPanel title="Status">
        <ul className="space-y-2 text-sm">
          <li>Backup configured: {backup?.backup_configured ?? "unknown"}</li>
          <li>PITR configured: {backup?.pitr_configured ?? "unknown"}</li>
          <li>Last verified restore: {backup?.last_verified_restore ?? "unknown"}</li>
          <li className="text-muted">{backup?.notes ?? "Deferred to production launch readiness."}</li>
        </ul>
      </SectionPanel>
    </main>
  );
}
