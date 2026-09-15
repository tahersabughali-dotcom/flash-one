"use server";

import { redirect } from "next/navigation";
import {
  ACCOUNT_PATHS,
  assignmentSchema,
  developerProfileSchema,
  invitationAcceptSchema,
  invitationEmailSchema,
  organizationProfileSchema,
} from "@/modules/account";
import { firstZodError } from "@/modules/auth";
import { requireCompletedOnboarding } from "@/lib/server/account";
import { requireAuthenticatedUser, requirePlatformAdmin } from "@/lib/server/auth";
import { createSessionSupabaseClient } from "@/lib/supabase/server";
import { getDeveloperProfileByPublicId } from "@/lib/server/developers/queries";
import { getOrganizationByPublicId } from "@/lib/server/organizations/queries";
import { getProjectByPublicId } from "@/lib/server/projects";

export type RelationshipFormState = {
  error: string | null;
  invitationToken?: string | null;
  invitationExpiresAt?: string | null;
};

const GENERIC = "Unable to complete this action. Please try again.";
const CONFIG = "Account services are not configured.";

async function markOnboardingCompleted(userId: string) {
  const supabase = await createSessionSupabaseClient();
  if (!supabase) {
    return { error: CONFIG };
  }
  const { error: insertError } = await supabase.from("account_onboarding").insert({
    user_id: userId,
    status: "completed",
  });
  if (!insertError) {
    return { error: null };
  }
  if (insertError.code !== "23505") {
    return { error: GENERIC };
  }
  const { error: updateError } = await supabase
    .from("account_onboarding")
    .update({ status: "completed" })
    .eq("user_id", userId);
  return { error: updateError ? GENERIC : null };
}

export async function addIndividualRelationshipAction(
  _previous: RelationshipFormState,
  _formData: FormData,
): Promise<RelationshipFormState> {
  void _previous;
  void _formData;
  const { session } = await requireCompletedOnboarding(ACCOUNT_PATHS.relationships);
  const supabase = await createSessionSupabaseClient();
  if (!supabase) {
    return { error: CONFIG };
  }
  const { error } = await supabase.from("individual_accounts").insert({
    user_id: session.userId,
  });
  if (error?.code === "23505") {
    return { error: "You already have an individual relationship." };
  }
  if (error) {
    return { error: GENERIC };
  }
  redirect(ACCOUNT_PATHS.relationships);
}

export async function addBusinessRelationshipAction(
  _previous: RelationshipFormState,
  formData: FormData,
): Promise<RelationshipFormState> {
  const { session } = await requireCompletedOnboarding(ACCOUNT_PATHS.relationships);
  const name = String(formData.get("organizationName") || "").trim();
  if (!name) {
    return { error: "Enter an organization name." };
  }
  const supabase = await createSessionSupabaseClient();
  if (!supabase) {
    return { error: CONFIG };
  }
  const { error } = await supabase.rpc("create_organization", { p_name: name });
  if (error) {
    return { error: GENERIC };
  }
  void session;
  redirect(ACCOUNT_PATHS.relationships);
}

export async function addDeveloperRelationshipAction(
  _previous: RelationshipFormState,
  formData: FormData,
): Promise<RelationshipFormState> {
  const { session } = await requireCompletedOnboarding(ACCOUNT_PATHS.relationships);
  const displayName = String(formData.get("displayName") || "").trim();
  if (!displayName) {
    return { error: "Enter a display name." };
  }
  const supabase = await createSessionSupabaseClient();
  if (!supabase) {
    return { error: CONFIG };
  }
  const { error } = await supabase.from("developer_profiles").insert({
    user_id: session.userId,
    display_name: displayName,
    availability_status: "available",
  });
  if (error?.code === "23505") {
    return { error: "You already have a developer profile." };
  }
  if (error) {
    return { error: GENERIC };
  }
  redirect(ACCOUNT_PATHS.developer);
}

