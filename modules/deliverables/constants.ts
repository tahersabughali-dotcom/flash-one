export const DELIVERABLE_STATUSES = [
  "draft",
  "submitted",
  "accepted",
  "changes_requested",
  "superseded",
] as const;

export type DeliverableStatus = (typeof DELIVERABLE_STATUSES)[number];

export const DELIVERABLE_STATUS_LABELS: Record<DeliverableStatus, string> = {
  draft: "Draft",
  submitted: "Submitted",
  accepted: "Accepted",
  changes_requested: "Changes requested",
  superseded: "Superseded",
};

export const MAX_DELIVERABLE_TITLE_LENGTH = 160;
export const MAX_DELIVERABLE_DESCRIPTION_LENGTH = 4000;
export const MAX_CHANGE_NOTE_LENGTH = 2000;
