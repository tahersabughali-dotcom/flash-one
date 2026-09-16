import { notFound } from "next/navigation";
import { requirePlatformAdmin } from "@/lib/server/auth";
import { getCatalogServiceByPublicId } from "@/lib/server/services";
import { SERVICE_PATHS, CATALOG_STATUS_LABELS } from "@/modules/services";
import { PageHeader } from "@/components/platform/PageHeader";
import { StatusBadge } from "@/components/platform/StatusBadge";
import { CatalogServiceForm } from "../service-form";

export default async function AdminServiceDetailPage({
  params,
}: {
  params: Promise<{ publicId: string }>;
}) {
  const { publicId } = await params;
  await requirePlatformAdmin(SERVICE_PATHS.adminDetail(publicId));
  const service = await getCatalogServiceByPublicId(publicId);
  if (!service) {
    notFound();
  }
  return (
    <main>
      <PageHeader
        eyebrow={service.publicId}
        title={service.name}
        actions={<StatusBadge status={service.status} label={CATALOG_STATUS_LABELS[service.status]} />}
      />
      <CatalogServiceForm service={service} />
    </main>
  );
}
