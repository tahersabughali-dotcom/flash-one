export const QUOTE_PATHS = {
  detail: (publicId: string) => `/app/quotes/${publicId}`,
} as const;

export const QUOTE_STATUSES = [
  "draft",
  "sent",
  "accepted",
  "rejected",
  "expired",
  "superseded",
] as const;

export type QuoteStatus = (typeof QUOTE_STATUSES)[number];

export const QUOTE_STATUS_LABELS: Record<QuoteStatus, string> = {
  draft: "Draft",
  sent: "Sent",
  accepted: "Accepted",
  rejected: "Rejected",
  expired: "Expired",
  superseded: "Superseded",
};

export const QUOTE_CURRENCIES = ["GBP", "USD", "EUR"] as const;
export type QuoteCurrency = (typeof QUOTE_CURRENCIES)[number];

export const MAX_LINE_DESCRIPTION_LENGTH = 200;
export const MAX_CUSTOMER_NOTES_LENGTH = 4000;
export const MAX_LINE_QUANTITY = 9999;
export const MAX_UNIT_MINOR = 99_999_999_00;
