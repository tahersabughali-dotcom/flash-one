import Link from "next/link";
import { ACCOUNT_PATHS } from "@/modules/account";
import { platformConfig } from "@/modules/shared";
import { requireAuthenticatedUser } from "@/lib/server/auth";
import { IndividualOnboardingForm } from "./individual-form";

export default async function IndividualOnboardingPage() {
  await requireAuthenticatedUser(`${ACCOUNT_PATHS.onboarding}/individual`);

  return (
    <main>
      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-navy/50">
        {platformConfig.name}
      </p>
      <h1 className="mt-3 text-3xl font-extrabold tracking-[-0.04em] text-navy-deep">
        Individual
      </h1>
      <p className="mt-4 text-[15px] leading-relaxed text-muted">
        Continue with a personal Flash One account. Your name is already on
        your profile. You can add a business or developer relationship later.
      </p>
      <IndividualOnboardingForm />
      <p className="mt-6 text-sm text-muted">
        <Link href={ACCOUNT_PATHS.onboarding} className="font-semibold text-blue">
          Choose a different path
        </Link>
      </p>
    </main>
  );
}
