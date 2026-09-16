export const ADJUSTMENT_PATHS = {
  adminList: "/admin/adjustments",
  adminNew: "/admin/adjustments/new",
  adminDetail: (publicId: string) => `/admin/adjustments/${publicId}`,
} as const;

export const ADJUSTMENT_KINDS = [
  "accounting_correction",
  "allocation_correction",
  "manual_adjustment",
] as const;

export type AdjustmentKind = (typeof ADJUSTMENT_KINDS)[number];

export const ADJUSTMENT_KIND_LABELS: Record<AdjustmentKind, string> = {
  accounting_correction: "Accounting correction",
  allocation_correction: "Allocation correction",
  manual_adjustment: "Manual adjustment",
};

export const ADJUSTMENT_STATUSES = ["recorded"] as const;
export type AdjustmentStatus = (typeof ADJUSTMENT_STATUSES)[number];

export const ADJUSTMENT_STATUS_LABELS: Record<AdjustmentStatus, string> = {
  recorded: "Recorded",
};

export const MAX_ADJUSTMENT_REASON_LENGTH = 400;
