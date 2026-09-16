import { requirePlatformAdmin } from "@/lib/server/auth";
import { listContacts } from "@/lib/server/operations";
import { parseListPage } from "@/lib/server/pagination";
import { OPERATIONS_PATHS, CONTACT_STATUS_LABELS } from "@/modules/operations";
import { OpsList } from "../ops-list";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  await requirePlatformAdmin(OPERATIONS_PATHS.contacts);
  const page = parseListPage((await searchParams).page);
  const rows = await listContacts(page);
  return (
    <OpsList
      eyebrow="People & network"
      title="Contacts"
      description="Internal contact registry. Not a public directory."
      createHref={OPERATIONS_PATHS.contactNew}
      createLabel="New contact"
      emptyTitle="No contacts"
      emptyDescription="Add a contact when a real person is known for a customer organization, partner, or supplier."
      page={page}
      items={rows.map((row) => ({
        href: OPERATIONS_PATHS.contact(row.publicId),
        publicId: row.publicId,
        title: row.title,
        status: row.status,
        statusLabel: CONTACT_STATUS_LABELS[row.status as keyof typeof CONTACT_STATUS_LABELS] ?? row.status,
        meta: row.meta,
      }))}
    />
  );
}
