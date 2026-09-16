import { createSessionSupabaseClient } from "@/lib/supabase/server";
import { asMinor } from "@/modules/invoices/money";
import { INVOICE_CURRENCIES, type InvoiceCurrency } from "@/modules/invoices";
import { listRange } from "@/lib/server/pagination";
import { CREDIT_NOTE_STATUSES, type CreditNoteStatus } from "@/modules/credit-notes";

export type CreditNoteDetail = {
  id: string;
  publicId: string;
  creditNoteNumber: string | null;
  invoicePublicId: string;
  amountMinor: number;
  currency: InvoiceCurrency;
  reason: string;
  notes: string | null;
  status: CreditNoteStatus;
  issuedAt: string | null;
  createdAt: string;
};

function isCurrency(value: string): value is InvoiceCurrency {
  return INVOICE_CURRENCIES.includes(value as InvoiceCurrency);
}

function isStatus(value: string): value is CreditNoteStatus {
  return (CREDIT_NOTE_STATUSES as readonly string[]).includes(value);
}

async function mapRow(row: {
  id: string;
  public_id: string;
  credit_note_number: string | null;
  invoice_id: string;
  amount_minor: number | string;
  currency: string;
  reason: string;
  notes: string | null;
  status: string;
  issued_at: string | null;
  created_at: string;
}): Promise<CreditNoteDetail | null> {
  if (!isCurrency(row.currency) || !isStatus(row.status)) {
    return null;
  }
  const supabase = await createSessionSupabaseClient();
  if (!supabase) {
    return null;
  }
  const { data: invoice } = await supabase
    .from("invoices")
    .select("public_id")
    .eq("id", row.invoice_id)
    .maybeSingle();
  return {
    id: row.id,
    publicId: row.public_id,
    creditNoteNumber: row.credit_note_number,
    invoicePublicId: invoice?.public_id ?? "",
    amountMinor: asMinor(row.amount_minor),
    currency: row.currency,
    reason: row.reason,
    notes: row.notes,
    status: row.status,
    issuedAt: row.issued_at,
    createdAt: row.created_at,
  };
}

const COLUMNS =
  "id, public_id, credit_note_number, invoice_id, amount_minor, currency, reason, notes, status, issued_at, created_at";

export async function listCreditNotes(page = 1): Promise<CreditNoteDetail[]> {
  const supabase = await createSessionSupabaseClient();
  if (!supabase) {
    return [];
  }
  const { from, to } = listRange(page);
  const { data } = await supabase
    .from("credit_notes")
    .select(COLUMNS)
    .order("created_at", { ascending: false })
    .range(from, to);
  const mapped = await Promise.all((data ?? []).map((row) => mapRow(row)));
  return mapped.filter((item): item is CreditNoteDetail => item !== null);
}

export async function getCreditNoteByPublicId(
  publicId: string,
): Promise<CreditNoteDetail | null> {
  const supabase = await createSessionSupabaseClient();
  if (!supabase) {
    return null;
  }
  const { data } = await supabase.from("credit_notes").select(COLUMNS).eq("public_id", publicId).maybeSingle();
  return data ? mapRow(data) : null;
}

export async function listIssuedCreditNotesForInvoice(invoiceId: string): Promise<CreditNoteDetail[]> {
  const supabase = await createSessionSupabaseClient();
  if (!supabase) {
    return [];
  }
  const { data } = await supabase
    .from("credit_notes")
    .select(COLUMNS)
    .eq("invoice_id", invoiceId)
    .eq("status", "issued")
    .order("issued_at");
  const mapped = await Promise.all((data ?? []).map((row) => mapRow(row)));
  return mapped.filter((item): item is CreditNoteDetail => item !== null);
}
