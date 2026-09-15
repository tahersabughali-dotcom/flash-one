import { requirePlatformAdmin } from "@/lib/server/auth";
import { logoutAction } from "@/app/(auth)/actions";
import { STORE_PATHS } from "@/modules/store";
import { AdminProductForm } from "../../product-form";

export default async function AdminNewProductPage() {
  const access = await requirePlatformAdmin(STORE_PATHS.adminProductNew);
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
  return (
    <main>
      <h1 className="text-3xl font-extrabold tracking-[-0.04em] text-navy-deep">New product</h1>
      <p className="mt-3 text-[15px] text-muted">Drafts are not public.</p>
      <AdminProductForm />
    </main>
  );
}
