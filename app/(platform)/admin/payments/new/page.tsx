import { requirePlatformAdmin } from "@/lib/server/auth";
import { logoutAction } from "@/app/(auth)/actions";
import { listAdminCustomers, listAdminOrganizations } from "@/lib/server/admin/queries";
import { PAYMENT_PATHS } from "@/modules/payments";
import { ManualPaymentForm } from "./payment-form";

export default async function AdminNewPaymentPage() {
  const access = await requirePlatformAdmin(PAYMENT_PATHS.adminNew);
  if (!access.authorized) {
    return <Unauthorized />;
  }
  const [customers, organizations] = await Promise.all([
    listAdminCustomers(),
    listAdminOrganizations(),
  ]);
  return (
    <main>
      <h1 className="text-3xl font-extrabold tracking-[-0.04em] text-navy-deep">
        Manual payment record
      </h1>
      <p className="mt-3 text-[15px] text-muted">
        Development recording only. This does not capture money from a provider.
      </p>
      <ManualPaymentForm customers={customers} organizations={organizations} />
    </main>
  );
}

function Unauthorized() {
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
