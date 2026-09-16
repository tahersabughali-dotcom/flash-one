import { requireCompletedOnboarding } from "@/lib/server/account/require-onboarding";
import { OPERATIONS_PATHS } from "@/modules/operations";
import { PageHeader } from "@/components/platform/PageHeader";
import { CustomerCaseForm } from "../case-form";

export default async function NewCustomerCasePage() {
  await requireCompletedOnboarding(OPERATIONS_PATHS.customerCaseNew);
  return (
    <main>
      <PageHeader
        eyebrow="Support"
        title="New case"
        description="Describe your question or issue. Flash One staff will follow up in the case thread."
      />
      <CustomerCaseForm />
    </main>
  );
}
