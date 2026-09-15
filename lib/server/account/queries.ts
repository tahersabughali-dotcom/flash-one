import { createSessionSupabaseClient } from "@/lib/supabase/server";
import type { AccountSummary } from "@/modules/account";

export async function getAccountSummary(
  userId: string,
): Promise<AccountSummary | null> {
  const supabase = await createSessionSupabaseClient();
  if (!supabase) {
    return null;
  }

  const [onboardingResult, individualResult, developerResult, membershipResult] =
    await Promise.all([
      supabase
        .from("account_onboarding")
        .select("status")
        .eq("user_id", userId)
        .maybeSingle(),
      supabase
        .from("individual_accounts")
        .select("user_id, public_id")
        .eq("user_id", userId)
        .maybeSingle(),
      supabase
        .from("developer_profiles")
        .select("display_name, public_id, availability_status")
        .eq("user_id", userId)
        .maybeSingle(),
      supabase
        .from("organization_memberships")
        .select("role, organization_id")
        .eq("user_id", userId),
    ]);

  const memberships = membershipResult.data ?? [];
  const organizationIds = memberships.map((membership) => membership.organization_id);
  const organizationsById = new Map<
    string,
    { public_id: string; name: string }
  >();

  if (organizationIds.length > 0) {
    const { data: organizationRows } = await supabase
      .from("organizations")
      .select("id, public_id, name")
      .in("id", organizationIds);

    for (const organization of organizationRows ?? []) {
      organizationsById.set(organization.id, {
        public_id: organization.public_id,
        name: organization.name,
      });
    }
  }

  const organizations = memberships.flatMap((membership) => {
    const organization = organizationsById.get(membership.organization_id);
    if (!organization) {
      return [];
    }
    return [
      {
        publicId: organization.public_id,
        name: organization.name,
        role: membership.role === "owner" ? "owner" : "member",
      } as const,
    ];
  });

  const status = onboardingResult.data?.status;
  const onboardingStatus =
    status === "completed" || status === "in_progress" || status === "not_started"
      ? status
      : "not_started";

  return {
    onboardingStatus,
    individual: Boolean(individualResult.data),
    individualPublicId: individualResult.data?.public_id ?? null,
    developer: developerResult.data
      ? {
          displayName: developerResult.data.display_name,
          publicId: developerResult.data.public_id,
          availabilityStatus: developerResult.data.availability_status,
        }
      : null,
    organizations,
  };
}

export async function getProfileDisplayName(userId: string): Promise<string | null> {
  const supabase = await createSessionSupabaseClient();
  if (!supabase) {
    return null;
  }

  const { data } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("user_id", userId)
    .maybeSingle();

  return data?.full_name ?? null;
}
