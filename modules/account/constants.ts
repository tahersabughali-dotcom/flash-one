export const ACCOUNT_PATHS = {
  onboarding: "/onboarding",
  app: "/app",
  relationships: "/app/relationships",
  business: (publicId: string) => `/app/businesses/${publicId}`,
  developer: "/app/developer",
  developerProjects: "/app/developer/projects",
  developerProject: (publicId: string) => `/app/developer/projects/${publicId}`,
  invitationsAccept: "/app/invitations/accept",
} as const;

export const ADMIN_PATHS = {
  home: "/admin",
  customers: "/admin/customers",
  customer: (publicId: string) => `/admin/customers/${publicId}`,
  businesses: "/admin/businesses",
  business: (publicId: string) => `/admin/businesses/${publicId}`,
  developers: "/admin/developers",
  developer: (publicId: string) => `/admin/developers/${publicId}`,
} as const;

export const ONBOARDING_STATUSES = [
  "not_started",
  "in_progress",
  "completed",
] as const;

export type OnboardingStatus = (typeof ONBOARDING_STATUSES)[number];

export const ORGANIZATION_MEMBER_ROLES = ["owner", "member"] as const;
export type OrganizationMemberRole = (typeof ORGANIZATION_MEMBER_ROLES)[number];

export const DEVELOPER_AVAILABILITY = [
  "available",
  "limited",
  "unavailable",
] as const;

export type DeveloperAvailability = (typeof DEVELOPER_AVAILABILITY)[number];

export const MAX_ORGANIZATION_NAME_LENGTH = 120;
export const MAX_ORGANIZATION_DESCRIPTION_LENGTH = 1000;
export const MAX_DEVELOPER_NAME_LENGTH = 120;
export const MAX_HEADLINE_LENGTH = 160;
export const MAX_BIO_LENGTH = 1000;
export const MAX_SKILL_LENGTH = 40;
export const MAX_SKILLS = 24;
export const MAX_PORTFOLIO_LINKS = 8;
export const MAX_COUNTRY_LENGTH = 80;
export const MAX_TIMEZONE_LENGTH = 80;
