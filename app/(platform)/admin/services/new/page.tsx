import { requirePlatformAdmin } from "@/lib/server/auth";
import { SERVICE_PATHS } from "@/modules/services";
import { PageHeader } from "@/components/platform/PageHeader";
import { CatalogServiceForm } from "../service-form";

export default async function AdminNewServicePage() {
  await requirePlatformAdmin(SERVICE_PATHS.adminNew);
  return (
    <main>
      <PageHeader
        eyebrow="Commercial"
        title="New catalog service"
        description="Quote-required is the default for custom software and project work."
      />
      <CatalogServiceForm />
    </main>
  );
}
