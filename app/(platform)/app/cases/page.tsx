import Link from "next/link";
import { requireCompletedOnboarding } from "@/lib/server/account/require-onboarding";
import { listSupportCases } from "@/lib/server/operations";
import { parseListPage } from "@/lib/server/pagination";
import { OPERATIONS_PATHS, CASE_STATUS_LABELS } from "@/modules/operations";
import { PageHeader } from "@/components/platform/PageHeader";
import { EmptyState } from "@/components/platform/EmptyState";
import { RecordCard } from "@/components/platform/RecordCard";
import { ListPager } from "@/components/platform/ListPager";

export default async function Page({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  await requireCompletedOnboarding(OPERATIONS_PATHS.customerCases);
  const page = parseListPage((await searchParams).page);
  const rows = await listSupportCases(page, true);
  return (
    <main>
      <PageHeader
        eyebrow="Support"
        title="Cases"
        description="Cases Flash One has made visible to you."
        actions={
          <Link
            href={OPERATIONS_PATHS.customerCaseNew}
            className="rounded-(--radius-button) bg-blue px-4 py-2 text-sm font-semibold text-white"
          >
            New case
          </Link>
        }
      />
      {rows.length === 0 ? (
        <EmptyState
          title="No cases"
          description="Visible support cases will appear here."
          actionHref={OPERATIONS_PATHS.customerCaseNew}
          actionLabel="Open a case"
        />
      ) : (
        <ul className="mt-8 space-y-3">
          {rows.map((row) => (
            <li key={row.public_id}>
              <RecordCard
                href={OPERATIONS_PATHS.customerCase(row.public_id)}
                reference={row.public_id}
                title={row.title}
                status={row.status}
                statusLabel={CASE_STATUS_LABELS[row.status as keyof typeof CASE_STATUS_LABELS] ?? row.status}
              />
            </li>
          ))}
        </ul>
      )}
      <ListPager page={page} itemCount={rows.length} />
    </main>
  );
}
