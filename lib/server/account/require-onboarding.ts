import { redirect } from "next/navigation";
import { ACCOUNT_PATHS, isOnboardingComplete } from "@/modules/account";
import { requireAuthenticatedUser } from "@/lib/server/auth";
import { getAccountSummary } from "./queries";

export async function requireCompletedOnboarding(nextPath: string) {
  const session = await requireAuthenticatedUser(nextPath);
  const summary = await getAccountSummary(session.userId);
  if (!summary || !isOnboardingComplete(summary)) {
    redirect(ACCOUNT_PATHS.onboarding);
  }
  return { session, summary };
}
