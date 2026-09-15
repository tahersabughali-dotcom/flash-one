import { requirePlatformAdmin } from "@/lib/server/auth";
import { logoutAction } from "@/app/(auth)/actions";
import { listAdminCustomers, listAdminOrganizations } from "@/lib/server/admin/queries";
import { PAYMENT_REQUEST_PATHS } from "@/modules/payment-requests";
import { PaymentRequestForm } from "./request-form";

export default async function AdminNewPaymentRequestPage() {
  const access = await requirePlatformAdmin(PAYMENT_REQUEST_PATHS.adminNew);
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
        New payment request
      </h1>
      <p className="mt-3 text-[15px] text-muted">
        A payment request asks for money. It is not a payment.
      </p>
      <PaymentRequestForm customers={customers} organizations={organizations} />
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
