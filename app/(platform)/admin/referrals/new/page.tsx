import { requirePlatformAdmin } from "@/lib/server/auth";
import { OPERATIONS_PATHS } from "@/modules/operations";
import { PageHeader } from "@/components/platform/PageHeader";
import { ReferralForm } from "../../ops-forms";

export default async function Page() {
  await requirePlatformAdmin(OPERATIONS_PATHS.referralNew);
  return (
    <main>
      <PageHeader eyebrow="People & network" title="New referral" description="A referral does not automatically create commission." />
      <ReferralForm />
    </main>
  );
}
