import { requirePlatformAdmin } from "@/lib/server/auth";
import { logoutAction } from "@/app/(auth)/actions";
import { listReconciliationItems } from "@/lib/server/reconciliation";
import { parseListPage } from "@/lib/server/pagination";
import { ListPager } from "@/components/platform/ListPager";
import { formatMinor } from "@/modules/invoices";
import {
  RECONCILIATION_PATHS,
  RECONCILIATION_STATUS_LABELS,
} from "@/modules/reconciliation";
import {
  ConfirmReconciliationButton,
  CreateReconciliationForm,
  MatchReconciliationForm,
} from "./forms";

export default async function AdminReconciliationPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const access = await requirePlatformAdmin(RECONCILIATION_PATHS.adminList);
  if (!access.authorized) {
    return <Unauthorized />;
  }
  const page = parseListPage((await searchParams).page);
  const items = await listReconciliationItems(page);

  return (
    <main>
      <h1 className="text-3xl font-extrabold tracking-[-0.04em] text-navy-deep">
        Reconciliation
      </h1>
      <p className="mt-3 text-[15px] text-muted">
        Foundation only. Matching a development item to a payment does not create a sale.
      </p>
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
                {item.matchedPaymentPublicId
                  ? ` · ${item.matchedPaymentPublicId}`
                  : ""}
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
