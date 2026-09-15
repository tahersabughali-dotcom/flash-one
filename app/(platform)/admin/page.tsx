import Link from "next/link";
import { requirePlatformAdmin } from "@/lib/server/auth";
import { logoutAction } from "@/app/(auth)/actions";
import { getAdminCounts, searchAdminRecords } from "@/lib/server/admin/queries";
import { platformConfig } from "@/modules/shared";
import { ADMIN_PATHS } from "@/modules/account";
import { WORK_REQUEST_PATHS } from "@/modules/work-requests";
import { PROJECT_PATHS } from "@/modules/projects";

export default async function PlatformAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const access = await requirePlatformAdmin("/admin");
  if (!access.authorized) {
    return (
      <main>
        <h1 className="mt-3 text-3xl font-extrabold tracking-[-0.04em] text-navy-deep">
          Not authorized
        </h1>
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

  const params = await searchParams;
  const query = params.q?.trim() ?? "";
  const [counts, results] = await Promise.all([
    getAdminCounts(),
    query.length >= 2 ? searchAdminRecords(query) : Promise.resolve([]),
  ]);

  const cards = [
    { href: WORK_REQUEST_PATHS.adminList, label: "New work requests", value: counts.newRequests },
    { href: WORK_REQUEST_PATHS.adminList, label: "Requests under review", value: counts.requestsUnderReview },
    { href: WORK_REQUEST_PATHS.adminList, label: "Quotes awaiting customer", value: counts.quotesAwaitingCustomer },
    { href: PROJECT_PATHS.adminList, label: "Active projects", value: counts.activeProjects },
    { href: PROJECT_PATHS.adminList, label: "Deliverables awaiting customer", value: counts.deliverablesAwaitingCustomer },
    { href: ADMIN_PATHS.businesses, label: "Organizations", value: counts.organizations },
    { href: ADMIN_PATHS.customers, label: "Individual relationships", value: counts.individualRelationships },
    { href: ADMIN_PATHS.developers, label: "Developers", value: counts.developers },
  ];

  return (
    <main>
      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-navy/50">
        {platformConfig.name}
      </p>
      <h1 className="mt-3 text-3xl font-extrabold tracking-[-0.04em] text-navy-deep">
        Operations
      </h1>
      <p className="mt-4 text-[15px] leading-relaxed text-muted">
        Counts come from the live development database. There are no revenue or payment metrics yet.
      </p>
      <form className="mt-6 flex gap-2">
        <input
          name="q"
          defaultValue={query}
          placeholder="Search names and public IDs"
          className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-[15px]"
        />
        <button type="submit" className="rounded-(--radius-button) bg-blue px-4 py-2 text-sm font-semibold text-white">
          Search
        </button>
      </form>
      {results.length > 0 ? (
        <ul className="mt-4 space-y-2 text-sm">
          {results.map((item) => (
            <li key={`${item.kind}-${item.publicId}`}>
              <Link href={item.href} className="font-semibold text-blue">
                {item.label}
              </Link>{" "}
              · {item.kind} · {item.publicId}
            </li>
          ))}
        </ul>
      ) : query.length >= 2 ? (
        <p className="mt-4 text-sm text-muted">No matching records.</p>
      ) : null}
      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="rounded-(--radius-panel) border border-white/70 bg-white/80 p-5 shadow-(--shadow-soft)"
          >
            <p className="text-sm text-muted">{card.label}</p>
            <p className="mt-2 text-3xl font-extrabold text-navy-deep">{card.value}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
