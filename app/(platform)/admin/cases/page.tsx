import { requirePlatformAdmin } from "@/lib/server/auth";
import { listSupportCases } from "@/lib/server/operations";
import { parseListPage } from "@/lib/server/pagination";
import { OPERATIONS_PATHS, CASE_STATUS_LABELS } from "@/modules/operations";
import { OpsList } from "../ops-list";

export default async function Page({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  await requirePlatformAdmin(OPERATIONS_PATHS.cases);
  const page = parseListPage((await searchParams).page);
  const rows = await listSupportCases(page);
  return (
    <OpsList
      eyebrow="Operations"
      title="Cases"
      description="Lightweight support cases. Internal notes stay internal even when a case is customer-visible."
      createHref={OPERATIONS_PATHS.caseNew}
      createLabel="New case"
      emptyTitle="No cases"
      emptyDescription="Create a case for technical support, billing, or a general operational request."
      page={page}
      items={rows.map((row) => ({
        href: OPERATIONS_PATHS.caseDetail(row.public_id),
        publicId: row.public_id,
        title: row.title,
        status: row.status,
        statusLabel: CASE_STATUS_LABELS[row.status as keyof typeof CASE_STATUS_LABELS] ?? row.status,
        meta: row.case_type,
      }))}
    />
  );
}
