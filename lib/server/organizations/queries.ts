import { createSessionSupabaseClient } from "@/lib/supabase/server";
import { asMinor } from "@/modules/invoices/money";
import type { InvoiceCurrency } from "@/modules/invoices";
import type { OrderStatus } from "@/modules/store";
import { INVOICE_CURRENCIES } from "@/modules/invoices";

export type OrganizationRecord = {
  id: string;
  publicId: string;
  name: string;
  website: string | null;
  country: string | null;
  description: string | null;
};

export type OrganizationMember = {
  userId: string;
  role: "owner" | "member";
  displayName: string;
};

export type OrganizationInvitation = {
  id: string;
  publicId: string;
  invitedEmail: string;
  status: string;
  expiresAt: string;
};

export async function getOrganizationByPublicId(
  publicId: string,
): Promise<OrganizationRecord | null> {
  const supabase = await createSessionSupabaseClient();
  if (!supabase) {
    return null;
  }
  const { data } = await supabase
    .from("organizations")
    .select("id, public_id, name, website, country, description")
    .eq("public_id", publicId)
    .maybeSingle();
  if (!data) {
    return null;
  }
  return {
    id: data.id,
    publicId: data.public_id,
    name: data.name,
    website: data.website,
    country: data.country,
    description: data.description,
  };
}

export async function listOrganizationMembers(
  organizationId: string,
): Promise<OrganizationMember[]> {
  const supabase = await createSessionSupabaseClient();
  if (!supabase) {
    return [];
  }
  const { data: memberships } = await supabase
    .from("organization_memberships")
    .select("user_id, role")
    .eq("organization_id", organizationId);
  const userIds = (memberships ?? []).map((row) => row.user_id);
  const names = new Map<string, string>();
  if (userIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, full_name")
      .in("user_id", userIds);
    for (const profile of profiles ?? []) {
      names.set(profile.user_id, profile.full_name);
    }
  }
  return (memberships ?? []).flatMap((row) => {
    if (row.role !== "owner" && row.role !== "member") {
      return [];
    }
    return [
      {
        userId: row.user_id,
        role: row.role,
        displayName: names.get(row.user_id) ?? "Member",
      },
    ];
  });
}

export async function listOrganizationInvitations(
  organizationId: string,
): Promise<OrganizationInvitation[]> {
  const supabase = await createSessionSupabaseClient();
  if (!supabase) {
    return [];
  }
  const { data } = await supabase
    .from("organization_invitations")
    .select("id, public_id, invited_email, status, expires_at")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false });
  return (data ?? []).map((row) => ({
    id: row.id,
    publicId: row.public_id,
    invitedEmail: row.invited_email,
    status: row.status,
    expiresAt: row.expires_at,
  }));
}

export async function listOrganizationWork(
  organizationId: string,
): Promise<{
  requests: Array<{ publicId: string; title: string; status: string }>;
  quotes: Array<{ publicId: string; status: string }>;
  projects: Array<{ publicId: string; name: string; status: string }>;
  contracts: Array<{ publicId: string; title: string; status: string }>;
}> {
  const supabase = await createSessionSupabaseClient();
  if (!supabase) {
    return { requests: [], quotes: [], projects: [], contracts: [] };
  }
  const { data: requests } = await supabase
    .from("work_requests")
    .select("id, public_id, title, status")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false })
    .limit(50);
  const requestIds = (requests ?? []).map((row) => row.id);
  const { data: quotes } =
    requestIds.length > 0
      ? await supabase
          .from("quotes")
          .select("public_id, status, work_request_id")
          .in("work_request_id", requestIds)
      : { data: [] };
  const { data: projects } = await supabase
    .from("projects")
    .select("id, public_id, name, status")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false })
    .limit(50);
  const projectIds = (projects ?? []).map((row) => row.id);
  const { data: contracts } =
    projectIds.length > 0
      ? await supabase
          .from("contracts")
          .select("public_id, title, status")
          .in("project_id", projectIds)
      : { data: [] };
  return {
    requests: (requests ?? []).map((row) => ({
      publicId: row.public_id,
      title: row.title,
      status: row.status,
    })),
    quotes: (quotes ?? []).map((row) => ({
      publicId: row.public_id,
      status: row.status,
    })),
    projects: (projects ?? []).map((row) => ({
      publicId: row.public_id,
      name: row.name,
      status: row.status,
    })),
    contracts: (contracts ?? []).map((row) => ({
      publicId: row.public_id,
      title: row.title,
      status: row.status,
    })),
  };
}

