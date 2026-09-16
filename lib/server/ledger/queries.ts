import { createSessionSupabaseClient } from "@/lib/supabase/server";
import { asMinor } from "@/modules/invoices/money";
import { listRange } from "@/lib/server/pagination";
import {
  LEDGER_EVENT_TYPES,
  type LedgerEventType,
} from "@/modules/reports";

export type LedgerEntry = {
  publicId: string;
  eventType: LedgerEventType | string;
  currency: string;
  amountMinor: number;
  direction: string;
  occurredAt: string;
  sourceReference: string | null;
};

export type LedgerFilters = {
  currency?: string;
  eventType?: string;
  fromDate?: string;
  toDate?: string;
};

export async function listLedgerEntries(
  page = 1,
  filters: LedgerFilters = {},
): Promise<LedgerEntry[]> {
  const supabase = await createSessionSupabaseClient();
  if (!supabase) {
    return [];
  }
  const { from, to } = listRange(page);
  let query = supabase
    .from("financial_ledger_entries")
    .select(
      "public_id, event_type, currency, amount_minor, direction, occurred_at, source_reference",
    )
    .order("occurred_at", { ascending: false })
    .range(from, to);
  if (filters.currency) {
    query = query.eq("currency", filters.currency);
  }
  if (filters.eventType) {
    query = query.eq("event_type", filters.eventType);
  }
  if (filters.fromDate) {
    query = query.gte("occurred_at", `${filters.fromDate}T00:00:00.000Z`);
  }
  if (filters.toDate) {
    query = query.lte("occurred_at", `${filters.toDate}T23:59:59.999Z`);
  }
  const { data } = await query;
  return (data ?? []).map((row) => ({
    publicId: row.public_id,
    eventType: (LEDGER_EVENT_TYPES as readonly string[]).includes(row.event_type)
      ? (row.event_type as LedgerEventType)
      : row.event_type,
    currency: row.currency,
    amountMinor: asMinor(row.amount_minor),
    direction: row.direction,
    occurredAt: row.occurred_at,
    sourceReference: row.source_reference,
  }));
}
