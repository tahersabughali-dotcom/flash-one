import Link from "next/link";
import { requirePlatformAdmin } from "@/lib/server/auth";
import { getAdminCounts, searchAdminRecords } from "@/lib/server/admin/queries";
import { platformConfig } from "@/modules/shared";
import { ADMIN_PATHS } from "@/modules/account";
import { WORK_REQUEST_PATHS } from "@/modules/work-requests";
import { PROJECT_PATHS } from "@/modules/projects";
import { countActiveStoreProducts, countFailedAutomationRuns, countPendingStoreOrders } from "@/lib/server/platform/queries";
import { getOperationalHealth } from "@/lib/server/platform/health";
import { listPayments } from "@/lib/server/payments";
import { getFinanceDashboard } from "@/lib/server/reports";
import { STORE_PATHS } from "@/modules/store";
import { AUTOMATION_PATHS } from "@/modules/automations";
import { PAYMENT_PATHS, PAYMENT_STATUS_LABELS } from "@/modules/payments";
import { RECEIPT_PATHS } from "@/modules/receipts";
import { formatMinor } from "@/modules/invoices";
import { formatDisplayDate } from "@/lib/format/display";
import { PageHeader } from "@/components/platform/PageHeader";
import { SummaryCard } from "@/components/platform/SummaryCard";
import { SectionPanel } from "@/components/platform/SectionPanel";
import { RecordCard } from "@/components/platform/RecordCard";

