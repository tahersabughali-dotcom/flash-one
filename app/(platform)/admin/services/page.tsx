import Link from "next/link";
import { requirePlatformAdmin } from "@/lib/server/auth";
import { listCatalogServices } from "@/lib/server/services";
import { parseListPage } from "@/lib/server/pagination";
import { ListPager } from "@/components/platform/ListPager";
import { PageHeader } from "@/components/platform/PageHeader";
import { EmptyState } from "@/components/platform/EmptyState";
import { RecordCard } from "@/components/platform/RecordCard";
import {
  CATALOG_CATEGORY_LABELS,
  CATALOG_MODE_LABELS,
  CATALOG_STATUS_LABELS,
  SERVICE_PATHS,
} from "@/modules/services";

export default async function AdminServicesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  await requirePlatformAdmin(SERVICE_PATHS.adminList);
  const page = parseListPage((await searchParams).page);
  const services = await listCatalogServices(page);

  return (
    <main>
      <PageHeader
        eyebrow="Commercial"
        title="Service catalog"
        description="Reusable internal services. This is not the Store product catalog, and it does not create customer transactions."
        actions={
          <Link
            href={SERVICE_PATHS.adminNew}
            className="rounded-(--radius-button) bg-blue px-5 py-2.5 text-sm font-semibold text-white"
          >
            New service
          </Link>
        }
      />
      {services.length === 0 ? (
        <EmptyState title="No services" description="Create a catalog item for genuine Flash One work." />
      ) : (
        <ul className="mt-8 space-y-3">
          {services.map((service) => (
            <li key={service.publicId}>
              <RecordCard
                href={SERVICE_PATHS.adminDetail(service.publicId)}
                reference={service.publicId}
                title={service.name}
                status={service.status}
                statusLabel={CATALOG_STATUS_LABELS[service.status]}
                meta={`${CATALOG_CATEGORY_LABELS[service.category]} · ${CATALOG_MODE_LABELS[service.commercialMode]}${service.customerVisible ? " · customer visible" : " · internal"}`}
              />
            </li>
          ))}
        </ul>
      )}
      <ListPager page={page} itemCount={services.length} />
    </main>
  );
}
