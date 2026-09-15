export const RECONCILIATION_PATHS = {
  adminList: "/admin/reconciliation",
} as const;

export const RECONCILIATION_STATUSES = [
  "unmatched",
  "suggested",
  "matched",
  "reconciled",
  "ignored",
] as const;

export type ReconciliationStatus = (typeof RECONCILIATION_STATUSES)[number];

export const RECONCILIATION_STATUS_LABELS: Record<ReconciliationStatus, string> = {
  unmatched: "Unmatched",
  suggested: "Suggested",
  matched: "Matched",
  reconciled: "Reconciled",
  ignored: "Ignored",
};
