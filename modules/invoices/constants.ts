export const INVOICE_PATHS = {
  list: "/app/invoices",
  detail: (publicId: string) => `/app/invoices/${publicId}`,
  adminList: "/admin/invoices",
  adminNew: "/admin/invoices/new",
  adminDetail: (publicId: string) => `/admin/invoices/${publicId}`,
} as const;

export const INVOICE_STATUSES = [
  "draft",
  "issued",
  "partially_paid",
  "paid",
  "void",
] as const;

export type InvoiceStatus = (typeof INVOICE_STATUSES)[number];

export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  draft: "Draft",
  issued: "Issued",
  partially_paid: "Partially paid",
  paid: "Paid",
  void: "Void",
};

export const INVOICE_CURRENCIES = ["GBP", "USD", "EUR"] as const;
export type InvoiceCurrency = (typeof INVOICE_CURRENCIES)[number];

export const MAX_LINE_DESCRIPTION_LENGTH = 200;
export const MAX_INVOICE_NOTES_LENGTH = 4000;
export const MAX_VOID_REASON_LENGTH = 400;
export const MAX_LINE_QUANTITY = 9999;
export const MAX_UNIT_MINOR = 99_999_999_00;
