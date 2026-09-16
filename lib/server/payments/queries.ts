import { createSessionSupabaseClient } from "@/lib/supabase/server";
import { INVOICE_CURRENCIES, type InvoiceCurrency } from "@/modules/invoices";
import { asMinor } from "@/modules/invoices/money";
import { listRange } from "@/lib/server/pagination";
import {
  PAYMENT_STATUSES,
  type PaymentStatus,
} from "@/modules/payments";

export type PaymentDetail = {
  id: string;
  publicId: string;
  currency: InvoiceCurrency;
  amountMinor: number;
  allocatedMinor: number;
  unallocatedMinor: number;
  refundedMinor: number;
  status: PaymentStatus;
  sourceType: string;
  provider: string | null;
  providerReference: string | null;
  notes: string | null;
  manualReference: string | null;
  paymentRequestPublicId: string | null;
  reviewRequired: boolean;
  receivedAt: string | null;
  createdAt: string;
  customerLabel: string;
};

function isCurrency(value: string): value is InvoiceCurrency {
  return INVOICE_CURRENCIES.includes(value as InvoiceCurrency);
}

function isStatus(value: string): value is PaymentStatus {
  return PAYMENT_STATUSES.includes(value as PaymentStatus);
}

async function customerLabel(row: {
  individual_user_id: string | null;
  organization_id: string | null;
}): Promise<string> {
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

async function mapPayment(row: {
  id: string;
  public_id: string;
  currency: string;
  amount_minor: number | string;
  status: string;
  source_type: string;
  provider: string | null;
  provider_reference: string | null;
  notes: string | null;
  manual_reference: string | null;
  payment_request_id: string | null;
  review_required: boolean;
  received_at: string | null;
  created_at: string;
  individual_user_id: string | null;
  organization_id: string | null;
  guest_email: string | null;
}): Promise<PaymentDetail | null> {
  if (!isCurrency(row.currency) || !isStatus(row.status)) {
    return null;
  }
  const supabase = await createSessionSupabaseClient();
  if (!supabase) {
    return null;
  }
  const [{ data: allocated }, { data: refunds }, request] = await Promise.all([
    supabase.rpc("payment_allocated_minor", { p_payment_id: row.id }),
    supabase
      .from("refunds")
      .select("amount_minor, status")
      .eq("payment_id", row.id),
    row.payment_request_id
      ? supabase
          .from("payment_requests")
          .select("public_id")
          .eq("id", row.payment_request_id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ]);
  const amountMinor = asMinor(row.amount_minor);
  const allocatedMinor = asMinor(allocated ?? 0);
  const refundedMinor = (refunds ?? [])
    .filter((item) => item.status === "recorded" || item.status === "completed_manual")
    .reduce((sum, item) => sum + asMinor(item.amount_minor), 0);
  return {
    id: row.id,
    publicId: row.public_id,
    currency: row.currency,
    amountMinor,
    allocatedMinor,
    unallocatedMinor: Math.max(0, amountMinor - allocatedMinor),
    refundedMinor,
    status: row.status,
    sourceType: row.source_type,
    provider: row.provider,
    providerReference: row.provider_reference,
    notes: row.notes,
    manualReference: row.manual_reference,
    paymentRequestPublicId: request.data?.public_id ?? null,
    reviewRequired: row.review_required,
    receivedAt: row.received_at,
    createdAt: row.created_at,
    customerLabel: row.guest_email ? `Guest · ${row.guest_email}` : await customerLabel(row),
  };
}

const PAYMENT_COLUMNS =
  "id, public_id, currency, amount_minor, status, source_type, provider, provider_reference, notes, manual_reference, payment_request_id, review_required, received_at, created_at, individual_user_id, organization_id, guest_email";

export async function listPayments(page = 1): Promise<PaymentDetail[]> {
  const supabase = await createSessionSupabaseClient();
  if (!supabase) {
    return [];
  }
  const { from, to } = listRange(page);
  const { data } = await supabase
    .from("payments")
    .select(PAYMENT_COLUMNS)
    .order("created_at", { ascending: false })
    .range(from, to);
  const mapped = await Promise.all((data ?? []).map((row) => mapPayment(row)));
  return mapped.filter((item): item is PaymentDetail => item !== null);
}

export async function getPaymentByPublicId(
  publicId: string,
): Promise<PaymentDetail | null> {
  const supabase = await createSessionSupabaseClient();
  if (!supabase) {
    return null;
  }
  const { data } = await supabase
    .from("payments")
    .select(PAYMENT_COLUMNS)
    .eq("public_id", publicId)
    .maybeSingle();
  if (!data) {
    return null;
  }
  return mapPayment(data);
}

export async function listPaymentAllocations(paymentId: string) {
  const supabase = await createSessionSupabaseClient();
  if (!supabase) {
    return [];
  }
  const { data } = await supabase
    .from("payment_allocations")
    .select("amount_minor, allocated_at, invoice_id")
    .eq("payment_id", paymentId)
    .order("allocated_at");
  const items = [];
  for (const row of data ?? []) {
    const { data: invoice } = await supabase
      .from("invoices")
      .select("public_id, invoice_number")
      .eq("id", row.invoice_id)
      .maybeSingle();
    items.push({
      amountMinor: asMinor(row.amount_minor),
      allocatedAt: row.allocated_at,
      invoicePublicId: invoice?.public_id ?? "",
      invoiceNumber: invoice?.invoice_number ?? null,
    });
  }
  return items;
}

export async function listCustomerPayments(
  userId: string,
  page = 1,
): Promise<PaymentDetail[]> {
  const supabase = await createSessionSupabaseClient();
  if (!supabase) {
    return [];
  }
  const { data: memberships } = await supabase
    .from("organization_memberships")
    .select("organization_id")
    .eq("user_id", userId);
  const orgIds = (memberships ?? []).map((row) => row.organization_id);
  const { from, to } = listRange(page);
  let query = supabase
    .from("payments")
    .select(PAYMENT_COLUMNS)
    .order("created_at", { ascending: false })
    .range(from, to);
  query =
    orgIds.length > 0
      ? query.or(`individual_user_id.eq.${userId},organization_id.in.(${orgIds.join(",")})`)
      : query.eq("individual_user_id", userId);
  const { data } = await query;
  const mapped = await Promise.all((data ?? []).map((row) => mapPayment(row)));
  return mapped.filter((item): item is PaymentDetail => item !== null);
}
