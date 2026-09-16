import Link from "next/link";
import { requireCompletedOnboarding, getProfileDisplayName, getCustomerWorkspaceStats } from "@/lib/server/account";
import { listPortalHomeData } from "@/lib/server/account/portal";
import { listCustomerOrders } from "@/lib/server/store/core";
import { listCustomerInvoices } from "@/lib/server/invoices";
import { listCustomerReceipts } from "@/lib/server/receipts";
import { logoutAction } from "@/app/(auth)/actions";
import { ACCOUNT_PATHS } from "@/modules/account";
import { WORK_REQUEST_PATHS, WORK_REQUEST_STATUS_LABELS } from "@/modules/work-requests";
import { PROJECT_PATHS, PROJECT_STATUS_LABELS } from "@/modules/projects";
import { QUOTE_PATHS, QUOTE_STATUS_LABELS } from "@/modules/quotes";
import { STORE_PATHS, ORDER_STATUS_LABELS } from "@/modules/store";
import { INVOICE_PATHS, INVOICE_STATUS_LABELS } from "@/modules/invoices";
import { RECEIPT_PATHS } from "@/modules/receipts";
import { NOTIFICATION_PATHS } from "@/modules/notifications";
import { AI_PATHS } from "@/modules/ai";
import { formatMinor } from "@/modules/invoices/money";
import { formatDisplayDate } from "@/lib/format/display";
import { PageHeader } from "@/components/platform/PageHeader";
import { SummaryCard } from "@/components/platform/SummaryCard";
import { RecordCard } from "@/components/platform/RecordCard";
import { SectionPanel } from "@/components/platform/SectionPanel";
import { EmptyState } from "@/components/platform/EmptyState";

