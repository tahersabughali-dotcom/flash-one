import { createSessionSupabaseClient } from "@/lib/supabase/server";
import {
  INVOICE_CURRENCIES,
  INVOICE_STATUSES,
  type InvoiceCurrency,
  type InvoiceStatus,
} from "@/modules/invoices";
import { asMinor } from "@/modules/invoices/money";
import { listRange } from "@/lib/server/pagination";

export type InvoiceLine = {
  position: number;
  description: string;
  quantity: number;
  unitAmountMinor: number;
  lineTotalMinor: number;
};

export type InvoiceDetail = {
  id: string;
  publicId: string;
  invoiceNumber: string | null;
  currency: InvoiceCurrency;
  status: InvoiceStatus;
  displayStatus: InvoiceStatus | "overdue";
  subtotalMinor: number;
  taxMinor: number;
  totalMinor: number;
  amountPaidMinor: number;
  amountDueMinor: number;
  issueDate: string | null;
  dueDate: string | null;
  issuedAt: string | null;
  paidAt: string | null;
  voidedAt: string | null;
  voidReason: string | null;
  notes: string | null;
  quotePublicId: string | null;
  projectPublicId: string | null;
  contractPublicId: string | null;
  individualUserId: string | null;
  organizationId: string | null;
  customerLabel: string;
  lines: InvoiceLine[];
};

function isCurrency(value: string): value is InvoiceCurrency {
  return INVOICE_CURRENCIES.includes(value as InvoiceCurrency);
}

function isStatus(value: string): value is InvoiceStatus {
  return INVOICE_STATUSES.includes(value as InvoiceStatus);
}

export function displayInvoiceStatus(
  status: InvoiceStatus,
  dueDate: string | null,
  amountDueMinor: number,
): InvoiceStatus | "overdue" {
  if (
    (status === "issued" || status === "partially_paid") &&
    dueDate &&
    amountDueMinor > 0
  ) {
    const today = new Date().toISOString().slice(0, 10);
    if (dueDate < today) {
      return "overdue";
    }
  }
  return status;
}

type InvoiceRow = {
  id: string;
  public_id: string;
  invoice_number: string | null;
  currency: string;
  status: string;
  subtotal_minor: number | string;
  tax_minor: number | string;
  total_minor: number | string;
  amount_paid_minor: number | string;
  issue_date: string | null;
  due_date: string | null;
  issued_at: string | null;
  paid_at: string | null;
  voided_at: string | null;
  void_reason: string | null;
  notes: string | null;
  quote_id: string | null;
  project_id: string | null;
  contract_id: string | null;
  individual_user_id: string | null;
  organization_id: string | null;
  customer_snapshot: unknown;
};

function mapInvoice(
  row: InvoiceRow,
  extras: {
    lines: InvoiceLine[];
    quotePublicId: string | null;
    projectPublicId: string | null;
    contractPublicId: string | null;
    customerLabel: string;
  },
): InvoiceDetail | null {
  if (!isCurrency(row.currency) || !isStatus(row.status)) {
    return null;
  }
  const totalMinor = asMinor(row.total_minor);
  const amountPaidMinor = asMinor(row.amount_paid_minor);
  const amountDueMinor = Math.max(0, totalMinor - amountPaidMinor);
  return {
    id: row.id,
    publicId: row.public_id,
    invoiceNumber: row.invoice_number,
    currency: row.currency,
    status: row.status,
    displayStatus: displayInvoiceStatus(row.status, row.due_date, amountDueMinor),
    subtotalMinor: asMinor(row.subtotal_minor),
    taxMinor: asMinor(row.tax_minor),
    totalMinor,
    amountPaidMinor,
    amountDueMinor,
    issueDate: row.issue_date,
    dueDate: row.due_date,
    issuedAt: row.issued_at,
    paidAt: row.paid_at,
    voidedAt: row.voided_at,
    voidReason: row.void_reason,
    notes: row.notes,
    quotePublicId: extras.quotePublicId,
    projectPublicId: extras.projectPublicId,
    contractPublicId: extras.contractPublicId,
    individualUserId: row.individual_user_id,
    organizationId: row.organization_id,
    customerLabel: extras.customerLabel,
    lines: extras.lines,
  };
}

const INVOICE_COLUMNS =
  "id, public_id, invoice_number, currency, status, subtotal_minor, tax_minor, total_minor, amount_paid_minor, issue_date, due_date, issued_at, paid_at, voided_at, void_reason, notes, quote_id, project_id, contract_id, individual_user_id, organization_id, customer_snapshot";

