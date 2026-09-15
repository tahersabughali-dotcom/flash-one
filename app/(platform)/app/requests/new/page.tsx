import Link from "next/link";
import { requireCompletedOnboarding } from "@/lib/server/account";
import { WORK_REQUEST_PATHS } from "@/modules/work-requests";
import { NewWorkRequestForm } from "../new-request-form";

export default async function NewWorkRequestPage() {
  const { summary } = await requireCompletedOnboarding(WORK_REQUEST_PATHS.new);
  const canSubmit = summary.individual || summary.organizations.length > 0;

  return (
    <main>
      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-navy/50">
        Work request
      </p>
      <h1 className="mt-3 text-3xl font-extrabold tracking-[-0.04em] text-navy-deep">
        New request
      </h1>
      <p className="mt-4 text-[15px] leading-relaxed text-muted">
        Tell Flash One what you need. A developer profile alone is not a
        customer relationship.
      </p>
      {canSubmit ? (
        <NewWorkRequestForm summary={summary} />
      ) : (
        <p className="mt-8 text-[15px] text-muted">
          Add an individual or business relationship before submitting a
          request.
        </p>
      )}
      <p className="mt-6 text-sm">
        <Link href={WORK_REQUEST_PATHS.list} className="font-semibold text-blue">
          Back to requests
        </Link>
      </p>
    </main>
  );
}
