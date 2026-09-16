import { requirePlatformAdmin } from "@/lib/server/auth";
import { OPERATIONS_PATHS } from "@/modules/operations";
import { PageHeader } from "@/components/platform/PageHeader";
import { PartnerForm } from "../../ops-forms";

export default async function Page() {
  await requirePlatformAdmin(OPERATIONS_PATHS.partnerNew);
  return (
    <main>
      <PageHeader eyebrow="People & network" title="New partner" description="Internal partner records. This is not a public partnership claim." />
      <PartnerForm />
    </main>
  );
}
