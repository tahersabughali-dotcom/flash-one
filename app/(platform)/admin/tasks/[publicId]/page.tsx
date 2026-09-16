import { notFound } from "next/navigation";
import { requirePlatformAdmin } from "@/lib/server/auth";
import { getOperationalTask, optionLists } from "@/lib/server/operations";
import { OPERATIONS_PATHS } from "@/modules/operations";
import { PageHeader } from "@/components/platform/PageHeader";
import { StatusBadge } from "@/components/platform/StatusBadge";
import { OperationalTaskForm } from "../../ops-forms";

export default async function Page({ params }: { params: Promise<{ publicId: string }> }) {
  const { publicId } = await params;
  await requirePlatformAdmin(OPERATIONS_PATHS.task(publicId));
  const [record, options] = await Promise.all([getOperationalTask(publicId), optionLists()]);
  if (!record) notFound();
  return (
    <main>
      <PageHeader
        eyebrow={record.public_id}
        title={record.title}
        actions={<StatusBadge status={record.status} label={record.status.replace(/_/g, " ")} />}
      />
      <OperationalTaskForm record={record} employees={options.employees} />
    </main>
  );
}