async function hydrateInvoice(row: InvoiceRow): Promise<InvoiceDetail | null> {
  const supabase = await createSessionSupabaseClient();
  if (!supabase) {
    return null;
  }
  const [{ data: lines }, quote, project, contract, customerLabel] = await Promise.all([
    supabase
      .from("invoice_line_items")
      .select("position, description, quantity, unit_amount_minor, line_total_minor")
      .eq("invoice_id", row.id)
      .order("position"),
    row.quote_id
      ? supabase.from("quotes").select("public_id").eq("id", row.quote_id).maybeSingle()
      : Promise.resolve({ data: null }),
    row.project_id
      ? supabase.from("projects").select("public_id").eq("id", row.project_id).maybeSingle()
      : Promise.resolve({ data: null }),
    row.contract_id
      ? supabase.from("contracts").select("public_id").eq("id", row.contract_id).maybeSingle()
      : Promise.resolve({ data: null }),
    resolveCustomerLabel(row),
  ]);

  return mapInvoice(row, {
    lines: (lines ?? []).map((line) => ({
      position: line.position,
      description: line.description,
      quantity: line.quantity,
      unitAmountMinor: asMinor(line.unit_amount_minor),
      lineTotalMinor: asMinor(line.line_total_minor),
    })),
    quotePublicId: quote.data?.public_id ?? null,
    projectPublicId: project.data?.public_id ?? null,
    contractPublicId: contract.data?.public_id ?? null,
    customerLabel,
  });
}

async function resolveCustomerLabel(row: InvoiceRow): Promise<string> {
  const snapshot =
    row.customer_snapshot && typeof row.customer_snapshot === "object"
      ? (row.customer_snapshot as { display_name?: string })
      : null;
  if (snapshot?.display_name) {
    return snapshot.display_name;
  }
  const supabase = await createSessionSupabaseClient();
  if (!supabase) {
    return "Customer";
  }
  if (row.individual_user_id) {
    const { data } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("user_id", row.individual_user_id)
      .maybeSingle();
    return data?.full_name ?? "Customer";
  }
  if (row.organization_id) {
    const { data } = await supabase
      .from("organizations")
      .select("name")
      .eq("id", row.organization_id)
      .maybeSingle();
    return data?.name ?? "Business";
  }
  return "Customer";
}

export async function listCustomerInvoices(
  userId: string,
  page = 1,
): Promise<InvoiceDetail[]> {
  const supabase = await createSessionSupabaseClient();
  if (!supabase) {
    return [];
  }
  const orgIds = await organizationIdsFor(userId);
  const { from, to } = listRange(page);
  let query = supabase
    .from("invoices")
    .select(INVOICE_COLUMNS)
    .neq("status", "draft")
    .order("created_at", { ascending: false })
    .range(from, to);
  query =
    orgIds.length > 0
      ? query.or(
          `individual_user_id.eq.${userId},organization_id.in.(${orgIds.join(",")})`,
        )
      : query.eq("individual_user_id", userId);
  const { data } = await query;
  const mapped = await Promise.all((data ?? []).map((row) => hydrateInvoice(row)));
  return mapped.filter((item): item is InvoiceDetail => item !== null);
}

export async function getCustomerInvoiceByPublicId(
  publicId: string,
  userId: string,
): Promise<InvoiceDetail | null> {
  const invoice = await getInvoiceByPublicId(publicId);
  if (!invoice || invoice.status === "draft") {
    return null;
  }
  if (invoice.individualUserId === userId) {
    return invoice;
  }
  if (invoice.organizationId) {
    const orgIds = await organizationIdsFor(userId);
    if (orgIds.includes(invoice.organizationId)) {
      return invoice;
    }
  }
  return null;
}

async function organizationIdsFor(userId: string): Promise<string[]> {
  const supabase = await createSessionSupabaseClient();
  if (!supabase) {
    return [];
  }
  const { data } = await supabase
    .from("organization_memberships")
    .select("organization_id")
    .eq("user_id", userId);
  return (data ?? []).map((row) => row.organization_id);
}

export async function listInvoices(page = 1): Promise<InvoiceDetail[]> {
  const supabase = await createSessionSupabaseClient();
  if (!supabase) {
    return [];
  }
  const { from, to } = listRange(page);
  const { data } = await supabase
    .from("invoices")
    .select(INVOICE_COLUMNS)
    .order("created_at", { ascending: false })
    .range(from, to);
  const mapped = await Promise.all((data ?? []).map((row) => hydrateInvoice(row)));
  return mapped.filter((item): item is InvoiceDetail => item !== null);
}

export async function getInvoiceByPublicId(
  publicId: string,
): Promise<InvoiceDetail | null> {
  const supabase = await createSessionSupabaseClient();
  if (!supabase) {
    return null;
  }
  const { data } = await supabase
    .from("invoices")
    .select(INVOICE_COLUMNS)
    .eq("public_id", publicId)
    .maybeSingle();
  if (!data) {
    return null;
  }
  return hydrateInvoice(data);
}

export async function listInvoiceAllocations(invoiceId: string) {
  const supabase = await createSessionSupabaseClient();
  if (!supabase) {
    return [];
  }
  const { data } = await supabase
    .from("payment_allocations")
    .select("id, amount_minor, allocated_at, payment_id")
    .eq("invoice_id", invoiceId)
    .order("allocated_at");
  const items = [];
  for (const row of data ?? []) {
    const { data: payment } = await supabase
      .from("payments")
      .select("public_id, source_type")
      .eq("id", row.payment_id)
      .maybeSingle();
    items.push({
      amountMinor: asMinor(row.amount_minor),
      allocatedAt: row.allocated_at,
      paymentPublicId: payment?.public_id ?? "",
      sourceType: payment?.source_type ?? "manual",
    });
  }
  return items;
}
