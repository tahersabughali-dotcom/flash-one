import { notFound } from "next/navigation";
import { requirePlatformAdmin } from "@/lib/server/auth";
import { getAdminAutomationRule } from "@/lib/server/platform/queries";
import { AUTOMATION_PATHS } from "@/modules/automations";
import { PageHeader } from "@/components/platform/PageHeader";
import { StatusBadge } from "@/components/platform/StatusBadge";
import { formatDisplayDateTime } from "@/lib/format/display";
import { adminSetAutomationEnabledAction } from "../../store/actions";

export default async function AdminAutomationDetailPage({
  params,
}: {
  params: Promise<{ publicId: string }>;
}) {
  const { publicId } = await params;
  await requirePlatformAdmin(AUTOMATION_PATHS.adminDetail(publicId));
  const rule = await getAdminAutomationRule(publicId);
  if (!rule) {
    notFound();
  }
  return (
    <main>
      <PageHeader
        eyebrow={rule.public_id}
        title={rule.name}
        description={`${rule.event_type} → ${rule.action_type}`}
        actions={
          <StatusBadge
            status={rule.enabled ? "enabled" : "disabled"}
            label={rule.enabled ? "Enabled" : "Disabled"}
          />
        }
      />
      <form action={adminSetAutomationEnabledAction} className="mt-6">
        <input type="hidden" name="publicId" value={rule.public_id} />
        <input type="hidden" name="enabled" value={rule.enabled ? "false" : "true"} />
        <button type="submit" className="rounded-(--radius-button) border border-line bg-white px-4 py-2 text-sm font-semibold">
          {rule.enabled ? "Disable" : "Enable"}
        </button>
      </form>
      <h2 className="mt-10 text-lg font-extrabold">Recent runs</h2>
      {rule.runs.length === 0 ? (
        <p className="mt-4 text-[15px] text-muted">No automation runs.</p>
      ) : (
        <ul className="mt-4 space-y-2 text-sm">
          {rule.runs.map((run) => (
            <li key={run.public_id} className="rounded-2xl border border-line bg-white px-4 py-3">
              <StatusBadge status={run.status} label={run.status} />
              {run.error_summary ? ` · ${run.error_summary}` : ""}
              {run.started_at ? ` · ${formatDisplayDateTime(run.started_at)}` : ""}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
