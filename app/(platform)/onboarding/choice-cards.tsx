import Link from "next/link";
import { ACCOUNT_PATHS } from "@/modules/account";

const OPTIONS = [
  {
    href: `${ACCOUNT_PATHS.onboarding}/individual`,
    title: "Individual",
    description:
      "Use Flash One for your own work. Start simply, then add a business or developer profile later if you need one.",
  },
  {
    href: `${ACCOUNT_PATHS.onboarding}/business`,
    title: "Business",
    description:
      "Create an organization for your company. You will be its owner. This is not platform admin access.",
  },
  {
    href: `${ACCOUNT_PATHS.onboarding}/developer`,
    title: "Developer",
    description:
      "Set up a developer identity. You can still buy services or join a business later.",
  },
] as const;

export function OnboardingChoiceCards() {
  return (
    <div className="mt-8 space-y-4">
      {OPTIONS.map((option) => (
        <Link
          key={option.href}
          href={option.href}
          className="block rounded-(--radius-panel) border border-white/70 bg-white/80 p-6 shadow-(--shadow-soft) transition-colors hover:border-blue/30"
        >
          <h2 className="text-lg font-extrabold tracking-[-0.03em] text-navy-deep">
            {option.title}
          </h2>
          <p className="mt-2 text-[15px] leading-relaxed text-muted">
            {option.description}
          </p>
        </Link>
      ))}
    </div>
  );
}
