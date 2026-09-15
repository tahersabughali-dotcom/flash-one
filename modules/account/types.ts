export type AccountRelationshipKind = "individual" | "business" | "developer";

export type AccountSummary = {
  onboardingStatus: "not_started" | "in_progress" | "completed";
  individual: boolean;
  individualPublicId: string | null;
  developer: {
    displayName: string;
    publicId: string;
    availabilityStatus: string;
  } | null;
  organizations: Array<{
    publicId: string;
    name: string;
    role: "owner" | "member";
  }>;
};

export function isOnboardingComplete(summary: AccountSummary): boolean {
  return summary.onboardingStatus === "completed";
}
