import { requireCompletedOnboarding } from "@/lib/server/account";
import { createSessionSupabaseClient } from "@/lib/supabase/server";
import { parseListPage, listRange } from "@/lib/server/pagination";
import { ListPager } from "@/components/platform/ListPager";
import { NOTIFICATION_PATHS } from "@/modules/notifications";
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
        .select("public_id, title, body, read_at, created_at")
        .order("created_at", { ascending: false })
        .range(from, to)
    : { data: [] };

  return (
    <main>
      <h1 className="text-3xl font-extrabold tracking-[-0.04em] text-navy-deep">Notifications</h1>
      <p className="mt-4 text-[15px] text-muted">
        In-app notices only. Flash One does not claim that email, SMS, or WhatsApp was sent.
      </p>
      {(data ?? []).length === 0 ? (
        <p className="mt-8 text-[15px] text-muted">No notifications.</p>
      ) : (
        <ul className="mt-8 space-y-3">
          {(data ?? []).map((item) => (
            <li
              key={item.public_id}
              className="rounded-(--radius-panel) border border-white/70 bg-white/80 p-5 shadow-(--shadow-soft)"
            >
              <p className="font-extrabold text-navy-deep">{item.title}</p>
              <p className="mt-2 text-[15px] text-navy">{item.body}</p>
              <p className="mt-2 text-sm text-muted">
                {item.read_at ? "Read" : "Unread"} · {new Date(item.created_at).toLocaleString("en-GB")}
              </p>
              {item.read_at ? null : (
                <form action={markNotificationReadAction} className="mt-3">
                  <input type="hidden" name="publicId" value={item.public_id} />
                  <button type="submit" className="text-sm font-semibold text-blue">
                    Mark read
                  </button>
                </form>
              )}
            </li>
          ))}
        </ul>
      )}
      <ListPager page={page} itemCount={(data ?? []).length} />
    </main>
  );
}