export default async function PlatformAppPage() {
  const { session, summary } = await requireCompletedOnboarding("/app");
  const displayName = await getProfileDisplayName(session.userId);
  const [home, stats, orders, invoices, receipts] = await Promise.all([
    listPortalHomeData(session.userId),
    getCustomerWorkspaceStats(),
    listCustomerOrders(),
    listCustomerInvoices(session.userId),
    listCustomerReceipts(session.userId, 1),
  ]);

  return (
    <main>
      <PageHeader
        eyebrow="Flash One"
        title={`Welcome${displayName ? `, ${displayName}` : ""}`}
        description="Your workspace shows live requests, projects, orders, and invoices. Counts come from your account, not sample figures."
        actions={
          <Link
            href={WORK_REQUEST_PATHS.new}
            className="inline-flex items-center justify-center rounded-(--radius-button) bg-blue px-5 py-2.5 text-sm font-semibold text-white shadow-(--shadow-button)"
          >
            New request
          </Link>
        }
      />

      <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <SummaryCard href={WORK_REQUEST_PATHS.list} label="Active requests" value={stats.activeRequests} />
        <SummaryCard href={PROJECT_PATHS.list} label="Active projects" value={stats.activeProjects} />
        <SummaryCard href={STORE_PATHS.orders} label="Orders" value={stats.orders} />
        <SummaryCard href={INVOICE_PATHS.list} label="Outstanding invoices" value={stats.outstandingInvoices} />
        <SummaryCard href={RECEIPT_PATHS.list} label="Receipts" value={stats.receipts} />
        <SummaryCard
          href={NOTIFICATION_PATHS.list}
          label="Unread notifications"
          value={stats.unreadNotifications}
        />
      </div>

      <SectionPanel title="Relationships">
        <ul className="space-y-2 text-[15px] text-navy">
          {summary.individual ? <li>Individual customer</li> : null}
          {summary.organizations.map((organization) => (
            <li key={organization.publicId}>
              <Link href={ACCOUNT_PATHS.business(organization.publicId)} className="font-semibold text-blue">
                {organization.name}
              </Link>{" "}
              · {organization.role}
            </li>
          ))}
          {summary.developer ? (
            <li>
              <Link href={ACCOUNT_PATHS.developer} className="font-semibold text-blue">
                Developer · {summary.developer.displayName}
              </Link>
            </li>
          ) : null}
        </ul>
        {summary.individual || summary.organizations.length > 0 || summary.developer ? null : (
          <p className="text-sm text-muted">No relationships yet.</p>
        )}
        <p className="mt-4 text-sm">
          <Link href={ACCOUNT_PATHS.relationships} className="font-semibold text-blue">
            Manage relationships
          </Link>
        </p>
      </SectionPanel>

      {home.requests.length === 0 ? (
        <EmptyState
          title="No active requests"
          description="Start a work request when you have something to build or improve."
          actionHref={WORK_REQUEST_PATHS.new}
          actionLabel="New request"
        />
      ) : (
        <SectionPanel title="Recent requests">
          <ul className="space-y-3">
            {home.requests.map((item) => (
              <li key={item.publicId}>
                <RecordCard
                  href={WORK_REQUEST_PATHS.detail(item.publicId)}
                  reference={item.publicId}
                  title={item.title}
                  status={item.status}
                  statusLabel={
                    WORK_REQUEST_STATUS_LABELS[item.status as keyof typeof WORK_REQUEST_STATUS_LABELS] ??
                    item.status
                  }
                />
              </li>
            ))}
          </ul>
        </SectionPanel>
      )}

      {home.quotes.length > 0 ? (
        <SectionPanel title="Quotes awaiting action">
          <ul className="space-y-3">
            {home.quotes.map((item) => (
              <li key={item.publicId}>
                <RecordCard
                  href={QUOTE_PATHS.detail(item.publicId)}
                  reference={item.publicId}
                  title={item.publicId}
                  status={item.status}
                  statusLabel={QUOTE_STATUS_LABELS[item.status]}
                  meta={formatDisplayDate(item.createdAt)}
                />
              </li>
            ))}
          </ul>
        </SectionPanel>
      ) : null}

      <SectionPanel title="Recent projects">
        {home.projects.length === 0 ? (
          <p className="text-[15px] text-muted">No active projects yet. A project appears after you accept a quote.</p>
        ) : (
          <ul className="space-y-3">
            {home.projects.map((item) => (
              <li key={item.publicId}>
                <RecordCard
                  href={PROJECT_PATHS.detail(item.publicId)}
                  reference={item.publicId}
                  title={item.name}
                  status={item.status}
                  statusLabel={PROJECT_STATUS_LABELS[item.status]}
                />
              </li>
            ))}
          </ul>
        )}
      </SectionPanel>

      <SectionPanel title="Recent orders">
        {orders.length === 0 ? (
          <p className="text-[15px] text-muted">No store orders yet.</p>
        ) : (
          <ul className="space-y-3">
            {orders.slice(0, 6).map((item) => (
              <li key={item.publicId}>
                <RecordCard
                  href={STORE_PATHS.order(item.publicId)}
                  reference={item.publicId}
                  title={formatMinor(item.totalMinor, item.currency)}
                  status={item.status}
                  statusLabel={ORDER_STATUS_LABELS[item.status]}
                  meta={formatDisplayDate(item.createdAt)}
                />
              </li>
            ))}
          </ul>
        )}
      </SectionPanel>

      {invoices.slice(0, 4).length > 0 ? (
        <SectionPanel title="Recent invoices">
          <ul className="space-y-3">
            {invoices.slice(0, 4).map((invoice) => (
              <li key={invoice.publicId}>
                <RecordCard
                  href={INVOICE_PATHS.detail(invoice.publicId)}
                  reference={invoice.invoiceNumber ?? invoice.publicId}
                  title={formatMinor(invoice.totalMinor, invoice.currency)}
                  status={invoice.displayStatus}
                  statusLabel={
                    invoice.displayStatus === "overdue"
                      ? "Overdue"
                      : INVOICE_STATUS_LABELS[invoice.status]
                  }
                />
              </li>
            ))}
          </ul>
        </SectionPanel>
      ) : null}

      {receipts.slice(0, 4).length > 0 ? (
        <SectionPanel title="Recent receipts">
          <ul className="space-y-3">
            {receipts.slice(0, 4).map((receipt) => (
              <li key={receipt.publicId}>
                <RecordCard
                  href={RECEIPT_PATHS.detail(receipt.publicId)}
                  reference={receipt.receiptNumber}
                  title={formatMinor(receipt.amountMinor, receipt.currency)}
                  meta={receipt.sourceLabel}
                />
              </li>
            ))}
          </ul>
        </SectionPanel>
      ) : null}

      <p className="mt-8 flex flex-wrap gap-4 text-sm">
        <Link href={AI_PATHS.workspace} className="font-semibold text-blue">
          AI workspace
        </Link>
        <Link href={ACCOUNT_PATHS.account} className="font-semibold text-blue">
          Account
        </Link>
        <Link href={NOTIFICATION_PATHS.list} className="font-semibold text-blue">
          Notifications
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
