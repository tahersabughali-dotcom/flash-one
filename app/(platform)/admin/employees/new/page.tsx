import { requirePlatformAdmin } from "@/lib/server/auth";
import { OPERATIONS_PATHS } from "@/modules/operations";
import { PageHeader } from "@/components/platform/PageHeader";
import { EmployeeForm } from "../../ops-forms";

export default async function Page() {
  await requirePlatformAdmin(OPERATIONS_PATHS.employeeNew);
  return (
    <main>
      <PageHeader eyebrow="People & network" title="New employee" description="Operational employee records. This is not payroll, and a record does not grant platform admin." />
      <EmployeeForm />
    </main>
  );
}
