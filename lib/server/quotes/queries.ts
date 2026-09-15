import { createSessionSupabaseClient } from "@/lib/supabase/server";
import { asMinor } from "@/modules/invoices/money";
import type { QuoteCurrency, QuoteStatus } from "@/modules/quotes";

export type QuoteLine = {
  position: number;
  description: string;
  quantity: number;
  unitAmountMinor: number;
  lineTotalMinor: number;
};

export type QuoteDetail = {
  id: string;
  publicId: string;
  workRequestId: string;
  workRequestPublicId: string;
  version: number;
  currency: QuoteCurrency;
  subtotalMinor: number;
  taxMinor: number;
  totalMinor: number;
  status: QuoteStatus;
  validUntil: string | null;
  customerNotes: string | null;
  acceptedAt: string | null;
  rejectedAt: string | null;
  createdAt: string;
  lines: QuoteLine[];
};

const CURRENCIES: QuoteCurrency[] = ["GBP", "USD", "EUR"];
const STATUSES: QuoteStatus[] = [
  "draft",
  "sent",
  "accepted",
  "rejected",
  "expired",
  "superseded",
];

function isCurrency(value: string): value is QuoteCurrency {
  return CURRENCIES.includes(value as QuoteCurrency);
}

function isStatus(value: string): value is QuoteStatus {
  return STATUSES.includes(value as QuoteStatus);
}

export async function listQuotesForWorkRequest(
  workRequestId: string,
): Promise<QuoteDetail[]> {
  const supabase = await createSessionSupabaseClient();
  if (!supabase) {
    return [];
  }

  const { data } = await supabase
    .from("quotes")
    .select(
      "id, public_id, work_request_id, version, currency, subtotal_minor, tax_minor, total_minor, status, valid_until, customer_notes, accepted_at, rejected_at, created_at",
    )
    .eq("work_request_id", workRequestId)
    .order("version", { ascending: false });

  const quotes = (data ?? []).flatMap((row) => mapQuote(row, ""));
  const withRequests = await Promise.all(
    quotes.map(async (quote) => {
      const lines = await listQuoteLines(quote.id);
      return { ...quote, lines };
    }),
  );
  return withRequests;
}

export async function getQuoteByPublicId(
  publicId: string,
): Promise<QuoteDetail | null> {
  const supabase = await createSessionSupabaseClient();
  if (!supabase) {
    return null;
  }

  const { data } = await supabase
    .from("quotes")
    .select(
      "id, public_id, work_request_id, version, currency, subtotal_minor, tax_minor, total_minor, status, valid_until, customer_notes, accepted_at, rejected_at, created_at",
    )
    .eq("public_id", publicId)
    .maybeSingle();

  if (!data) {
    return null;
  }

  const { data: request } = await supabase
    .from("work_requests")
    .select("public_id")
    .eq("id", data.work_request_id)
    .maybeSingle();

  const mapped = mapQuote(data, request?.public_id ?? "");
  if (!mapped[0]) {
    return null;
  }
  const lines = await listQuoteLines(mapped[0].id);
  return { ...mapped[0], lines };
}

async function listQuoteLines(quoteId: string): Promise<QuoteLine[]> {
  const supabase = await createSessionSupabaseClient();
  if (!supabase) {
    return [];
  }
  const { data } = await supabase
    .from("quote_line_items")
    .select("position, description, quantity, unit_amount_minor, line_total_minor")
    .eq("quote_id", quoteId)
    .order("position");

  return (data ?? []).map((row) => ({
    position: row.position,
    description: row.description,
    quantity: row.quantity,
    unitAmountMinor: asMinor(row.unit_amount_minor),
    lineTotalMinor: asMinor(row.line_total_minor),
  }));
}

function mapQuote(
  row: {
    id: string;
    public_id: string;
    work_request_id: string;
    version: number;
    currency: string;
    subtotal_minor: number;
    tax_minor: number;
    total_minor: number;
    status: string;
    valid_until: string | null;
    customer_notes: string | null;
    accepted_at: string | null;
    rejected_at: string | null;
    created_at: string;
  },
  workRequestPublicId: string,
): QuoteDetail[] {
  if (!isCurrency(row.currency) || !isStatus(row.status)) {
    return [];
  }
  return [
    {
      id: row.id,
      publicId: row.public_id,
      workRequestId: row.work_request_id,
      workRequestPublicId,
      version: row.version,
      currency: row.currency,
      subtotalMinor: asMinor(row.subtotal_minor),
      taxMinor: asMinor(row.tax_minor),
      totalMinor: asMinor(row.total_minor),
      status: row.status,
      validUntil: row.valid_until,
      customerNotes: row.customer_notes,
      acceptedAt: row.accepted_at,
      rejectedAt: row.rejected_at,
      createdAt: row.created_at,
      lines: [],
    },
  ];
}
