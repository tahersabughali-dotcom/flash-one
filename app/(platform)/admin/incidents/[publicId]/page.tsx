import { notFound } from "next/navigation";
import { requirePlatformAdmin } from "@/lib/server/auth";
import { getIncident } from "@/lib/server/platform/settings-queries";
import { INTEGRATION_PATHS } from "@/modules/integrations";
import { PageHeader } from "@/components/platform/PageHeader";
import { SectionPanel } from "@/components/platform/SectionPanel";
import { StatusBadge } from "@/components/platform/StatusBadge";
import { formatDisplayDateTime } from "@/lib/format/display";

export default async function Page({
  params,
}: {
  params: Promise<{ publicId: string }>;
}) {
  const { publicId } = await params;
  await requirePlatformAdmin(INTEGRATION_PATHS.incident(publicId));
  const incident = await getIncident(publicId);
  if (!incident) {
    notFound();
  }
  return (
    <main>
      <PageHeader
        eyebrow={incident.public_id}
        title={incident.title}
        description={`${incident.affected_module} · started ${formatDisplayDateTime(incident.started_at)}`}
        actions={<StatusBadge status={incident.status} label={incident.status.replace(/_/g, " ")} />}
      />
      <SectionPanel title="Details">
        <ul className="space-y-2 text-sm">
          <li>Severity: {incident.severity}</li>
          <li>Resolved: {incident.resolved_at ? formatDisplayDateTime(incident.resolved_at) : "—"}</li>
          <li>{incident.description || "No description."}</li>
        </ul>
      </SectionPanel>
    </main>
  );
}
