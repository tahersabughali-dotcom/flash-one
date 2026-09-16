import { requirePlatformAdmin } from "@/lib/server/auth";
import { listAdminCustomers } from "@/lib/server/admin/queries";
import { parseListPage } from "@/lib/server/pagination";
import { ListPager } from "@/components/platform/ListPager";
import { PageHeader } from "@/components/platform/PageHeader";
import { EmptyState } from "@/components/platform/EmptyState";
import { RecordCard } from "@/components/platform/RecordCard";
import { ADMIN_PATHS } from "@/modules/account";

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  await requirePlatformAdmin(ADMIN_PATHS.customers);
  const page = parseListPage((await searchParams).page);
  const customers = await listAdminCustomers(page);

  return (
    <main>
      <PageHeader
        eyebrow="Directory"
        title="Customers"
        description="Individual customer relationships. Organizations and developers are listed separately."
      />
      {customers.length === 0 ? (
        <EmptyState
          title="No individual customers"
          description="Individual relationships appear here after onboarding."
        />
      ) : (
        <ul className="mt-8 space-y-3">
          {customers.map((customer) => (
            <li key={customer.publicId}>
              <RecordCard
                href={ADMIN_PATHS.customer(customer.publicId)}
                reference={customer.publicId}
                title={customer.displayName}
                meta={`${customer.requestCount} requests · ${customer.projectCount} projects`}
              />
            </li>
          ))}
        </ul>
      )}
      <ListPager page={page} itemCount={customers.length} />
    </main>
  );
}
