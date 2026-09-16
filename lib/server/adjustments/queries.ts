import { createSessionSupabaseClient } from "@/lib/supabase/server";
import { asMinor } from "@/modules/invoices/money";
import { INVOICE_CURRENCIES, type InvoiceCurrency } from "@/modules/invoices";
import { listRange } from "@/lib/server/pagination";
import {
  ADJUSTMENT_KINDS,
  ADJUSTMENT_STATUSES,
  type AdjustmentKind,
  type AdjustmentStatus,
} from "@/modules/adjustments";

export type AdjustmentDetail = {
  id: string;
  publicId: string;
  kind: AdjustmentKind;
  amountMinor: number;
  currency: InvoiceCurrency;
  reason: string;
  status: AdjustmentStatus;
  paymentPublicId: string | null;
  invoicePublicId: string | null;
  createdAt: string;
};

function isCurrency(value: string): value is InvoiceCurrency {
  return INVOICE_CURRENCIES.includes(value as InvoiceCurrency);
}

function isKind(value: string): value is AdjustmentKind {
  return (ADJUSTMENT_KINDS as readonly string[]).includes(value);
}

function isStatus(value: string): value is AdjustmentStatus {
  return (ADJUSTMENT_STATUSES as readonly string[]).includes(value);
}

export async function listAdjustments(page = 1): Promise<AdjustmentDetail[]> {
  const supabase = await createSessionSupabaseClient();
  if (!supabase) {
    return [];
  }
  const { from, to } = listRange(page);
  const { data } = await supabase
    .from("financial_adjustments")
    .select(
      "id, public_id, kind, amount_minor, currency, reason, status, payment_id, invoice_id, created_at",
    )
    .order("created_at", { ascending: false })
    .range(from, to);
  const items: AdjustmentDetail[] = [];
  for (const row of data ?? []) {
    if (!isCurrency(row.currency) || !isKind(row.kind) || !isStatus(row.status)) {
      continue;
    }
    const [payment, invoice] = await Promise.all([
      row.payment_id
        ? supabase.from("payments").select("public_id").eq("id", row.payment_id).maybeSingle()
        : Promise.resolve({ data: null }),
      row.invoice_id
        ? supabase.from("invoices").select("public_id").eq("id", row.invoice_id).maybeSingle()
        : Promise.resolve({ data: null }),
    ]);
    items.push({
      id: row.id,
      publicId: row.public_id,
      kind: row.kind,
      amountMinor: asMinor(row.amount_minor),
      currency: row.currency,
      reason: row.reason,
      status: row.status,
      paymentPublicId: payment.data?.public_id ?? null,
      invoicePublicId: invoice.data?.public_id ?? null,
      createdAt: row.created_at,
    });
  }
  return items;
}

export async function getAdjustmentByPublicId(
  publicId: string,
): Promise<AdjustmentDetail | null> {
  const supabase = await createSessionSupabaseClient();
  if (!supabase) {
    return null;
  }
  const { data } = await supabase
    .from("financial_adjustments")
    .select(
      "id, public_id, kind, amount_minor, currency, reason, status, payment_id, invoice_id, created_at",
    )
    .eq("public_id", publicId)
    .maybeSingle();
  if (!data || !isCurrency(data.currency) || !isKind(data.kind) || !isStatus(data.status)) {
    return null;
  }
  const [payment, invoice] = await Promise.all([
    data.payment_id
      ? supabase.from("payments").select("public_id").eq("id", data.payment_id).maybeSingle()
      : Promise.resolve({ data: null }),
    data.invoice_id
      ? supabase.from("invoices").select("public_id").eq("id", data.invoice_id).maybeSingle()
      : Promise.resolve({ data: null }),
  ]);
  return {
    id: data.id,
    publicId: data.public_id,
    kind: data.kind,
    amountMinor: asMinor(data.amount_minor),
    currency: data.currency,
    reason: data.reason,
    status: data.status,
    paymentPublicId: payment.data?.public_id ?? null,
    invoicePublicId: invoice.data?.public_id ?? null,
    createdAt: data.created_at,
  };
}
