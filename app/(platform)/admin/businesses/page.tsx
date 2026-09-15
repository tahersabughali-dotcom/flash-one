import Link from "next/link";
import { requirePlatformAdmin } from "@/lib/server/auth";
import { logoutAction } from "@/app/(auth)/actions";
import { listAdminOrganizations } from "@/lib/server/admin/queries";
import { ADMIN_PATHS } from "@/modules/account";

export default async function AdminBusinessesPage() {
  const access = await requirePlatformAdmin(ADMIN_PATHS.businesses);
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
  const businesses = await listAdminOrganizations();
  return (
    <main>
      <h1 className="text-3xl font-extrabold tracking-[-0.04em] text-navy-deep">Businesses</h1>
      {businesses.length === 0 ? (
        <p className="mt-8 text-[15px] text-muted">No organizations yet.</p>
      ) : (
        <ul className="mt-8 space-y-3">
          {businesses.map((business) => (
            <li key={business.publicId}>
              <Link
                href={ADMIN_PATHS.business(business.publicId)}
                className="block rounded-(--radius-panel) border border-white/70 bg-white/80 p-5 shadow-(--shadow-soft)"
              >
                <p className="text-xs font-semibold tracking-[0.14em] text-navy/50">{business.publicId}</p>
                <p className="mt-2 font-extrabold text-navy-deep">{business.name}</p>
                <p className="mt-1 text-sm text-muted">{business.memberCount} members</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
