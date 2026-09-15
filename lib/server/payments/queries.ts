import { createSessionSupabaseClient } from "@/lib/supabase/server";
import { INVOICE_CURRENCIES, type InvoiceCurrency } from "@/modules/invoices";
import { asMinor } from "@/modules/invoices/money";
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
  status: PaymentStatus;
  sourceType: string;
  provider: string | null;
  providerReference: string | null;
  reviewRequired: boolean;
  receivedAt: string | null;
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
  review_required: boolean;
  received_at: string | null;
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
  const { data: allocated } = await supabase.rpc("payment_allocated_minor", {
    p_payment_id: row.id,
  });
  const amountMinor = asMinor(row.amount_minor);
  const allocatedMinor = asMinor(allocated ?? 0);
  return {
    id: row.id,
    publicId: row.public_id,
    currency: row.currency,
    amountMinor,
    allocatedMinor,
    unallocatedMinor: Math.max(0, amountMinor - allocatedMinor),
    status: row.status,
    sourceType: row.source_type,
    provider: row.provider,
    providerReference: row.provider_reference,
    reviewRequired: row.review_required,
    receivedAt: row.received_at,
    customerLabel: row.guest_email ? `Guest · ${row.guest_email}` : await customerLabel(row),
  };
}

const PAYMENT_COLUMNS =
  "id, public_id, currency, amount_minor, status, source_type, provider, provider_reference, review_required, received_at, individual_user_id, organization_id, guest_email";

export async function listPayments(): Promise<PaymentDetail[]> {
  const supabase = await createSessionSupabaseClient();
  if (!supabase) {
    return [];
  }
  const { data } = await supabase
    .from("payments")
    .select(PAYMENT_COLUMNS)
    .order("created_at", { ascending: false });
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
