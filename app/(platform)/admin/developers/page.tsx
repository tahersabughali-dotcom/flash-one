import { requirePlatformAdmin } from "@/lib/server/auth";
import { listAdminDevelopers } from "@/lib/server/admin/queries";
import { parseListPage } from "@/lib/server/pagination";
import { ListPager } from "@/components/platform/ListPager";
import { PageHeader } from "@/components/platform/PageHeader";
import { EmptyState } from "@/components/platform/EmptyState";
import { RecordCard } from "@/components/platform/RecordCard";
import { ADMIN_PATHS } from "@/modules/account";

export default async function AdminDevelopersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  await requirePlatformAdmin(ADMIN_PATHS.developers);
  const page = parseListPage((await searchParams).page);
  const developers = await listAdminDevelopers(page);
  return (
    <main>
      <PageHeader
        eyebrow="Directory"
        title="Developers"
        description="Developer profiles and assignment targets. This is not payroll."
      />
      {developers.length === 0 ? (
        <EmptyState
          title="No developer profiles yet"
          description="Developer profiles appear here after a developer relationship is created."
        />
      ) : (
        <ul className="mt-8 space-y-3">
          {developers.map((developer) => (
            <li key={developer.publicId}>
              <RecordCard
                href={ADMIN_PATHS.developer(developer.publicId)}
                reference={developer.publicId}
                title={developer.displayName}
                status={developer.availabilityStatus}
                statusLabel={developer.availabilityStatus.replace(/_/g, " ")}
              />
            </li>
          ))}
        </ul>
      )}
      <ListPager page={page} itemCount={developers.length} />
    </main>
  );
}
