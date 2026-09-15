export const ACCOUNT_PATHS = {
  onboarding: "/onboarding",
  app: "/app",
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
export const MAX_DEVELOPER_NAME_LENGTH = 120;
export const MAX_HEADLINE_LENGTH = 160;
export const MAX_BIO_LENGTH = 1000;
