import Link from "next/link";
import { requirePlatformAdmin } from "@/lib/server/auth";
import { logoutAction } from "@/app/(auth)/actions";
import { platformConfig } from "@/modules/shared";

export default async function PlatformAdminPage() {
  const access = await requirePlatformAdmin("/admin");

  if (!access.authorized) {
    return (
      <main>
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-navy/50">
          {platformConfig.name}
        </p>
        <h1 className="mt-3 text-3xl font-extrabold tracking-[-0.04em] text-navy-deep">
          Not authorized
        </h1>
        <p className="mt-4 text-[15px] leading-relaxed text-muted">
          Your account is signed in, but it does not have admin access.
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

  return (
    <main>
      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-navy/50">
        {platformConfig.name}
      </p>
      <h1 className="mt-3 text-3xl font-extrabold tracking-[-0.04em] text-navy-deep">
        Flash One Admin
      </h1>
      <p className="mt-4 text-[15px] leading-relaxed text-muted">
        Review work requests and issue quotes. This is not an operations
        dashboard.
      </p>
      <p className="mt-6 text-sm">
        <Link href="/admin/requests" className="font-semibold text-blue">
          Open requests
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
