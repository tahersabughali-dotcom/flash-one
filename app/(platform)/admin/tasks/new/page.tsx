import { requirePlatformAdmin } from "@/lib/server/auth";
import { optionLists } from "@/lib/server/operations";
import { OPERATIONS_PATHS } from "@/modules/operations";
import { PageHeader } from "@/components/platform/PageHeader";
import { OperationalTaskForm } from "../../ops-forms";

export default async function Page() {
  await requirePlatformAdmin(OPERATIONS_PATHS.taskNew);
  const options = await optionLists();
  return (
    <main>
      <PageHeader eyebrow="Operations" title="New internal task" description="Internal tasks are never customer-visible." />
      <OperationalTaskForm employees={options.employees} />
    </main>
  );
}
