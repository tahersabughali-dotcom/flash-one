export const PAYMENT_REQUEST_PATHS = {
  adminList: "/admin/payment-requests",
  adminNew: "/admin/payment-requests/new",
  adminDetail: (publicId: string) => `/admin/payment-requests/${publicId}`,
  pay: "/pay",
  payRequest: (publicId: string) => `/pay/${publicId}`,
  payResult: (publicId: string) => `/pay/result/${publicId}`,
} as const;

export const PAYMENT_REQUEST_STATUSES = [
  "draft",
  "active",
  "completed",
  "expired",
  "cancelled",
] as const;

export type PaymentRequestStatus = (typeof PAYMENT_REQUEST_STATUSES)[number];

export const PAYMENT_REQUEST_STATUS_LABELS: Record<PaymentRequestStatus, string> = {
  draft: "Draft",
  active: "Active",
  completed: "Completed",
  expired: "Expired",
  cancelled: "Cancelled",
};

export const PAYMENT_SERVICES = [
  "technical_consultation",
  "code_review",
  "bug_fix",
  "small_website_modification",
  "code_modification",
  "website_update",
  "other",
] as const;

export type PaymentServiceCode = (typeof PAYMENT_SERVICES)[number];

export const PAYMENT_SERVICE_LABELS: Record<PaymentServiceCode, string> = {
  technical_consultation: "Technical Consultation",
  code_review: "Code Review",
  bug_fix: "Bug Fix",
  small_website_modification: "Small Website Modification",
  code_modification: "Code Modification",
  website_update: "Website Update",
  other: "Other",
};

export const ATTEMPT_STATUSES = [
  "created",
  "pending",
  "redirected",
  "processing",
  "succeeded",
  "failed",
  "cancelled",
  "expired",
  "review_required",
] as const;

export type AttemptStatus = (typeof ATTEMPT_STATUSES)[number];

export const ATTEMPT_STATUS_LABELS: Record<AttemptStatus, string> = {
  created: "Created",
  pending: "Processing",
  redirected: "Processing",
  processing: "Processing",
  succeeded: "Paid",
  failed: "Failed",
  cancelled: "Cancelled",
  expired: "Expired",
  review_required: "Needs review",
};
