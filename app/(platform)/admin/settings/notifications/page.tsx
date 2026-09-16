import { requirePlatformAdmin } from "@/lib/server/auth";
import { listNotificationChannels } from "@/lib/server/platform/settings-queries";
import { SETTINGS_PATHS } from "@/modules/settings";
import { PageHeader } from "@/components/platform/PageHeader";
import { SectionPanel } from "@/components/platform/SectionPanel";
import { StatusBadge } from "@/components/platform/StatusBadge";

export default async function Page() {
  await requirePlatformAdmin(SETTINGS_PATHS.notifications);
  const channels = await listNotificationChannels();
  return (
    <main>
      <PageHeader
        eyebrow="Settings"
        title="Notifications"
        description="Channel readiness. Only in-app is operational unless a real provider is configured. Do not fake sent status."
      />
      <SectionPanel title="Channels">
        <ul className="space-y-3">
          {channels.map((channel) => (
            <li key={channel.code} className="rounded-2xl border border-line bg-white px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-navy">{channel.display_name}</p>
                  <p className="mt-1 text-sm text-muted">{channel.notes}</p>
                </div>
                <StatusBadge status={channel.operational_state} label={channel.operational_state.replace(/_/g, " ")} />
              </div>
            </li>
          ))}
        </ul>
      </SectionPanel>
    </main>
  );
}