export default async function PlatformAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  await requirePlatformAdmin("/admin");

  const params = await searchParams;
  const query = params.q?.trim() ?? "";
  const [counts, results, paidOrders, activeProducts, failedRuns, health, payments, finance] =
    await Promise.all([
      getAdminCounts(),
      query.length >= 2 ? searchAdminRecords(query) : Promise.resolve([]),
      countPendingStoreOrders(),
      countActiveStoreProducts(),
      countFailedAutomationRuns(),
      getOperationalHealth(),
      listPayments(1),
      getFinanceDashboard(),
    ]);

  const reviewCards = [
    { href: WORK_REQUEST_PATHS.adminList, label: "New work requests", value: counts.newRequests },
    { href: WORK_REQUEST_PATHS.adminList, label: "Requests under review", value: counts.requestsUnderReview },
    { href: WORK_REQUEST_PATHS.adminList, label: "Quotes awaiting customer", value: counts.quotesAwaitingCustomer },
    { href: PROJECT_PATHS.adminList, label: "Deliverables awaiting customer", value: counts.deliverablesAwaitingCustomer },
    { href: PAYMENT_PATHS.adminList, label: "Payments needing review", value: health.reviewRequiredPaymentCount },
    { href: STORE_PATHS.adminOrders, label: "Orders awaiting fulfillment", value: paidOrders },
    { href: AUTOMATION_PATHS.admin, label: "Failed automation runs", value: failedRuns },
  ];
  const deliveryCards = [
    { href: PROJECT_PATHS.adminList, label: "Active projects", value: counts.activeProjects },
    { href: STORE_PATHS.adminProducts, label: "Active store products", value: activeProducts },
  ];
  const issuedBalance =
    finance.issuedBalance.length === 0
      ? "None"
      : finance.issuedBalance
          .map((row) => formatMinor(row.amountMinor, row.currency))
          .join(" · ");
  const financeCards = [
    { href: "/admin/invoices", label: "Issued invoice balance", value: issuedBalance },
    { href: "/admin/invoices", label: "Issued invoices", value: counts.issuedInvoices },
    { href: "/admin/invoices", label: "Partially paid invoices", value: counts.partiallyPaidInvoices },
    { href: "/admin/invoices", label: "Paid invoices", value: counts.paidInvoices },
    { href: PAYMENT_PATHS.adminList, label: "Payments needing review", value: finance.reviewRequiredPayments },
    { href: PAYMENT_PATHS.adminList, label: "Unallocated recorded payments", value: finance.unallocatedPayments },
    { href: "/admin/refunds", label: "Pending external refunds", value: finance.pendingRefunds },
    { href: "/admin/reconciliation", label: "Unmatched reconciliation items", value: finance.unmatchedReconciliation },
    { href: RECEIPT_PATHS.adminList, label: "Receipts", value: counts.receipts },
  ];
  const directoryCards = [
    { href: ADMIN_PATHS.customers, label: "Individual customers", value: counts.individualRelationships },
    { href: ADMIN_PATHS.businesses, label: "Organizations", value: counts.organizations },
    { href: ADMIN_PATHS.developers, label: "Developers", value: counts.developers },
  ];

  return (
    <main>
      <PageHeader
        eyebrow={platformConfig.name}
        title="Operations"
        description="Counts come from the live development database. These are operational record counts, not production revenue."
      />
      <form className="mt-6 flex flex-col gap-2 sm:flex-row">
        <label className="sr-only" htmlFor="admin-search">
          Search records
        </label>
        <input
          id="admin-search"
          name="q"
          defaultValue={query}
          placeholder="Search names and public IDs"
          className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-[15px]"
        />
        <button type="submit" className="rounded-(--radius-button) bg-blue px-4 py-2 text-sm font-semibold text-white">
          Search
        </button>
      </form>
      {results.length > 0 ? (
        <ul className="mt-4 space-y-2 text-sm">
          {results.map((item) => (
            <li key={`${item.kind}-${item.publicId}`}>
              <Link href={item.href} className="font-semibold text-blue">
                {item.label}
              </Link>{" "}
              · {item.kind} · {item.publicId}
            </li>
          ))}
        </ul>
      ) : query.length >= 2 ? (
        <p className="mt-4 text-sm text-muted">No matching records.</p>
      ) : null}

      <SectionPanel title="Needs attention">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {reviewCards.map((card) => (
            <SummaryCard key={card.label} href={card.href} label={card.label} value={card.value} />
          ))}
        </div>
      </SectionPanel>
      <SectionPanel title="Delivery">
        <div className="grid gap-3 sm:grid-cols-2">
          {deliveryCards.map((card) => (
            <SummaryCard key={card.label} href={card.href} label={card.label} value={card.value} />
          ))}
        </div>
      </SectionPanel>
      <SectionPanel title="Finance">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {financeCards.map((card) => (
            <SummaryCard key={card.label} href={card.href} label={card.label} value={card.value} />
          ))}
        </div>
      </SectionPanel>
      <SectionPanel title="Directory">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {directoryCards.map((card) => (
            <SummaryCard key={card.label} href={card.href} label={card.label} value={card.value} />
          ))}
        </div>
      </SectionPanel>

      <SectionPanel title="Recent payments">
        {payments.length === 0 ? (
          <p className="text-[15px] text-muted">No recorded payments.</p>
        ) : (
          <ul className="space-y-3">
            {payments.slice(0, 6).map((payment) => (
              <li key={payment.publicId}>
                <RecordCard
                  href={PAYMENT_PATHS.adminDetail(payment.publicId)}
                  reference={payment.publicId}
                  title={formatMinor(payment.amountMinor, payment.currency)}
                  status={payment.status}
                  statusLabel={PAYMENT_STATUS_LABELS[payment.status]}
                  meta={`${payment.customerLabel}${payment.receivedAt ? ` · ${formatDisplayDate(payment.receivedAt)}` : ""}`}
                />
              </li>
            ))}
          </ul>
        )}
      </SectionPanel>

      <SectionPanel title="System health">
        <p className="text-sm text-muted">
          Configuration and application connectivity. This is not provider uptime and not a backup proof.
        </p>
        <ul className="mt-4 space-y-2 text-sm">
          <li>Database: {health.databaseConnected ? "connected" : "unavailable"}</li>
          <li>Failed automations: {health.failedAutomationCount}</li>
          <li>Payments needing review: {health.reviewRequiredPaymentCount}</li>
          <li>
            Providers:{" "}
            {health.providers
              .map(
                (provider) =>
                  `${provider.code} ${provider.checkoutReady ? "checkout ready" : provider.configured ? "configured" : "not configured"}`,
              )
              .join(" · ") || "none"}
          </li>
          <li>Backups / PITR: deferred until production launch readiness</li>
        </ul>
      </SectionPanel>
    </main>
  );
}
