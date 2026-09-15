import Link from "next/link";
import { requirePlatformAdmin } from "@/lib/server/auth";
import { logoutAction } from "@/app/(auth)/actions";
import { listAdminDevelopers } from "@/lib/server/admin/queries";
import { parseListPage } from "@/lib/server/pagination";
import { ListPager } from "@/components/platform/ListPager";
import { ADMIN_PATHS } from "@/modules/account";

export default async function AdminDevelopersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const access = await requirePlatformAdmin(ADMIN_PATHS.developers);
  if (!access.authorized) {
    return (
      <main>
        <h1 className="text-3xl font-extrabold text-navy-deep">Not authorized</h1>
        <form action={logoutAction} className="mt-8">
          <button type="submit" className="rounded-(--radius-button) border border-line bg-white px-5 py-2.5 text-sm font-semibold">
            Sign out
          </button>
        </form>
      </main>
    );
  }
  const page = parseListPage((await searchParams).page);
  const developers = await listAdminDevelopers(page);
  return (
    <main>
      <h1 className="text-3xl font-extrabold tracking-[-0.04em] text-navy-deep">Developers</h1>
      {developers.length === 0 ? (
        <p className="mt-8 text-[15px] text-muted">No developer profiles yet.</p>
      ) : (
        <ul className="mt-8 space-y-3">
          {developers.map((developer) => (
            <li key={developer.publicId}>
              <Link
                href={ADMIN_PATHS.developer(developer.publicId)}
                className="block rounded-(--radius-panel) border border-white/70 bg-white/80 p-5 shadow-(--shadow-soft)"
              >
                <p className="text-xs font-semibold tracking-[0.14em] text-navy/50">{developer.publicId}</p>
                <p className="mt-2 font-extrabold text-navy-deep">{developer.displayName}</p>
                <p className="mt-1 text-sm text-muted">{developer.availabilityStatus}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
      <ListPager page={page} itemCount={developers.length} />
    </main>
  );
}
