export const SERVICE_PATHS = {
  adminList: "/admin/services",
  adminNew: "/admin/services/new",
  adminDetail: (publicId: string) => `/admin/services/${publicId}`,
} as const;

export const CATALOG_CATEGORIES = [
  "software_development",
  "web_systems",
  "applications",
  "automation",
  "ai_solutions",
  "it_consultancy",
  "technical_support",
  "system_setup",
  "custom_software",
  "technology_services",
  "other",
] as const;

export type CatalogCategory = (typeof CATALOG_CATEGORIES)[number];

export const CATALOG_CATEGORY_LABELS: Record<CatalogCategory, string> = {
  software_development: "Software Development",
  web_systems: "Web Systems",
  applications: "Applications",
  automation: "Automation",
  ai_solutions: "AI Solutions",
  it_consultancy: "IT Consultancy",
  technical_support: "Technical Support",
  system_setup: "System Setup / Implementation",
  custom_software: "Custom Software",
  technology_services: "Technology Services",
  other: "Other",
};

export const CATALOG_STATUSES = ["active", "archived"] as const;
export type CatalogStatus = (typeof CATALOG_STATUSES)[number];

export const CATALOG_STATUS_LABELS: Record<CatalogStatus, string> = {
  active: "Active",
  archived: "Archived",
};

export const CATALOG_MODES = ["quote_required", "fixed_price"] as const;
export type CatalogMode = (typeof CATALOG_MODES)[number];

export const CATALOG_MODE_LABELS: Record<CatalogMode, string> = {
  quote_required: "Quote required",
  fixed_price: "Fixed price",
};

export const REQUEST_CATEGORY_BY_CATALOG: Record<
  CatalogCategory,
  "software_development" | "automation_ai" | "it_consultancy" | "technology_services" | "other"
> = {
  software_development: "software_development",
  web_systems: "software_development",
  applications: "software_development",
  automation: "automation_ai",
  ai_solutions: "automation_ai",
  it_consultancy: "it_consultancy",
  technical_support: "it_consultancy",
  system_setup: "it_consultancy",
  custom_software: "software_development",
  technology_services: "technology_services",
  other: "other",
};

export const MAX_SERVICE_NAME_LENGTH = 160;
export const MAX_SERVICE_DESCRIPTION_LENGTH = 4000;
export const MAX_SERVICE_NOTES_LENGTH = 4000;
