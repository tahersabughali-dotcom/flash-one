import { requireCompletedOnboarding, getProfileDisplayName } from "@/lib/server/account";
import { logoutAction } from "@/app/(auth)/actions";
import { WORK_REQUEST_PATHS } from "@/modules/work-requests";
import { PROJECT_PATHS } from "@/modules/projects";
import { platformConfig } from "@/modules/shared";
import Link from "next/link";

export default async function PlatformAppPage() {
  const { session, summary } = await requireCompletedOnboarding("/app");
  const displayName = await getProfileDisplayName(session.userId);

  const relationships: string[] = [];
  if (summary.individual) {
    relationships.push("Individual");
  }
  for (const organization of summary.organizations) {
    const roleLabel = organization.role === "owner" ? "owner" : "member";
    relationships.push(`Business · ${organization.name} (${roleLabel})`);
  }
  if (summary.developer) {
    relationships.push(`Developer · ${summary.developer.displayName}`);
  }

  return (
    <main>
      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-navy/50">
        {platformConfig.name}
      </p>
      <h1 className="mt-3 text-3xl font-extrabold tracking-[-0.04em] text-navy-deep">
        Welcome{displayName ? `, ${displayName}` : ""}
      </h1>
      <p className="mt-4 text-[15px] leading-relaxed text-muted">
        This is your Flash One home. It is not a product dashboard.
      </p>
      {relationships.length > 0 ? (
        <section className="mt-8 rounded-(--radius-panel) border border-white/70 bg-white/80 p-6 shadow-(--shadow-soft)">
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-navy/50">
            Your relationships
          </h2>
          <ul className="mt-4 space-y-2 text-[15px] text-navy">
            {relationships.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      ) : null}
      <p className="mt-8 flex flex-wrap gap-4 text-sm">
        <Link href={WORK_REQUEST_PATHS.new} className="font-semibold text-blue">
          New request
        </Link>
        <Link href={PROJECT_PATHS.list} className="font-semibold text-blue">
          Projects
        </Link>
      </p>
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
