import Link from "next/link";
import { requirePlatformAdmin } from "@/lib/server/auth";
import { logoutAction } from "@/app/(auth)/actions";
import { listReconciliationItems } from "@/lib/server/reconciliation";
import { parseListPage } from "@/lib/server/pagination";
import { ListPager } from "@/components/platform/ListPager";
import { formatMinor } from "@/modules/invoices";
import { PAYMENT_PATHS } from "@/modules/payments";
import {
  RECONCILIATION_PATHS,
  RECONCILIATION_STATUSES,
  RECONCILIATION_STATUS_LABELS,
  type ReconciliationStatus,
} from "@/modules/reconciliation";
import {
  ConfirmReconciliationButton,
  CreateReconciliationForm,
  MatchReconciliationForm,
} from "./forms";

function isStatus(value: string | undefined): value is ReconciliationStatus {
  return Boolean(value && RECONCILIATION_STATUSES.includes(value as ReconciliationStatus));
}

export default async function AdminReconciliationPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string }>;
}) {
  const access = await requirePlatformAdmin(RECONCILIATION_PATHS.adminList);
  if (!access.authorized) {
    return <Unauthorized />;
  }
  const params = await searchParams;
  const page = parseListPage(params.page);
  const status = isStatus(params.status) ? params.status : undefined;
  const items = await listReconciliationItems(page, status);

  return (
    <main>
      <h1 className="text-3xl font-extrabold tracking-[-0.04em] text-navy-deep">
        Reconciliation
      </h1>
      <p className="mt-3 text-[15px] text-muted">
        Matching links evidence to a payment. It does not change the original payment amount or provider event.
      </p>
      <form className="mt-6 flex flex-wrap gap-2">
        <Link
          href={RECONCILIATION_PATHS.adminList}
          className={`rounded-full px-3 py-1.5 text-sm font-semibold ${
            !status ? "bg-blue text-white" : "border border-line bg-white"
          }`}
        >
          All
        </Link>
        {RECONCILIATION_STATUSES.map((value) => (
          <Link
            key={value}
            href={`${RECONCILIATION_PATHS.adminList}?status=${value}`}
            className={`rounded-full px-3 py-1.5 text-sm font-semibold ${
              status === value ? "bg-blue text-white" : "border border-line bg-white"
            }`}
          >
            {RECONCILIATION_STATUS_LABELS[value]}
          </Link>
        ))}
      </form>
      <CreateReconciliationForm />
      {items.length === 0 ? (
        <p className="mt-8 text-[15px] text-muted">No reconciliation items.</p>
      ) : (
        <ul className="mt-8 space-y-4">
          {items.map((item) => (
            <li
              key={item.publicId}
              className="rounded-(--radius-panel) border border-white/70 bg-white/80 p-5 shadow-(--shadow-soft)"
            >
              <p className="text-xs font-semibold tracking-[0.14em] text-navy/50">
                {item.publicId}
              </p>
              <p className="mt-2 font-extrabold text-navy-deep">
                {formatMinor(item.amountMinor, item.currency)}
              </p>
              <p className="mt-1 text-sm text-muted">
                {item.sourceType} · {RECONCILIATION_STATUS_LABELS[item.status]}
                {item.matchedPaymentPublicId ? (
                  <>
                    {" · "}
                    <Link
                      href={PAYMENT_PATHS.adminDetail(item.matchedPaymentPublicId)}
                      className="font-semibold text-blue"
                    >
                      {item.matchedPaymentPublicId}
                    </Link>
                  </>
                ) : null}
              </p>
              {item.status === "unmatched" || item.status === "suggested" ? (
                <MatchReconciliationForm itemPublicId={item.publicId} />
              ) : null}
              {item.status === "matched" ? (
                <ConfirmReconciliationButton itemPublicId={item.publicId} />
              ) : null}
            </li>
          ))}
        </ul>
      )}
      <ListPager page={page} itemCount={items.length} />
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
