import { notFound } from "next/navigation";
import Link from "next/link";
import { requireCompletedOnboarding } from "@/lib/server/account";
import { ACCOUNT_PATHS } from "@/modules/account";
import {
  getOrganizationByPublicId,
  listOrganizationInvitations,
  listOrganizationMembers,
  listOrganizationWork,
  listOrganizationCommercial,
} from "@/lib/server/organizations/queries";
import { PROJECT_PATHS, PROJECT_STATUS_LABELS } from "@/modules/projects";
import { WORK_REQUEST_PATHS, WORK_REQUEST_STATUS_LABELS } from "@/modules/work-requests";
import { QUOTE_PATHS, QUOTE_STATUS_LABELS, type QuoteStatus } from "@/modules/quotes";
import { STORE_PATHS, ORDER_STATUS_LABELS, type OrderStatus } from "@/modules/store";
import { INVOICE_PATHS, INVOICE_STATUS_LABELS, type InvoiceStatus } from "@/modules/invoices";
import { RECEIPT_PATHS } from "@/modules/receipts";
import { CONTRACT_STATUS_LABELS, type ContractStatus } from "@/modules/contracts";
import { formatMinor } from "@/modules/invoices/money";
import { formatDisplayDate } from "@/lib/format/display";
import { PageHeader } from "@/components/platform/PageHeader";
import { RelatedRecords } from "@/components/platform/RelatedRecords";
import { OrganizationOwnerTools } from "./owner-tools";

export default async function BusinessWorkspacePage({
  params,
}: {
  params: Promise<{ publicId: string }>;
}) {
  const { publicId } = await params;
  const { session, summary } = await requireCompletedOnboarding(ACCOUNT_PATHS.business(publicId));
  const organization = await getOrganizationByPublicId(publicId);
  if (!organization) {
    notFound();
  }
  const membership = summary.organizations.find((item) => item.publicId === publicId);
  const isOwner = membership?.role === "owner";
  const [members, invitations, work, commercial] = await Promise.all([
    listOrganizationMembers(organization.id),
    isOwner ? listOrganizationInvitations(organization.id) : Promise.resolve([]),
    listOrganizationWork(organization.id),
    listOrganizationCommercial(organization.id),
  ]);

  return (
    <main>
      <PageHeader
        eyebrow={organization.publicId}
        title={organization.name}
        description={`Your role: ${membership?.role ?? "member"}`}
      />
      {organization.website ? (
        <p className="mt-2 text-sm">
          <a href={organization.website} className="font-semibold text-blue" rel="noreferrer">
            Website
          </a>
        </p>
      ) : null}
      {organization.country ? <p className="mt-2 text-sm text-muted">{organization.country}</p> : null}
      {organization.description ? (
        <p className="mt-4 whitespace-pre-wrap text-[15px]">{organization.description}</p>
      ) : null}

      <RelatedRecords
        title="Work requests"
        empty="No organization requests yet."
        items={work.requests.map((item) => ({
          href: WORK_REQUEST_PATHS.detail(item.publicId),
          reference: item.publicId,
          title: item.title,
          status: item.status,
          statusLabel:
            WORK_REQUEST_STATUS_LABELS[item.status as keyof typeof WORK_REQUEST_STATUS_LABELS] ??
            item.status,
        }))}
      />
      <RelatedRecords
        title="Quotes"
        empty="No organization quotes yet."
        items={work.quotes.map((item) => ({
          href: QUOTE_PATHS.detail(item.publicId),
          reference: item.publicId,
          title: item.publicId,
          status: item.status,
          statusLabel: QUOTE_STATUS_LABELS[item.status as QuoteStatus] ?? item.status,
        }))}
      />
      <RelatedRecords
        title="Projects"
        empty="No organization projects yet."
        items={work.projects.map((item) => ({
          href: PROJECT_PATHS.detail(item.publicId),
          reference: item.publicId,
          title: item.name,
          status: item.status,
          statusLabel:
            PROJECT_STATUS_LABELS[item.status as keyof typeof PROJECT_STATUS_LABELS] ?? item.status,
        }))}
      />
      <RelatedRecords
        title="Contracts / SOW"
        empty="No contracts yet."
        items={work.contracts.map((item) => ({
          reference: item.publicId,
          title: item.title,
          status: item.status,
          statusLabel:
            CONTRACT_STATUS_LABELS[item.status as ContractStatus] ?? item.status,
        }))}
      />
      <RelatedRecords
        title="Orders"
        empty="No store orders for this organization."
        items={commercial.orders.map((item) => ({
          href: STORE_PATHS.order(item.publicId),
          reference: item.publicId,
          title: formatMinor(item.totalMinor, item.currency),
          status: item.status,
          statusLabel: ORDER_STATUS_LABELS[item.status as OrderStatus] ?? item.status,
          meta: formatDisplayDate(item.createdAt),
        }))}
      />
      <RelatedRecords
        title="Invoices"
        empty="No invoices for this organization."
        items={commercial.invoices.map((item) => ({
          href: INVOICE_PATHS.detail(item.publicId),
          reference: item.invoiceNumber ?? item.publicId,
          title: formatMinor(item.totalMinor, item.currency),
          status: item.status,
          statusLabel: INVOICE_STATUS_LABELS[item.status as InvoiceStatus] ?? item.status,
          meta: item.issueDate ? formatDisplayDate(item.issueDate) : undefined,
        }))}
      />
      <RelatedRecords
        title="Receipts"
        empty="No receipts for this organization."
        items={commercial.receipts.map((item) => ({
          href: RECEIPT_PATHS.detail(item.publicId),
          reference: item.receiptNumber,
          title: formatMinor(item.amountMinor, item.currency),
          meta: formatDisplayDate(item.issuedAt),
        }))}
      />

      {isOwner ? (
        <OrganizationOwnerTools
          organizationPublicId={organization.publicId}
          name={organization.name}
          website={organization.website}
          country={organization.country}
          description={organization.description}
          members={members}
          invitations={invitations}
          currentUserId={session.userId}
        />
      ) : (
        <RelatedRecords
          title="Members"
          empty="No members to show."
          items={members.map((member) => ({
            title: member.displayName,
            status: member.role,
            statusLabel: member.role === "owner" ? "Owner" : "Member",
          }))}
        />
      )}
      <p className="mt-8 text-sm">
        <Link href={ACCOUNT_PATHS.relationships} className="font-semibold text-blue">
          Back to relationships
        </Link>
      </p>
    </main>
  );
}
