import Link from "next/link";
import { requirePlatformAdmin } from "@/lib/server/auth";
import { listAdminAutomationRules } from "@/lib/server/platform/queries";
import { parseListPage } from "@/lib/server/pagination";
import { ListPager } from "@/components/platform/ListPager";
import { PageHeader } from "@/components/platform/PageHeader";
import { EmptyState } from "@/components/platform/EmptyState";
import { RecordCard } from "@/components/platform/RecordCard";
import { AUTOMATION_PATHS } from "@/modules/automations";

export default async function AdminAutomationsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  await requirePlatformAdmin(AUTOMATION_PATHS.admin);
  const page = parseListPage((await searchParams).page);
  const rules = await listAdminAutomationRules(page);
  return (
    <main>
      <PageHeader
        eyebrow="Operations"
        title="Automations"
        description="Allowlisted internal reactions. Failure does not change payments, invoices, or orders."
        actions={
          <Link
            href={AUTOMATION_PATHS.adminNew}
            className="rounded-(--radius-button) bg-blue px-5 py-2.5 text-sm font-semibold text-white"
          >
            New rule
          </Link>
        }
      />
      {rules.length === 0 ? (
        <EmptyState
          title="No automation rules"
          description="Allowlisted rules and their runs appear here. Arbitrary code execution is not available."
        />
      ) : (
        <ul className="mt-8 space-y-3">
          {rules.map((rule) => (
            <li key={rule.public_id}>
              <RecordCard
                href={AUTOMATION_PATHS.adminDetail(rule.public_id)}
                title={rule.name}
                status={rule.enabled ? "enabled" : "disabled"}
                statusLabel={rule.enabled ? "Enabled" : "Disabled"}
                meta={`${rule.event_type} → ${rule.action_type}`}
              />
            </li>
          ))}
        </ul>
      )}
      <ListPager page={page} itemCount={rules.length} />
    </main>
  );
}
