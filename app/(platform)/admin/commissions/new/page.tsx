import { requirePlatformAdmin } from "@/lib/server/auth";
import { OPERATIONS_PATHS } from "@/modules/operations";
import { PageHeader } from "@/components/platform/PageHeader";
import { CommissionForm } from "../../ops-forms";

export default async function Page() {
  await requirePlatformAdmin(OPERATIONS_PATHS.commissionNew);
  return (
    <main>
      <PageHeader eyebrow="Finance" title="New commission" description="Commission must be explicit. It is not profit." />
      <CommissionForm />
    </main>
  );
}
