import { requirePlatformAdmin } from "@/lib/server/auth";
import { listAdminOrganizations } from "@/lib/server/admin/queries";
import { parseListPage } from "@/lib/server/pagination";
import { ListPager } from "@/components/platform/ListPager";
import { PageHeader } from "@/components/platform/PageHeader";
import { EmptyState } from "@/components/platform/EmptyState";
import { RecordCard } from "@/components/platform/RecordCard";
import { ADMIN_PATHS } from "@/modules/account";

export default async function AdminBusinessesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  await requirePlatformAdmin(ADMIN_PATHS.businesses);
  const page = parseListPage((await searchParams).page);
  const businesses = await listAdminOrganizations(page);
  return (
    <main>
      <PageHeader
        eyebrow="Directory"
        title="Organizations"
        description="Organization records stay separate from individual customers and developers."
      />
      {businesses.length === 0 ? (
        <EmptyState
          title="No organizations yet"
          description="Organizations appear here after a business relationship is created."
        />
      ) : (
        <ul className="mt-8 space-y-3">
          {businesses.map((business) => (
            <li key={business.publicId}>
              <RecordCard
                href={ADMIN_PATHS.business(business.publicId)}
                reference={business.publicId}
                title={business.name}
                meta={`${business.memberCount} members`}
              />
            </li>
          ))}
        </ul>
      )}
      <ListPager page={page} itemCount={businesses.length} />
    </main>
  );
}
