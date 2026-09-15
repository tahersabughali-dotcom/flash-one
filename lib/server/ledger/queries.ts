import { createSessionSupabaseClient } from "@/lib/supabase/server";
import { asMinor } from "@/modules/invoices/money";

export type LedgerEntry = {
  publicId: string;
  eventType: string;
  currency: string;
  amountMinor: number;
  direction: string;
  occurredAt: string;
  sourceReference: string | null;
};

export async function listLedgerEntries(): Promise<LedgerEntry[]> {
  const supabase = await createSessionSupabaseClient();
  if (!supabase) {
    return [];
  }
  const { data } = await supabase
    .from("financial_ledger_entries")
    .select(
      "public_id, event_type, currency, amount_minor, direction, occurred_at, source_reference",
    )
    .order("occurred_at", { ascending: false });
  return (data ?? []).map((row) => ({
    publicId: row.public_id,
    eventType: row.event_type,
    currency: row.currency,
    amountMinor: asMinor(row.amount_minor),
    direction: row.direction,
    occurredAt: row.occurred_at,
    sourceReference: row.source_reference,
  }));
}