export async function updateOrganizationProfileAction(
  _previous: RelationshipFormState,
  formData: FormData,
): Promise<RelationshipFormState> {
  const parsed = organizationProfileSchema.safeParse({
    organizationPublicId: formData.get("organizationPublicId"),
    name: formData.get("name"),
    website: formData.get("website") || undefined,
    country: formData.get("country") || undefined,
    description: formData.get("description") || undefined,
  });
  if (!parsed.success) {
    return { error: firstZodError(parsed.error) };
  }
  await requireCompletedOnboarding(
    ACCOUNT_PATHS.business(parsed.data.organizationPublicId),
  );
  const organization = await getOrganizationByPublicId(parsed.data.organizationPublicId);
  if (!organization) {
    return { error: "Organization not found." };
  }
  const supabase = await createSessionSupabaseClient();
  if (!supabase) {
    return { error: CONFIG };
  }
  const { error } = await supabase
    .from("organizations")
    .update({
      name: parsed.data.name,
      website: parsed.data.website ?? null,
      country: parsed.data.country ?? null,
      description: parsed.data.description ?? null,
    })
    .eq("id", organization.id);
  if (error) {
    return { error: GENERIC };
  }
  redirect(ACCOUNT_PATHS.business(parsed.data.organizationPublicId));
}

export async function createOrganizationInvitationAction(
  _previous: RelationshipFormState,
  formData: FormData,
): Promise<RelationshipFormState> {
  const parsed = invitationEmailSchema.safeParse({
    organizationPublicId: formData.get("organizationPublicId"),
    email: formData.get("email"),
  });
  if (!parsed.success) {
    return { error: firstZodError(parsed.error) };
  }
  await requireCompletedOnboarding(
    ACCOUNT_PATHS.business(parsed.data.organizationPublicId),
  );
  const organization = await getOrganizationByPublicId(parsed.data.organizationPublicId);
  if (!organization) {
    return { error: "Organization not found." };
  }
  const supabase = await createSessionSupabaseClient();
  if (!supabase) {
    return { error: CONFIG };
  }
  const { data, error } = await supabase.rpc("create_organization_invitation", {
    p_organization_id: organization.id,
    p_email: parsed.data.email,
  });
  if (error || !data || typeof data !== "object") {
    return { error: GENERIC };
  }
  const payload = data as { token?: string; expires_at?: string };
  return {
    error: null,
    invitationToken: payload.token ?? null,
    invitationExpiresAt: payload.expires_at ?? null,
  };
}

export async function revokeOrganizationInvitationAction(formData: FormData): Promise<void> {
  const organizationPublicId = String(formData.get("organizationPublicId") || "");
  const invitationId = String(formData.get("invitationId") || "");
  await requireCompletedOnboarding(ACCOUNT_PATHS.business(organizationPublicId));
  const supabase = await createSessionSupabaseClient();
  if (supabase) {
    await supabase.rpc("revoke_organization_invitation", {
      p_invitation_id: invitationId,
    });
  }
  redirect(ACCOUNT_PATHS.business(organizationPublicId));
}

export async function removeOrganizationMemberAction(formData: FormData): Promise<void> {
  const organizationPublicId = String(formData.get("organizationPublicId") || "");
  const memberUserId = String(formData.get("memberUserId") || "");
  await requireCompletedOnboarding(ACCOUNT_PATHS.business(organizationPublicId));
  const organization = await getOrganizationByPublicId(organizationPublicId);
  const supabase = await createSessionSupabaseClient();
  if (organization && supabase) {
    await supabase.rpc("remove_organization_member", {
      p_organization_id: organization.id,
      p_user_id: memberUserId,
    });
  }
  redirect(ACCOUNT_PATHS.business(organizationPublicId));
}

export async function acceptOrganizationInvitationAction(
  _previous: RelationshipFormState,
  formData: FormData,
): Promise<RelationshipFormState> {
  const parsed = invitationAcceptSchema.safeParse({
    token: formData.get("token"),
  });
  if (!parsed.success) {
    return { error: firstZodError(parsed.error) };
  }
  const session = await requireAuthenticatedUser(ACCOUNT_PATHS.invitationsAccept);
  const supabase = await createSessionSupabaseClient();
  if (!supabase) {
    return { error: CONFIG };
  }
  const { error } = await supabase.rpc("accept_organization_invitation", {
    p_token: parsed.data.token,
  });
  if (error) {
    const lower = error.message.toLowerCase();
    if (lower.includes("email") || lower.includes("not authorized")) {
      return { error: "This invitation is for a different email address." };
    }
    if (lower.includes("revoked") || lower.includes("expired") || lower.includes("not pending")) {
      return { error: "This invitation is no longer valid." };
    }
    return { error: GENERIC };
  }
  const completed = await markOnboardingCompleted(session.userId);
  if (completed.error) {
    return { error: completed.error };
  }
  redirect(ACCOUNT_PATHS.relationships);
}

