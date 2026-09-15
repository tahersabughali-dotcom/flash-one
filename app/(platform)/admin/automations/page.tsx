import Link from "next/link";
import { requirePlatformAdmin } from "@/lib/server/auth";
import { logoutAction } from "@/app/(auth)/actions";
import { listAdminAutomationRules } from "@/lib/server/platform/queries";
import { parseListPage } from "@/lib/server/pagination";
import { ListPager } from "@/components/platform/ListPager";
import { AUTOMATION_PATHS } from "@/modules/automations";

export default async function AdminAutomationsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const access = await requirePlatformAdmin(AUTOMATION_PATHS.admin);
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
  const page = parseListPage((await searchParams).page);
  const rules = await listAdminAutomationRules(page);
  return (
    <main>
      <h1 className="text-3xl font-extrabold tracking-[-0.04em] text-navy-deep">Automations</h1>
      <p className="mt-4 text-[15px] text-muted">
        Allowlisted internal reactions. Failure does not change payments, invoices, or orders.
      </p>
      {rules.length === 0 ? (
        <p className="mt-8 text-[15px] text-muted">No automation runs or rules yet.</p>
      ) : (
        <ul className="mt-8 space-y-3">
          {rules.map((rule) => (
            <li key={rule.public_id}>
              <Link href={AUTOMATION_PATHS.adminDetail(rule.public_id)} className="block rounded-(--radius-panel) border border-white/70 bg-white/80 p-5 shadow-(--shadow-soft)">
                <p className="font-extrabold text-navy-deep">{rule.name}</p>
                <p className="text-sm text-muted">{rule.event_type} → {rule.action_type} · {rule.enabled ? "Enabled" : "Disabled"}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
      <ListPager page={page} itemCount={rules.length} />
    </main>
  );
}
