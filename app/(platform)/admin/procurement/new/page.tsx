import { requirePlatformAdmin } from "@/lib/server/auth";
import { optionLists } from "@/lib/server/operations";
import { OPERATIONS_PATHS } from "@/modules/operations";
import { PageHeader } from "@/components/platform/PageHeader";
import { ProcurementForm } from "../../ops-forms";

export default async function Page() {
  await requirePlatformAdmin(OPERATIONS_PATHS.procurementNew);
  const options = await optionLists();
  return (
    <main>
      <PageHeader
        eyebrow="Finance"
        title="New purchase"
        description="Flash One buying something. This is not customer revenue."
      />
      <ProcurementForm suppliers={options.suppliers} />
    </main>
  );
}
