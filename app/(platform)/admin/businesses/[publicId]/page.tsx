import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePlatformAdmin } from "@/lib/server/auth";
import { ADMIN_PATHS } from "@/modules/account";
import {
  getOrganizationByPublicId,
  listOrganizationMembers,
  listOrganizationWork,
  listOrganizationCommercial,
} from "@/lib/server/organizations/queries";
import { WORK_REQUEST_PATHS, WORK_REQUEST_STATUS_LABELS } from "@/modules/work-requests";
import { PROJECT_PATHS, PROJECT_STATUS_LABELS } from "@/modules/projects";
import { QUOTE_PATHS, QUOTE_STATUS_LABELS, type QuoteStatus } from "@/modules/quotes";
import { STORE_PATHS, ORDER_STATUS_LABELS, type OrderStatus } from "@/modules/store";
import { INVOICE_PATHS, INVOICE_STATUS_LABELS, type InvoiceStatus } from "@/modules/invoices";
import { RECEIPT_PATHS } from "@/modules/receipts";
import { PAYMENT_PATHS, PAYMENT_STATUS_LABELS, type PaymentStatus } from "@/modules/payments";
import { CONTRACT_STATUS_LABELS, type ContractStatus } from "@/modules/contracts";
import { formatMinor } from "@/modules/invoices/money";
import { formatDisplayDate } from "@/lib/format/display";
import { PageHeader } from "@/components/platform/PageHeader";
import { RelatedRecords } from "@/components/platform/RelatedRecords";

export default async function AdminBusinessDetailPage({
  params,
}: {
  params: Promise<{ publicId: string }>;
}) {
  const { publicId } = await params;
  await requirePlatformAdmin(ADMIN_PATHS.business(publicId));
  const organization = await getOrganizationByPublicId(publicId);
  if (!organization) {
    notFound();
  }
  const [members, work, commercial] = await Promise.all([
    listOrganizationMembers(organization.id),
    listOrganizationWork(organization.id),
    listOrganizationCommercial(organization.id),
  ]);

  return (
    <main>
      <PageHeader
        eyebrow={organization.publicId}
        title={organization.name}
        description={[organization.website, organization.country].filter(Boolean).join(" · ") || undefined}
      />
      {organization.description ? <p className="mt-4 text-[15px]">{organization.description}</p> : null}
      <RelatedRecords
        title="Members"
        empty="No members."
        items={members.map((member) => ({
          title: member.displayName,
          status: member.role,
          statusLabel: member.role === "owner" ? "Owner" : "Member",
        }))}
      />
      <RelatedRecords
        title="Requests"
        empty="No requests."
        items={work.requests.map((item) => ({
          href: WORK_REQUEST_PATHS.adminDetail(item.publicId),
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
        empty="No quotes."
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
        empty="No projects."
        items={work.projects.map((item) => ({
          href: PROJECT_PATHS.adminDetail(item.publicId),
          reference: item.publicId,
          title: item.name,
          status: item.status,
          statusLabel:
            PROJECT_STATUS_LABELS[item.status as keyof typeof PROJECT_STATUS_LABELS] ?? item.status,
        }))}
      />
      <RelatedRecords
        title="Contracts / SOW"
        empty="No contracts."
        items={work.contracts.map((item) => ({
          reference: item.publicId,
          title: item.title,
          status: item.status,
          statusLabel: CONTRACT_STATUS_LABELS[item.status as ContractStatus] ?? item.status,
        }))}
      />
      <RelatedRecords
        title="Orders"
        empty="No store orders."
        items={commercial.orders.map((item) => ({
          href: STORE_PATHS.adminOrder(item.publicId),
          reference: item.publicId,
          title: formatMinor(item.totalMinor, item.currency),
          status: item.status,
          statusLabel: ORDER_STATUS_LABELS[item.status as OrderStatus] ?? item.status,
          meta: formatDisplayDate(item.createdAt),
        }))}
      />
      <RelatedRecords
        title="Invoices"
        empty="No invoices."
        items={commercial.invoices.map((item) => ({
          href: INVOICE_PATHS.adminDetail(item.publicId),
          reference: item.invoiceNumber ?? item.publicId,
          title: formatMinor(item.totalMinor, item.currency),
          status: item.status,
          statusLabel: INVOICE_STATUS_LABELS[item.status as InvoiceStatus] ?? item.status,
        }))}
      />
      <RelatedRecords
        title="Payments"
        empty="No recorded payments."
        items={commercial.payments.map((item) => ({
          href: PAYMENT_PATHS.adminDetail(item.publicId),
          reference: item.publicId,
          title: formatMinor(item.amountMinor, item.currency),
          status: item.status,
          statusLabel:
            PAYMENT_STATUS_LABELS[item.status as PaymentStatus] ??
            (item.reviewRequired ? "Needs review" : item.status),
        }))}
      />
      <RelatedRecords
        title="Receipts"
        empty="No receipts."
        items={commercial.receipts.map((item) => ({
          href: RECEIPT_PATHS.adminDetail(item.publicId),
          reference: item.receiptNumber,
          title: formatMinor(item.amountMinor, item.currency),
          meta: formatDisplayDate(item.issuedAt),
        }))}
      />
      <p className="mt-8 text-sm">
        <Link href={ADMIN_PATHS.businesses} className="font-semibold text-blue">
          Back to organizations
        </Link>
      </p>
    </main>
  );
}
