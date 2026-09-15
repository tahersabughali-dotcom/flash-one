import { createSessionSupabaseClient } from "@/lib/supabase/server";
import { INVOICE_CURRENCIES, type InvoiceCurrency } from "@/modules/invoices";
import { asMinor } from "@/modules/invoices/money";

export type ReceiptDetail = {
  publicId: string;
  receiptNumber: string;
  currency: InvoiceCurrency;
  amountMinor: number;
  issuedAt: string;
  receivedAt: string | null;
  sourceLabel: string;
  invoiceNumbers: string[];
  individualUserId: string | null;
  organizationId: string | null;
};

function isCurrency(value: string): value is InvoiceCurrency {
  return INVOICE_CURRENCIES.includes(value as InvoiceCurrency);
}

async function relatedInvoiceNumbers(paymentId: string): Promise<string[]> {
  const supabase = await createSessionSupabaseClient();
  if (!supabase) {
    return [];
  }
  const { data: allocations } = await supabase
    .from("payment_allocations")
    .select("invoice_id")
    .eq("payment_id", paymentId);
  const numbers: string[] = [];
  for (const allocation of allocations ?? []) {
    const { data: invoice } = await supabase
      .from("invoices")
      .select("invoice_number")
      .eq("id", allocation.invoice_id)
      .maybeSingle();
    if (invoice?.invoice_number) {
      numbers.push(invoice.invoice_number);
    }
  }
  return numbers;
}

export async function listReceipts(): Promise<ReceiptDetail[]> {
  const supabase = await createSessionSupabaseClient();
  if (!supabase) {
    return [];
  }
  const { data } = await supabase
    .from("receipts")
    .select(
      "public_id, receipt_number, currency, amount_minor, issued_at, snapshot, payment_id, individual_user_id, organization_id",
    )
    .order("issued_at", { ascending: false });
  const items: ReceiptDetail[] = [];
  for (const row of data ?? []) {
    if (!isCurrency(row.currency)) {
      continue;
    }
    const snapshot =
      row.snapshot && typeof row.snapshot === "object"
        ? (row.snapshot as { label?: string; received_at?: string | null })
        : {};
    items.push({
      publicId: row.public_id,
      receiptNumber: row.receipt_number,
      currency: row.currency,
      amountMinor: asMinor(row.amount_minor),
      issuedAt: row.issued_at,
      receivedAt: snapshot.received_at ?? null,
      sourceLabel: snapshot.label ?? "Recorded payment",
      invoiceNumbers: await relatedInvoiceNumbers(row.payment_id),
      individualUserId: row.individual_user_id,
      organizationId: row.organization_id,
    });
  }
  return items;
}

export async function listCustomerReceipts(userId: string): Promise<ReceiptDetail[]> {
  const receipts = await listReceipts();
  const orgIds = await organizationIdsFor(userId);
  return receipts.filter(
    (receipt) =>
      receipt.individualUserId === userId ||
      (receipt.organizationId !== null && orgIds.includes(receipt.organizationId)),
  );
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

export async function getReceiptByPublicId(
  publicId: string,
): Promise<ReceiptDetail | null> {
  const supabase = await createSessionSupabaseClient();
  if (!supabase) {
    return null;
  }
  const { data } = await supabase
    .from("receipts")
    .select(
      "public_id, receipt_number, currency, amount_minor, issued_at, snapshot, payment_id, individual_user_id, organization_id",
    )
    .eq("public_id", publicId)
    .maybeSingle();
  if (!data || !isCurrency(data.currency)) {
    return null;
  }
  const snapshot =
    data.snapshot && typeof data.snapshot === "object"
      ? (data.snapshot as { label?: string; received_at?: string | null })
      : {};
  return {
    publicId: data.public_id,
    receiptNumber: data.receipt_number,
    currency: data.currency,
    amountMinor: asMinor(data.amount_minor),
    issuedAt: data.issued_at,
    receivedAt: snapshot.received_at ?? null,
    sourceLabel: snapshot.label ?? "Recorded payment",
    invoiceNumbers: await relatedInvoiceNumbers(data.payment_id),
    individualUserId: data.individual_user_id,
    organizationId: data.organization_id,
  };
}

export async function getCustomerReceiptByPublicId(
  publicId: string,
  userId: string,
): Promise<ReceiptDetail | null> {
  const receipt = await getReceiptByPublicId(publicId);
  if (!receipt) {
    return null;
  }
  if (receipt.individualUserId === userId) {
    return receipt;
  }
  if (receipt.organizationId) {
    const orgIds = await organizationIdsFor(userId);
    if (orgIds.includes(receipt.organizationId)) {
      return receipt;
    }
  }
  return null;
}

export async function getReceiptForPayment(
  paymentId: string,
): Promise<ReceiptDetail | null> {
  const supabase = await createSessionSupabaseClient();
  if (!supabase) {
    return null;
  }
  const { data } = await supabase
    .from("receipts")
    .select("public_id")
    .eq("payment_id", paymentId)
    .maybeSingle();
  if (!data) {
    return null;
  }
  return getReceiptByPublicId(data.public_id);
}
