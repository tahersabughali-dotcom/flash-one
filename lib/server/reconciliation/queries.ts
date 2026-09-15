import { createSessionSupabaseClient } from "@/lib/supabase/server";
import { asMinor } from "@/modules/invoices/money";
import { listRange } from "@/lib/server/pagination";
import {
  RECONCILIATION_STATUSES,
  type ReconciliationStatus,
} from "@/modules/reconciliation";

export type ReconciliationItem = {
  id: string;
  publicId: string;
  sourceType: string;
  currency: string;
  amountMinor: number;
  status: ReconciliationStatus;
  notes: string | null;
  matchedPaymentPublicId: string | null;
  occurredAt: string;
  reconciledAt: string | null;
};

function isStatus(value: string): value is ReconciliationStatus {
  return RECONCILIATION_STATUSES.includes(value as ReconciliationStatus);
}

export async function listReconciliationItems(page = 1): Promise<ReconciliationItem[]> {
  const supabase = await createSessionSupabaseClient();
  if (!supabase) {
    return [];
  }
  const { from, to } = listRange(page);
  const { data } = await supabase
    .from("reconciliation_items")
    .select(
      "id, public_id, source_type, currency, amount_minor, status, notes, matched_payment_id, occurred_at, reconciled_at",
    )
    .order("created_at", { ascending: false })
    .range(from, to);
  const items: ReconciliationItem[] = [];
  for (const row of data ?? []) {
    if (!isStatus(row.status)) {
      continue;
    }
    let matchedPaymentPublicId: string | null = null;
    if (row.matched_payment_id) {
      const { data: payment } = await supabase
        .from("payments")
        .select("public_id")
        .eq("id", row.matched_payment_id)
        .maybeSingle();
      matchedPaymentPublicId = payment?.public_id ?? null;
    }
    items.push({
      id: row.id,
      publicId: row.public_id,
      sourceType: row.source_type,
      currency: row.currency,
      amountMinor: asMinor(row.amount_minor),
      status: row.status,
      notes: row.notes,
      matchedPaymentPublicId,
      occurredAt: row.occurred_at,
      reconciledAt: row.reconciled_at,
    });
  }
  return items;
}
