export const WORK_REQUEST_PATHS = {
  list: "/app/requests",
  new: "/app/requests/new",
  detail: (publicId: string) => `/app/requests/${publicId}`,
  adminList: "/admin/requests",
  adminDetail: (publicId: string) => `/admin/requests/${publicId}`,
} as const;

export const SERVICE_CATEGORIES = [
  "software_development",
  "automation_ai",
  "it_consultancy",
  "technology_services",
  "other",
] as const;

export type ServiceCategory = (typeof SERVICE_CATEGORIES)[number];

export const SERVICE_CATEGORY_LABELS: Record<ServiceCategory, string> = {
  software_development: "Software Development",
  automation_ai: "Automation & AI",
  it_consultancy: "IT Consultancy",
  technology_services: "Technology Services",
  other: "Other",
};

export const WORK_REQUEST_STATUSES = [
  "submitted",
  "under_review",
  "needs_information",
  "qualified",
  "declined",
  "converted",
] as const;

export type WorkRequestStatus = (typeof WORK_REQUEST_STATUSES)[number];

export const WORK_REQUEST_STATUS_LABELS: Record<WorkRequestStatus, string> = {
  submitted: "Submitted",
  under_review: "Under review",
  needs_information: "Needs information",
  qualified: "Qualified",
  declined: "Declined",
  converted: "Converted",
};

export const MAX_TITLE_LENGTH = 160;
export const MAX_SUMMARY_LENGTH = 2000;
export const MAX_DETAILS_LENGTH = 8000;
export const MAX_BUDGET_LENGTH = 120;
export const MAX_TIMELINE_LENGTH = 120;
