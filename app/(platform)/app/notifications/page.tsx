import Link from "next/link";
import { requireCompletedOnboarding } from "@/lib/server/account";
import { createSessionSupabaseClient } from "@/lib/supabase/server";
import { parseListPage, listRange } from "@/lib/server/pagination";
import { ListPager } from "@/components/platform/ListPager";
import { PageHeader } from "@/components/platform/PageHeader";
import { EmptyState } from "@/components/platform/EmptyState";
import { StatusBadge } from "@/components/platform/StatusBadge";
import { formatDisplayDateTime } from "@/lib/format/display";
import { NOTIFICATION_PATHS, notificationDestination } from "@/modules/notifications";
import { markNotificationReadAction } from "./actions";

export default async function NotificationsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  await requireCompletedOnboarding(NOTIFICATION_PATHS.list);
  const page = parseListPage((await searchParams).page);
  const { from, to } = listRange(page);
  const supabase = await createSessionSupabaseClient();
  const { data } = supabase
    ? await supabase
        .from("notifications")
        .select("public_id, title, body, read_at, created_at, source_type, source_public_id")
        .order("created_at", { ascending: false })
        .range(from, to)
    : { data: [] };

  return (
    <main>
      <PageHeader
        eyebrow="Workspace"
        title="Notifications"
        description="In-app notices only. Flash One does not claim that email, SMS, or WhatsApp was sent."
      />
      {(data ?? []).length === 0 ? (
        <EmptyState
          title="No notifications"
          description="Notices about requests, orders, and follow-up will appear here."
        />
      ) : (
        <ul className="mt-8 space-y-3">
          {(data ?? []).map((item) => {
            const destination = notificationDestination(item.source_type, item.source_public_id);
            return (
              <li
                key={item.public_id}
                className="rounded-(--radius-panel) border border-white/70 bg-white/80 p-5 shadow-(--shadow-soft)"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <p className="font-extrabold text-navy-deep">{item.title}</p>
                  <StatusBadge
                    status={item.read_at ? "read" : "unread"}
                    label={item.read_at ? "Read" : "Unread"}
                  />
                </div>
                <p className="mt-2 text-[15px] text-navy">{item.body}</p>
                <p className="mt-2 text-sm text-muted">{formatDisplayDateTime(item.created_at)}</p>
                <div className="mt-3 flex flex-wrap gap-4">
                  {destination ? (
                    <Link href={destination} className="text-sm font-semibold text-blue">
                      Open related record
                    </Link>
                  ) : null}
                  {item.read_at ? null : (
                    <form action={markNotificationReadAction}>
                      <input type="hidden" name="publicId" value={item.public_id} />
                      <button type="submit" className="text-sm font-semibold text-blue">
                        Mark read
                      </button>
                    </form>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
      <ListPager page={page} itemCount={(data ?? []).length} />
    </main>
  );
}
