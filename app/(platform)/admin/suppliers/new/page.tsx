import { requirePlatformAdmin } from "@/lib/server/auth";
import { OPERATIONS_PATHS } from "@/modules/operations";
import { PageHeader } from "@/components/platform/PageHeader";
import { SupplierForm } from "../../ops-forms";

export default async function Page() {
  await requirePlatformAdmin(OPERATIONS_PATHS.supplierNew);
  return (
    <main>
      <PageHeader eyebrow="People & network" title="New supplier" description="Suppliers Flash One buys from. Separate from customers and partners." />
      <SupplierForm />
    </main>
  );
}
