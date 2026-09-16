import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePlatformAdmin } from "@/lib/server/auth";
import { getAdminCustomerByPublicId } from "@/lib/server/admin/queries";
import { createSessionSupabaseClient } from "@/lib/supabase/server";
import { ADMIN_PATHS } from "@/modules/account";
import { WORK_REQUEST_PATHS, WORK_REQUEST_STATUS_LABELS } from "@/modules/work-requests";
import { PROJECT_PATHS, PROJECT_STATUS_LABELS } from "@/modules/projects";
import { QUOTE_PATHS, QUOTE_STATUS_LABELS, type QuoteStatus } from "@/modules/quotes";
import { STORE_PATHS, ORDER_STATUS_LABELS, type OrderStatus } from "@/modules/store";
import { INVOICE_PATHS, INVOICE_STATUS_LABELS, type InvoiceStatus } from "@/modules/invoices";
import { RECEIPT_PATHS } from "@/modules/receipts";
import { formatMinor, asMinor } from "@/modules/invoices/money";
import { formatDisplayDate } from "@/lib/format/display";
import { PageHeader } from "@/components/platform/PageHeader";
import { RelatedRecords } from "@/components/platform/RelatedRecords";

export default async function AdminCustomerDetailPage({
  params,
}: {
  params: Promise<{ publicId: string }>;
}) {
  const { publicId } = await params;
  await requirePlatformAdmin(ADMIN_PATHS.customer(publicId));
  const customer = await getAdminCustomerByPublicId(publicId);
  if (!customer) {
    notFound();
  }
  const supabase = await createSessionSupabaseClient();
  if (!supabase) {
    notFound();
  }
  const [
    { data: requests },
    { data: projects },
    { data: memberships },
    { data: developer },
    { data: orders },
    { data: invoices },
    { data: receipts },
  ] = await Promise.all([
    supabase
      .from("work_requests")
      .select("id, public_id, title, status")
      .eq("individual_user_id", customer.userId)
      .order("created_at", { ascending: false }),
    supabase
      .from("projects")
      .select("id, public_id, name, status")
      .eq("individual_user_id", customer.userId)
      .order("created_at", { ascending: false }),
    supabase
      .from("organization_memberships")
      .select("role, organization_id")
      .eq("user_id", customer.userId),
    supabase
      .from("developer_profiles")
      .select("public_id, display_name")
      .eq("user_id", customer.userId)
      .maybeSingle(),
    supabase
      .from("store_orders")
      .select("public_id, status, currency, total_minor, created_at")
      .eq("individual_user_id", customer.userId)
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("invoices")
      .select("public_id, invoice_number, status, currency, total_minor")
      .eq("individual_user_id", customer.userId)
      .neq("status", "draft")
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("receipts")
      .select("public_id, receipt_number, currency, amount_minor, issued_at")
      .eq("individual_user_id", customer.userId)
      .order("issued_at", { ascending: false })
      .limit(50),
  ]);
  const requestIds = (requests ?? []).map((row) => row.id);
  const { data: quotes } =
    requestIds.length > 0
      ? await supabase.from("quotes").select("public_id, status").in("work_request_id", requestIds)
      : { data: [] };
  const orgIds = (memberships ?? []).map((row) => row.organization_id);
  const { data: organizations } =
    orgIds.length > 0
      ? await supabase.from("organizations").select("public_id, name").in("id", orgIds)
      : { data: [] };

  return (
    <main>
      <PageHeader
        eyebrow={customer.publicId}
        title={customer.displayName}
        description={`Individual relationship since ${formatDisplayDate(customer.createdAt)}`}
      />
      <RelatedRecords
        title="Relationships"
        empty="Individual customer only."
        items={[
          { title: "Individual customer", status: "individual", statusLabel: "Individual" },
          ...(organizations ?? []).map((organization) => ({
            href: ADMIN_PATHS.business(organization.public_id),
            title: organization.name,
            reference: organization.public_id,
          })),
          ...(developer
            ? [
                {
                  href: ADMIN_PATHS.developer(developer.public_id),
                  title: `Developer · ${developer.display_name}`,
                  reference: developer.public_id,
                },
              ]
            : []),
        ]}
      />
      <RelatedRecords
        title="Requests"
        empty="No requests."
        items={(requests ?? []).map((request) => ({
          href: WORK_REQUEST_PATHS.adminDetail(request.public_id),
          reference: request.public_id,
          title: request.title,
          status: request.status,
          statusLabel:
            WORK_REQUEST_STATUS_LABELS[request.status as keyof typeof WORK_REQUEST_STATUS_LABELS] ??
            request.status,
        }))}
      />
      <RelatedRecords
        title="Quotes"
        empty="No quotes."
        items={(quotes ?? []).map((quote) => ({
          href: QUOTE_PATHS.detail(quote.public_id),
          reference: quote.public_id,
          title: quote.public_id,
          status: quote.status,
          statusLabel: QUOTE_STATUS_LABELS[quote.status as QuoteStatus] ?? quote.status,
        }))}
      />
      <RelatedRecords
        title="Projects"
        empty="No projects."
        items={(projects ?? []).map((project) => ({
          href: PROJECT_PATHS.adminDetail(project.public_id),
          reference: project.public_id,
          title: project.name,
          status: project.status,
          statusLabel:
            PROJECT_STATUS_LABELS[project.status as keyof typeof PROJECT_STATUS_LABELS] ??
            project.status,
        }))}
      />
      <RelatedRecords
        title="Orders"
        empty="No store orders."
        items={(orders ?? []).map((order) => ({
          href: STORE_PATHS.adminOrder(order.public_id),
          reference: order.public_id,
          title: formatMinor(asMinor(order.total_minor), order.currency),
          status: order.status,
          statusLabel: ORDER_STATUS_LABELS[order.status as OrderStatus] ?? order.status,
          meta: formatDisplayDate(order.created_at),
        }))}
      />
      <RelatedRecords
        title="Invoices"
        empty="No invoices."
        items={(invoices ?? []).map((invoice) => ({
          href: INVOICE_PATHS.adminDetail(invoice.public_id),
          reference: invoice.invoice_number ?? invoice.public_id,
          title: formatMinor(asMinor(invoice.total_minor), invoice.currency),
          status: invoice.status,
          statusLabel: INVOICE_STATUS_LABELS[invoice.status as InvoiceStatus] ?? invoice.status,
        }))}
      />
      <RelatedRecords
        title="Receipts"
        empty="No receipts."
        items={(receipts ?? []).map((receipt) => ({
          href: RECEIPT_PATHS.adminDetail(receipt.public_id),
          reference: receipt.receipt_number,
          title: formatMinor(asMinor(receipt.amount_minor), receipt.currency),
          meta: formatDisplayDate(receipt.issued_at),
        }))}
      />
      <p className="mt-8 text-sm">
        <Link href={ADMIN_PATHS.customers} className="font-semibold text-blue">
          Back to customers
        </Link>
      </p>
    </main>
  );
}
