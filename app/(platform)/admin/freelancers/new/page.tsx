import { requirePlatformAdmin } from "@/lib/server/auth";
import { OPERATIONS_PATHS } from "@/modules/operations";
import { PageHeader } from "@/components/platform/PageHeader";
import { FreelancerForm } from "../../ops-forms";

export default async function Page() {
  await requirePlatformAdmin(OPERATIONS_PATHS.freelancerNew);
  return (
    <main>
      <PageHeader eyebrow="People & network" title="New freelancer" description="Freelancer commercial relationships. A freelancer may also be a developer, but these remain separate." />
      <FreelancerForm />
    </main>
  );
}
