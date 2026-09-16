import { requirePlatformAdmin } from "@/lib/server/auth";
import { listOperationalTasks } from "@/lib/server/operations";
import { parseListPage } from "@/lib/server/pagination";
import { OPERATIONS_PATHS } from "@/modules/operations";
import { TASK_STATUS_LABELS } from "@/modules/tasks";
import { OpsList } from "../ops-list";

export default async function Page({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  await requirePlatformAdmin(OPERATIONS_PATHS.tasks);
  const page = parseListPage((await searchParams).page);
  const rows = await listOperationalTasks(page);
  return (
    <OpsList
      eyebrow="Operations"
      title="Internal tasks"
      description="Operational follow-up. These tasks are not customer-visible. Project tasks remain on each project."
      createHref={OPERATIONS_PATHS.taskNew}
      createLabel="New internal task"
      emptyTitle="No internal tasks"
      emptyDescription="Create an internal task for invoice follow-up, a case, or operations work."
      page={page}
      items={rows.map((row) => ({
        href: OPERATIONS_PATHS.task(row.public_id),
        publicId: row.public_id,
        title: row.title,
        status: row.status,
        statusLabel: TASK_STATUS_LABELS[row.status as keyof typeof TASK_STATUS_LABELS] ?? row.status,
        meta: row.priority,
      }))}
    />
  );
}
