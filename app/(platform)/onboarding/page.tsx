import { redirect } from "next/navigation";
import { logoutAction } from "@/app/(auth)/actions";
import { ACCOUNT_PATHS, isOnboardingComplete } from "@/modules/account";
import { platformConfig } from "@/modules/shared";
import { requireAuthenticatedUser } from "@/lib/server/auth";
import { getAccountSummary } from "@/lib/server/account";
import { OnboardingChoiceCards } from "./choice-cards";

export default async function OnboardingPage() {
  const session = await requireAuthenticatedUser(ACCOUNT_PATHS.onboarding);
  const summary = await getAccountSummary(session.userId);

  if (summary && isOnboardingComplete(summary)) {
    redirect(ACCOUNT_PATHS.app);
  }

  return (
    <main>
      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-navy/50">
        {platformConfig.name}
      </p>
      <h1 className="mt-3 text-3xl font-extrabold tracking-[-0.04em] text-navy-deep">
        How will you use Flash One?
      </h1>
      <p className="mt-4 text-[15px] leading-relaxed text-muted">
        Choose a starting path. You can add more relationships later. This
        does not change platform admin access.
      </p>
      <OnboardingChoiceCards />
      <form action={logoutAction} className="mt-8">
        <button
          type="submit"
          className="inline-flex items-center justify-center rounded-(--radius-button) border border-line bg-white px-5 py-2.5 text-sm font-semibold text-navy"
        >
          Sign out
        </button>
      </form>
    </main>
  );
}
