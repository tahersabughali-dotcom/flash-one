import { createSessionSupabaseClient } from "@/lib/supabase/server";
import { asMinor } from "@/modules/invoices/money";
import { INVOICE_CURRENCIES, type InvoiceCurrency } from "@/modules/invoices";

export type CurrencyTotal = {
  currency: InvoiceCurrency;
  amountMinor: number;
  count: number;
};

function emptyTotals(): CurrencyTotal[] {
  return INVOICE_CURRENCIES.map((currency) => ({
    currency,
    amountMinor: 0,
    count: 0,
  }));
}

function addTotal(
  totals: Map<string, CurrencyTotal>,
  currency: string,
  amountMinor: number,
) {
  if (!INVOICE_CURRENCIES.includes(currency as InvoiceCurrency)) {
    return;
  }
  const current = totals.get(currency) ?? {
    currency: currency as InvoiceCurrency,
    amountMinor: 0,
    count: 0,
  };
  current.amountMinor += amountMinor;
  current.count += 1;
  totals.set(currency, current);
}

function mapTotals(totals: Map<string, CurrencyTotal>): CurrencyTotal[] {
  return INVOICE_CURRENCIES.map(
    (currency) =>
      totals.get(currency) ?? { currency, amountMinor: 0, count: 0 },
  ).filter((row) => row.count > 0 || row.amountMinor > 0);
}

export type FinanceReport = {
  invoicesByStatus: Array<{ status: string; totals: CurrencyTotal[] }>;
  paymentsByStatus: Array<{ status: string; totals: CurrencyTotal[] }>;
  paymentsBySource: Array<{ source: string; totals: CurrencyTotal[] }>;
  receiptsIssued: CurrencyTotal[];
  outstandingInvoiceBalances: CurrencyTotal[];
  unallocatedPayments: CurrencyTotal[];
  refundTotals: CurrencyTotal[];
  reconciliationByStatus: Array<{ status: string; totals: CurrencyTotal[] }>;
};