function isCurrency(value: string): value is InvoiceCurrency {
  return INVOICE_CURRENCIES.includes(value as InvoiceCurrency);
}

export type OrganizationCommercial = {
  orders: Array<{
    publicId: string;
    status: OrderStatus;
    currency: string;
    totalMinor: number;
    createdAt: string;
  }>;
  invoices: Array<{
    publicId: string;
    invoiceNumber: string | null;
    status: string;
    currency: InvoiceCurrency;
    totalMinor: number;
    issueDate: string | null;
  }>;
  receipts: Array<{
    publicId: string;
    receiptNumber: string;
    currency: InvoiceCurrency;
    amountMinor: number;
    issuedAt: string;
  }>;
  payments: Array<{
    publicId: string;
    status: string;
    currency: InvoiceCurrency;
    amountMinor: number;
    reviewRequired: boolean;
  }>;
};

export async function listOrganizationCommercial(
  organizationId: string,
): Promise<OrganizationCommercial> {
  const empty: OrganizationCommercial = {
    orders: [],
    invoices: [],
    receipts: [],
    payments: [],
  };
  const supabase = await createSessionSupabaseClient();
  if (!supabase) {
    return empty;
  }

  const [orders, invoices, receipts, payments] = await Promise.all([
    supabase
      .from("store_orders")
      .select("public_id, status, currency, total_minor, created_at")
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("invoices")
      .select("public_id, invoice_number, status, currency, total_minor, issue_date")
      .eq("organization_id", organizationId)
      .neq("status", "draft")
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("receipts")
      .select("public_id, receipt_number, currency, amount_minor, issued_at")
      .eq("organization_id", organizationId)
      .order("issued_at", { ascending: false })
      .limit(50),
    supabase
      .from("payments")
      .select("public_id, status, currency, amount_minor, review_required")
      .eq("organization_id", organizationId)
      .order("received_at", { ascending: false })
      .limit(50),
  ]);

  return {
    orders: (orders.data ?? []).map((row) => ({
      publicId: row.public_id,
      status: row.status as OrderStatus,
      currency: row.currency,
      totalMinor: asMinor(row.total_minor),
      createdAt: row.created_at,
    })),
    invoices: (invoices.data ?? []).flatMap((row) =>
      isCurrency(row.currency)
        ? [
            {
              publicId: row.public_id,
              invoiceNumber: row.invoice_number,
              status: row.status,
              currency: row.currency,
              totalMinor: asMinor(row.total_minor),
              issueDate: row.issue_date,
            },
          ]
        : [],
    ),
    receipts: (receipts.data ?? []).flatMap((row) =>
      isCurrency(row.currency)
        ? [
            {
              publicId: row.public_id,
              receiptNumber: row.receipt_number,
              currency: row.currency,
              amountMinor: asMinor(row.amount_minor),
              issuedAt: row.issued_at,
            },
          ]
        : [],
    ),
    payments: (payments.data ?? []).flatMap((row) =>
      isCurrency(row.currency)
        ? [
            {
              publicId: row.public_id,
              status: row.status,
              currency: row.currency,
              amountMinor: asMinor(row.amount_minor),
              reviewRequired: row.review_required,
            },
          ]
        : [],
    ),
  };
}
