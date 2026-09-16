export const REPORT_PATHS = {
  admin: "/admin/reports",
  exportInvoices: "/admin/reports/export/invoices",
  exportPayments: "/admin/reports/export/payments",
  exportReceipts: "/admin/reports/export/receipts",
  exportReconciliation: "/admin/reports/export/reconciliation",
  exportExpenses: "/admin/reports/export/expenses",
  exportPayouts: "/admin/reports/export/payouts",
  exportCases: "/admin/reports/export/cases",
  exportSuppliers: "/admin/reports/export/suppliers",
  exportFreelancers: "/admin/reports/export/freelancers",
} as const;

export const LEDGER_PATHS = {
  adminList: "/admin/ledger",
} as const;

export const LEDGER_EVENT_TYPES = [
  "manual_payment_recorded",
  "payment_received",
  "payment_allocated",
  "refund_recorded",
  "credit_note_issued",
  "adjustment_recorded",
  "expense_recorded",
  "payout_recorded",
] as const;

export type LedgerEventType = (typeof LEDGER_EVENT_TYPES)[number];

export const LEDGER_EVENT_LABELS: Record<LedgerEventType, string> = {
  manual_payment_recorded: "Manual payment recorded",
  payment_received: "Payment received",
  payment_allocated: "Payment allocated",
  refund_recorded: "Refund recorded",
  credit_note_issued: "Credit note issued",
  adjustment_recorded: "Adjustment recorded",
  expense_recorded: "Expense recorded",
  payout_recorded: "Payout recorded",
};
