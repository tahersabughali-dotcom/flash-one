import { requirePlatformAdmin } from "@/lib/server/auth";
import { optionLists } from "@/lib/server/operations";
import { OPERATIONS_PATHS } from "@/modules/operations";
import { PageHeader } from "@/components/platform/PageHeader";
import { PayoutForm } from "../../ops-forms";

export default async function Page() {
  await requirePlatformAdmin(OPERATIONS_PATHS.payoutNew);
  const options = await optionLists();
  return (
    <main>
      <PageHeader eyebrow="Finance" title="New payout" description="This does not send money through a payment provider." />
      <PayoutForm options={options} />
    </main>
  );
}
