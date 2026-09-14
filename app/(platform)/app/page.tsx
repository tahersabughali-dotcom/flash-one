import { requireAuthenticatedUser } from "@/lib/server/auth";
import { createSessionSupabaseClient } from "@/lib/supabase/server";
import { logoutAction } from "@/app/(auth)/actions";
import { platformConfig } from "@/modules/shared";

export default async function PlatformAppPage() {
  const session = await requireAuthenticatedUser("/app");
  const supabase = await createSessionSupabaseClient();

  let displayName: string | null = null;
  if (supabase) {
    const { data } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("user_id", session.userId)
      .maybeSingle();
    displayName = data?.full_name ?? null;
  }

  return (
    <main>
      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-navy/50">
        {platformConfig.name}
      </p>
      <h1 className="mt-3 text-3xl font-extrabold tracking-[-0.04em] text-navy-deep">
        Flash One Platform
      </h1>
      <p className="mt-4 text-[15px] leading-relaxed text-muted">
        Signed in
        {displayName ? ` as ${displayName}` : ""}. This is the authenticated
        platform shell. It is not a product dashboard.
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
