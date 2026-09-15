import Link from "next/link";
import { ACCOUNT_PATHS } from "@/modules/account";
import { platformConfig } from "@/modules/shared";
import { requireAuthenticatedUser } from "@/lib/server/auth";
import { BusinessOnboardingForm } from "./business-form";

export default async function BusinessOnboardingPage() {
  await requireAuthenticatedUser(`${ACCOUNT_PATHS.onboarding}/business`);

  return (
    <main>
      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-navy/50">
        {platformConfig.name}
      </p>
      <h1 className="mt-3 text-3xl font-extrabold tracking-[-0.04em] text-navy-deep">
        Business
      </h1>
      <p className="mt-4 text-[15px] leading-relaxed text-muted">
        Create an organization. You will be its owner. This does not grant
        Flash One admin access.
      </p>
      <BusinessOnboardingForm />
      <p className="mt-6 text-sm text-muted">
        <Link href={ACCOUNT_PATHS.onboarding} className="font-semibold text-blue">
          Choose a different path
        </Link>
      </p>
    </main>
  );
}
