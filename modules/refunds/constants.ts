export const REFUND_PATHS = {
  adminList: "/admin/refunds",
  adminNew: "/admin/refunds/new",
  adminDetail: (publicId: string) => `/admin/refunds/${publicId}`,
} as const;

export const REFUND_STATUSES = [
  "recorded",
  "pending_external",
  "completed_manual",
] as const;

export type RefundStatus = (typeof REFUND_STATUSES)[number];

export const REFUND_STATUS_LABELS: Record<RefundStatus, string> = {
  recorded: "Recorded",
  pending_external: "Pending external",
  completed_manual: "Completed manually",
};

export const MAX_REFUND_REASON_LENGTH = 400;
