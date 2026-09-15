import { notFound } from "next/navigation";
import { requirePlatformAdmin } from "@/lib/server/auth";
import { logoutAction } from "@/app/(auth)/actions";
import { getAdminAutomationRule } from "@/lib/server/platform/queries";
import { AUTOMATION_PATHS } from "@/modules/automations";
import { adminSetAutomationEnabledAction } from "../../store/actions";

export default async function AdminAutomationDetailPage({
  params,
}: {
  params: Promise<{ publicId: string }>;
}) {
  const { publicId } = await params;
  const access = await requirePlatformAdmin(AUTOMATION_PATHS.adminDetail(publicId));
  if (!access.authorized) {
    return (
      <main>
        <h1 className="text-3xl font-extrabold text-navy-deep">Not authorized</h1>
        <form action={logoutAction} className="mt-8">
          <button type="submit" className="rounded-(--radius-button) border border-line bg-white px-5 py-2.5 text-sm font-semibold">Sign out</button>
        </form>
      </main>
    );
  }
  const rule = await getAdminAutomationRule(publicId);
  if (!rule) {
    notFound();
  }
  return (
    <main>
      <h1 className="text-3xl font-extrabold tracking-[-0.04em] text-navy-deep">{rule.name}</h1>
      <p className="mt-3 text-[15px] text-muted">{rule.event_type} → {rule.action_type}</p>
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
            <li key={run.public_id}>
              {run.status}
              {run.error_summary ? ` · ${run.error_summary}` : ""}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