export async function updateDeveloperProfileAction(
  _previous: RelationshipFormState,
  formData: FormData,
): Promise<RelationshipFormState> {
  await requireCompletedOnboarding(ACCOUNT_PATHS.developer);
  const parsed = developerProfileSchema.safeParse({
    displayName: formData.get("displayName"),
    headline: formData.get("headline") || undefined,
    bio: formData.get("bio") || undefined,
    availabilityStatus: formData.get("availabilityStatus"),
    country: formData.get("country") || undefined,
    timezone: formData.get("timezone") || undefined,
    skills: formData.get("skills") || undefined,
    linkLabels: formData.getAll("linkLabel").map(String),
    linkUrls: formData.getAll("linkUrl").map(String),
  });
  if (!parsed.success) {
    return { error: firstZodError(parsed.error) };
  }
  const supabase = await createSessionSupabaseClient();
  if (!supabase) {
    return { error: CONFIG };
  }
  const { error } = await supabase.rpc("update_developer_profile", {
    p_display_name: parsed.data.displayName,
    p_headline: parsed.data.headline ?? "",
    p_bio: parsed.data.bio ?? "",
    p_availability_status: parsed.data.availabilityStatus,
    p_country: parsed.data.country ?? "",
    p_timezone: parsed.data.timezone ?? "",
    p_skills: parsed.data.skills,
    p_links: parsed.data.links,
  });
  if (error) {
    return { error: GENERIC };
  }
  redirect(ACCOUNT_PATHS.developer);
}

export async function assignDeveloperToProjectAction(
  _previous: RelationshipFormState,
  formData: FormData,
): Promise<RelationshipFormState> {
  const parsed = assignmentSchema.safeParse({
    projectPublicId: formData.get("projectPublicId"),
    developerPublicId: formData.get("developerPublicId"),
  });
  if (!parsed.success) {
    return { error: firstZodError(parsed.error) };
  }
  const access = await requirePlatformAdmin(`/admin/developers/${parsed.data.developerPublicId}`);
  if (!access.authorized) {
    return { error: "Not authorized." };
  }
  const [developer, project] = await Promise.all([
    getDeveloperProfileByPublicId(parsed.data.developerPublicId),
    getProjectByPublicId(parsed.data.projectPublicId),
  ]);
  if (!developer || !project) {
    return { error: "Developer or project was not found." };
  }
  const supabase = await createSessionSupabaseClient();
  if (!supabase) {
    return { error: CONFIG };
  }
  const { error } = await supabase.rpc("admin_assign_project_developer", {
    p_developer_user_id: developer.userId,
    p_project_id: project.id,
  });
  if (error) {
    return { error: GENERIC };
  }
  redirect(`/admin/developers/${parsed.data.developerPublicId}`);
}

export async function unassignDeveloperFromProjectAction(
  _previous: RelationshipFormState,
  formData: FormData,
): Promise<RelationshipFormState> {
  const parsed = assignmentSchema.safeParse({
    projectPublicId: formData.get("projectPublicId"),
    developerPublicId: formData.get("developerPublicId"),
  });
  if (!parsed.success) {
    return { error: firstZodError(parsed.error) };
  }
  const access = await requirePlatformAdmin(`/admin/developers/${parsed.data.developerPublicId}`);
  if (!access.authorized) {
    return { error: "Not authorized." };
  }
  const [developer, project] = await Promise.all([
    getDeveloperProfileByPublicId(parsed.data.developerPublicId),
    getProjectByPublicId(parsed.data.projectPublicId),
  ]);
  if (!developer || !project) {
    return { error: "Developer or project was not found." };
  }
  const supabase = await createSessionSupabaseClient();
  if (!supabase) {
    return { error: CONFIG };
  }
  const { error } = await supabase.rpc("admin_unassign_project_developer", {
    p_developer_user_id: developer.userId,
    p_project_id: project.id,
  });
  if (error) {
    return { error: GENERIC };
  }
  redirect(`/admin/developers/${parsed.data.developerPublicId}`);
}
