import { createSessionSupabaseClient } from "@/lib/supabase/server";
import { asMinor } from "@/modules/invoices/money";
import { INVOICE_CURRENCIES, type InvoiceCurrency } from "@/modules/invoices";
import { listRange } from "@/lib/server/pagination";
import { REFUND_STATUSES, type RefundStatus } from "@/modules/refunds";

export type RefundDetail = {
  id: string;
  publicId: string;
  paymentPublicId: string;
  amountMinor: number;
  currency: InvoiceCurrency;
  reason: string;
  status: RefundStatus;
  recordedAt: string;
  createdAt: string;
};

function isCurrency(value: string): value is InvoiceCurrency {
  return INVOICE_CURRENCIES.includes(value as InvoiceCurrency);
}

function isStatus(value: string): value is RefundStatus {
  return (REFUND_STATUSES as readonly string[]).includes(value);
}

export async function listRefunds(page = 1): Promise<RefundDetail[]> {
  const supabase = await createSessionSupabaseClient();
  if (!supabase) {
    return [];
  }
  const { from, to } = listRange(page);
  const { data } = await supabase
    .from("refunds")
    .select("id, public_id, payment_id, amount_minor, currency, reason, status, recorded_at, created_at")
    .order("created_at", { ascending: false })
    .range(from, to);
  const items: RefundDetail[] = [];
  for (const row of data ?? []) {
    if (!isCurrency(row.currency) || !isStatus(row.status)) {
      continue;
    }
    const { data: payment } = await supabase
      .from("payments")
      .select("public_id")
      .eq("id", row.payment_id)
      .maybeSingle();
    items.push({
      id: row.id,
      publicId: row.public_id,
      paymentPublicId: payment?.public_id ?? "",
      amountMinor: asMinor(row.amount_minor),
      currency: row.currency,
      reason: row.reason,
      status: row.status,
      recordedAt: row.recorded_at,
      createdAt: row.created_at,
    });
  }
  return items;
}

export async function getRefundByPublicId(publicId: string): Promise<RefundDetail | null> {
  const supabase = await createSessionSupabaseClient();
  if (!supabase) {
    return null;
  }
  const { data } = await supabase
    .from("refunds")
    .select("id, public_id, payment_id, amount_minor, currency, reason, status, recorded_at, created_at")
    .eq("public_id", publicId)
    .maybeSingle();
  if (!data || !isCurrency(data.currency) || !isStatus(data.status)) {
    return null;
  }
  const { data: payment } = await supabase
    .from("payments")
    .select("public_id")
    .eq("id", data.payment_id)
    .maybeSingle();
  return {
    id: data.id,
    publicId: data.public_id,
    paymentPublicId: payment?.public_id ?? "",
    amountMinor: asMinor(data.amount_minor),
    currency: data.currency,
    reason: data.reason,
    status: data.status,
    recordedAt: data.recorded_at,
    createdAt: data.created_at,
  };
}

export async function listRefundsForPayment(paymentId: string): Promise<RefundDetail[]> {
  const supabase = await createSessionSupabaseClient();
  if (!supabase) {
    return [];
  }
  const { data } = await supabase
    .from("refunds")
    .select("id, public_id, payment_id, amount_minor, currency, reason, status, recorded_at, created_at")
    .eq("payment_id", paymentId)
    .order("created_at", { ascending: false });
  const { data: payment } = await supabase
    .from("payments")
    .select("public_id")
    .eq("id", paymentId)
    .maybeSingle();
  return (data ?? []).flatMap((row) => {
    if (!isCurrency(row.currency) || !isStatus(row.status)) {
      return [];
    }
    return [
      {
        id: row.id,
        publicId: row.public_id,
        paymentPublicId: payment?.public_id ?? "",
        amountMinor: asMinor(row.amount_minor),
        currency: row.currency,
        reason: row.reason,
        status: row.status,
        recordedAt: row.recorded_at,
        createdAt: row.created_at,
      },
    ];
  });
}
