export const PAYMENT_PATHS = {
  adminList: "/admin/payments",
  adminNew: "/admin/payments/new",
  adminDetail: (publicId: string) => `/admin/payments/${publicId}`,
} as const;

export const PAYMENT_STATUSES = [
  "pending",
  "succeeded",
  "failed",
  "cancelled",
  "refunded",
  "partially_refunded",
] as const;

export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  pending: "Pending",
  succeeded: "Recorded",
  failed: "Failed",
  cancelled: "Cancelled",
  refunded: "Refunded",
  partially_refunded: "Partially refunded",
};

export const PAYMENT_SOURCE_LABELS: Record<string, string> = {
  manual: "Manual development record",
};
