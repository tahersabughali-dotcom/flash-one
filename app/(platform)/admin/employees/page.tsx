import { requirePlatformAdmin } from "@/lib/server/auth";
import { listEmployees } from "@/lib/server/operations";
import { parseListPage } from "@/lib/server/pagination";
import { OPERATIONS_PATHS, PERSON_STATUS_LABELS } from "@/modules/operations";
import { OpsList } from "../ops-list";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  await requirePlatformAdmin(OPERATIONS_PATHS.employees);
  const page = parseListPage((await searchParams).page);
  const rows = await listEmployees(page);
  return (
    <OpsList
      eyebrow="People & network"
      title="Employees"
      description="Operational employee records. This is not payroll, and a record does not grant platform admin."
      createHref={OPERATIONS_PATHS.employeeNew}
      createLabel="New employee"
      emptyTitle="No employees"
      emptyDescription="Add an employee record when someone works at Flash One."
      page={page}
      items={rows.map((row) => ({
        href: OPERATIONS_PATHS.employee(row.publicId),
        publicId: row.publicId,
        title: row.title,
        status: row.status,
        statusLabel: PERSON_STATUS_LABELS[row.status as keyof typeof PERSON_STATUS_LABELS] ?? row.status,
        meta: row.meta,
      }))}
    />
  );
}
