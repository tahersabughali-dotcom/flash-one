import Link from "next/link";
import { requireCompletedOnboarding, getProfileDisplayName } from "@/lib/server/account";
import { listPortalHomeData } from "@/lib/server/account/portal";
import { listCustomerOrders } from "@/lib/server/store/core";
import { countUnreadNotifications } from "@/lib/server/platform/queries";
import { STORE_PATHS, ORDER_STATUS_LABELS } from "@/modules/store";
import { NOTIFICATION_PATHS } from "@/modules/notifications";
import { AI_PATHS } from "@/modules/ai";
import { logoutAction } from "@/app/(auth)/actions";
import { ACCOUNT_PATHS } from "@/modules/account";
import { WORK_REQUEST_PATHS, WORK_REQUEST_STATUS_LABELS } from "@/modules/work-requests";
import { PROJECT_PATHS, PROJECT_STATUS_LABELS } from "@/modules/projects";
import { QUOTE_PATHS, QUOTE_STATUS_LABELS } from "@/modules/quotes";
import { platformConfig } from "@/modules/shared";

export default async function PlatformAppPage() {
  const { session, summary } = await requireCompletedOnboarding("/app");
  const displayName = await getProfileDisplayName(session.userId);
  const home = await listPortalHomeData(session.userId);
  const [orders, unread] = await Promise.all([
    listCustomerOrders(),
    countUnreadNotifications(),
  ]);

  return (
    <main>
      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-navy/50">
        {platformConfig.name}
      </p>
      <h1 className="mt-3 text-3xl font-extrabold tracking-[-0.04em] text-navy-deep">
        Welcome{displayName ? `, ${displayName}` : ""}
      </h1>
      <p className="mt-4 text-[15px] leading-relaxed text-muted">
        Your Flash One home uses real requests, quotes, and projects only.
      </p>

      <section className="mt-8 rounded-(--radius-panel) border border-white/70 bg-white/80 p-6 shadow-(--shadow-soft)">
        <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-navy/50">
          Relationships
        </h2>
        <ul className="mt-4 space-y-2 text-[15px] text-navy">
          {summary.individual ? <li>Individual customer</li> : null}
          {summary.organizations.map((organization) => (
            <li key={organization.publicId}>
              <Link href={ACCOUNT_PATHS.business(organization.publicId)} className="font-semibold text-blue">
                {organization.name}
              </Link>{" "}
              · {organization.role}
            </li>
          ))}
          {summary.developer ? (
            <li>
              <Link href={ACCOUNT_PATHS.developer} className="font-semibold text-blue">
                Developer · {summary.developer.displayName}
              </Link>
            </li>
          ) : null}
        </ul>
        {summary.individual || summary.organizations.length > 0 || summary.developer ? null : (
          <p className="mt-4 text-sm text-muted">No relationships yet.</p>
        )}
        <p className="mt-4 text-sm">
          <Link href={ACCOUNT_PATHS.relationships} className="font-semibold text-blue">
            Manage relationships
          </Link>
        </p>
      </section>

      <HomeList
        title="Active requests"
        empty="No active requests."
        items={home.requests.map((item) => ({
          href: WORK_REQUEST_PATHS.detail(item.publicId),
          title: item.title,
          meta: WORK_REQUEST_STATUS_LABELS[item.status as keyof typeof WORK_REQUEST_STATUS_LABELS] ?? item.status,
        }))}
      />
      <HomeList
        title="Quotes awaiting action"
        empty="No quotes waiting for you."
        items={home.quotes.map((item) => ({
          href: QUOTE_PATHS.detail(item.publicId),
          title: item.publicId,
          meta: QUOTE_STATUS_LABELS[item.status],
        }))}
      />
      <HomeList
        title="Active projects"
        empty="No active projects."
        items={home.projects.map((item) => ({
          href: PROJECT_PATHS.detail(item.publicId),
          title: item.name,
          meta: PROJECT_STATUS_LABELS[item.status],
        }))}
      />
      <HomeList
        title="Recent deliverables"
        empty="No submitted deliverables."
        items={home.deliverables.map((item) => ({
          href: PROJECT_PATHS.list,
          title: item.title,
          meta: item.status,
        }))}
      />
      <HomeList
        title="Recent project messages"
        empty="No recent messages."
        items={home.messages.map((item) => ({
          href: PROJECT_PATHS.list,
          title: item.body.slice(0, 80),
          meta: new Date(item.createdAt).toLocaleDateString("en-GB"),
        }))}
      />
      <HomeList
        title="Orders"
        empty="No orders yet."
        items={orders.slice(0, 6).map((item) => ({
          href: STORE_PATHS.order(item.publicId),
          title: item.publicId,
          meta: ORDER_STATUS_LABELS[item.status],
        }))}
      />
      <HomeList
        title="Notifications"
        empty="No notifications."
        items={
          unread > 0
            ? [{ href: NOTIFICATION_PATHS.list, title: `${unread} unread`, meta: "In-app only" }]
            : []
        }
      />

      <p className="mt-8 flex flex-wrap gap-4 text-sm">
        <Link href={WORK_REQUEST_PATHS.new} className="font-semibold text-blue">
          New request
        </Link>
        <Link href={PROJECT_PATHS.list} className="font-semibold text-blue">
          Projects
        </Link>
        <Link href={AI_PATHS.workspace} className="font-semibold text-blue">
          AI
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

function HomeList({
  title,
  empty,
  items,
}: {
  title: string;
  empty: string;
  items: Array<{ href: string; title: string; meta: string }>;
}) {
  return (
    <section className="mt-8 rounded-(--radius-panel) border border-white/70 bg-white/80 p-6 shadow-(--shadow-soft)">
      <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-navy/50">{title}</h2>
      {items.length === 0 ? (
        <p className="mt-4 text-[15px] text-muted">{empty}</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {items.map((item) => (
            <li key={`${item.href}-${item.title}`}>
              <Link href={item.href} className="block">
                <p className="font-semibold text-navy-deep">{item.title}</p>
                <p className="text-sm text-muted">{item.meta}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
