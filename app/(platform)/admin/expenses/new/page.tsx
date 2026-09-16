import { requirePlatformAdmin } from "@/lib/server/auth";
import { optionLists } from "@/lib/server/operations";
import { OPERATIONS_PATHS } from "@/modules/operations";
import { PageHeader } from "@/components/platform/PageHeader";
import { ExpenseForm } from "../../ops-forms";

export default async function Page() {
  await requirePlatformAdmin(OPERATIONS_PATHS.expenseNew);
  const options = await optionLists();
  return (
    <main>
      <PageHeader eyebrow="Finance" title="New expense" description="Operational expenses are separate from customer invoices." />
      <ExpenseForm options={options} />
    </main>
  );
}