export async function getFinanceReport(): Promise<FinanceReport> {
  const supabase = await createSessionSupabaseClient();
  if (!supabase) {
    return {
      invoicesByStatus: [],
      paymentsByStatus: [],
      paymentsBySource: [],
      receiptsIssued: emptyTotals(),
      outstandingInvoiceBalances: emptyTotals(),
      unallocatedPayments: emptyTotals(),
      refundTotals: emptyTotals(),
      reconciliationByStatus: [],
    };
  }

  const [
    invoices,
    payments,
    receipts,
    refunds,
    reconciliation,
    allocations,
    creditNotes,
  ] = await Promise.all([
    supabase
      .from("invoices")
      .select("status, currency, total_minor, amount_paid_minor, id")
      .limit(2000),
    supabase
      .from("payments")
      .select("id, status, source_type, currency, amount_minor")
      .limit(2000),
    supabase.from("receipts").select("currency, amount_minor").limit(2000),
    supabase
      .from("refunds")
      .select("currency, amount_minor, status")
      .in("status", ["recorded", "completed_manual"])
      .limit(2000),
    supabase
      .from("reconciliation_items")
      .select("status, currency, amount_minor")
      .limit(2000),
    supabase.from("payment_allocations").select("payment_id, amount_minor").limit(5000),
    supabase
      .from("credit_notes")
      .select("invoice_id, amount_minor, status")
      .eq("status", "issued")
      .limit(2000),
  ]);

  const invoiceStatus = new Map<string, Map<string, CurrencyTotal>>();
  const outstanding = new Map<string, CurrencyTotal>();
  const creditsByInvoice = new Map<string, number>();
  for (const note of creditNotes.data ?? []) {
    creditsByInvoice.set(
      note.invoice_id,
      (creditsByInvoice.get(note.invoice_id) ?? 0) + asMinor(note.amount_minor),
    );
  }
  for (const invoice of invoices.data ?? []) {
    const totals = invoiceStatus.get(invoice.status) ?? new Map<string, CurrencyTotal>();
    addTotal(totals, invoice.currency, asMinor(invoice.total_minor));
    invoiceStatus.set(invoice.status, totals);
    if (invoice.status === "issued" || invoice.status === "partially_paid") {
      const remaining = Math.max(
        0,
        asMinor(invoice.total_minor) -
          asMinor(invoice.amount_paid_minor) -
          (creditsByInvoice.get(invoice.id) ?? 0),
      );
      addTotal(outstanding, invoice.currency, remaining);
    }
  }

  const paymentStatus = new Map<string, Map<string, CurrencyTotal>>();
  const paymentSource = new Map<string, Map<string, CurrencyTotal>>();
  const allocatedByPayment = new Map<string, number>();
  for (const allocation of allocations.data ?? []) {
    allocatedByPayment.set(
      allocation.payment_id,
      (allocatedByPayment.get(allocation.payment_id) ?? 0) + asMinor(allocation.amount_minor),
    );
  }
  const unallocated = new Map<string, CurrencyTotal>();
  for (const payment of payments.data ?? []) {
    const statusTotals = paymentStatus.get(payment.status) ?? new Map<string, CurrencyTotal>();
    addTotal(statusTotals, payment.currency, asMinor(payment.amount_minor));
    paymentStatus.set(payment.status, statusTotals);
    const sourceTotals = paymentSource.get(payment.source_type) ?? new Map<string, CurrencyTotal>();
    addTotal(sourceTotals, payment.currency, asMinor(payment.amount_minor));
    paymentSource.set(payment.source_type, sourceTotals);
    if (payment.status === "succeeded") {
      const remaining = Math.max(
        0,
        asMinor(payment.amount_minor) - (allocatedByPayment.get(payment.id) ?? 0),
      );
      if (remaining > 0) {
        addTotal(unallocated, payment.currency, remaining);
      }
    }
  }

  const receiptTotals = new Map<string, CurrencyTotal>();
  for (const receipt of receipts.data ?? []) {
    addTotal(receiptTotals, receipt.currency, asMinor(receipt.amount_minor));
  }
  const refundTotals = new Map<string, CurrencyTotal>();
  for (const refund of refunds.data ?? []) {
    addTotal(refundTotals, refund.currency, asMinor(refund.amount_minor));
  }
  const reconStatus = new Map<string, Map<string, CurrencyTotal>>();
  for (const item of reconciliation.data ?? []) {
    const totals = reconStatus.get(item.status) ?? new Map<string, CurrencyTotal>();
    addTotal(totals, item.currency, asMinor(item.amount_minor));
    reconStatus.set(item.status, totals);
  }

  const asGroups = (source: Map<string, Map<string, CurrencyTotal>>) =>
    [...source.entries()].map(([status, totals]) => ({
      status,
      totals: mapTotals(totals),
    }));

  return {
    invoicesByStatus: asGroups(invoiceStatus),
    paymentsByStatus: asGroups(paymentStatus),
    paymentsBySource: [...paymentSource.entries()].map(([source, totals]) => ({
      source,
      totals: mapTotals(totals),
    })),
    receiptsIssued: mapTotals(receiptTotals),
    outstandingInvoiceBalances: mapTotals(outstanding),
    unallocatedPayments: mapTotals(unallocated),
    refundTotals: mapTotals(refundTotals),
    reconciliationByStatus: asGroups(reconStatus),
  };
}

export type FinanceDashboard = {
  issuedBalance: CurrencyTotal[];
  reviewRequiredPayments: number;
  unallocatedPayments: number;
  pendingRefunds: number;
  unmatchedReconciliation: number;
};

export async function getFinanceDashboard(): Promise<FinanceDashboard> {
  const report = await getFinanceReport();
  const supabase = await createSessionSupabaseClient();
  const [review, pendingRefunds, unmatched] = await Promise.all([
    supabase
      ? supabase
          .from("payments")
          .select("id", { count: "exact", head: true })
          .eq("review_required", true)
      : Promise.resolve({ count: 0 }),
    supabase
      ? supabase
          .from("refunds")
          .select("id", { count: "exact", head: true })
          .eq("status", "pending_external")
      : Promise.resolve({ count: 0 }),
    supabase
      ? supabase
          .from("reconciliation_items")
          .select("id", { count: "exact", head: true })
          .eq("status", "unmatched")
      : Promise.resolve({ count: 0 }),
  ]);
  return {
    issuedBalance: report.outstandingInvoiceBalances,
    reviewRequiredPayments: review.count ?? 0,
    unallocatedPayments: report.unallocatedPayments.reduce((sum, row) => sum + row.count, 0),
    pendingRefunds: pendingRefunds.count ?? 0,
    unmatchedReconciliation: unmatched.count ?? 0,
  };
}
