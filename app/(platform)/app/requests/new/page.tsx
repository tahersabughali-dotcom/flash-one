import Link from "next/link";
import { requireCompletedOnboarding } from "@/lib/server/account";
import { WORK_REQUEST_PATHS } from "@/modules/work-requests";
import { ACCOUNT_PATHS } from "@/modules/account";
import { PageHeader } from "@/components/platform/PageHeader";
import { EmptyState } from "@/components/platform/EmptyState";
import { NewWorkRequestForm } from "../new-request-form";

export default async function NewWorkRequestPage() {
  const { summary } = await requireCompletedOnboarding(WORK_REQUEST_PATHS.new);
  const canSubmit = summary.individual || summary.organizations.length > 0;

  return (
    <main>
      <PageHeader
        eyebrow="Work request"
        title="New request"
        description="Tell Flash One what you need. A developer profile alone is not a customer relationship, and submitting this form does not create a quote."
      />
      {canSubmit ? (
        <NewWorkRequestForm summary={summary} />
      ) : (
        <EmptyState
          title="Add a customer relationship first"
          description="Create an individual or organization relationship before submitting a request."
          actionHref={ACCOUNT_PATHS.relationships}
          actionLabel="Manage relationships"
        />
      )}
      <p className="mt-6 text-sm">
        <Link href={WORK_REQUEST_PATHS.list} className="font-semibold text-blue">
          Back to requests
        </Link>
      </p>
    </main>
  );
}
