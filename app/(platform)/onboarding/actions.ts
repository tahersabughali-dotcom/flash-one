"use server";

import { redirect } from "next/navigation";
import { ACCOUNT_PATHS } from "@/modules/account";
import {
  businessOnboardingSchema,
  developerOnboardingSchema,
} from "@/modules/account/validation";
import { firstZodError } from "@/modules/auth";
import { requireAuthenticatedUser } from "@/lib/server/auth";
import { createSessionSupabaseClient } from "@/lib/supabase/server";

export type OnboardingFormState = {
  error: string | null;
};

const GENERIC_ERROR = "Unable to complete onboarding. Please try again.";
const CONFIG_ERROR = "Account services are not configured.";

async function markOnboardingCompleted(userId: string) {
  const supabase = await createSessionSupabaseClient();
  if (!supabase) {
    return { error: CONFIG_ERROR };
  }

  const { error: insertError } = await supabase.from("account_onboarding").insert({
    user_id: userId,
    status: "completed",
  });

  if (!insertError) {
    return { error: null };
  }

  if (insertError.code !== "23505") {
    return { error: GENERIC_ERROR };
  }

  const { error: updateError } = await supabase
    .from("account_onboarding")
    .update({ status: "completed" })
    .eq("user_id", userId);

  if (updateError) {
    return { error: GENERIC_ERROR };
  }

  return { error: null };
}

export async function completeIndividualOnboardingAction(
  _previous: OnboardingFormState,
  formData: FormData,
): Promise<OnboardingFormState> {
  void _previous;
  void formData;
  const session = await requireAuthenticatedUser(ACCOUNT_PATHS.onboarding);
  const supabase = await createSessionSupabaseClient();
  if (!supabase) {
    return { error: CONFIG_ERROR };
  }

  const { error } = await supabase
    .from("individual_accounts")
    .insert({ user_id: session.userId });

  if (error && error.code !== "23505") {
    return { error: GENERIC_ERROR };
  }

  const completed = await markOnboardingCompleted(session.userId);
  if (completed.error) {
    return { error: completed.error };
  }

  redirect(ACCOUNT_PATHS.app);
}

export async function completeBusinessOnboardingAction(
  _previous: OnboardingFormState,
  formData: FormData,
): Promise<OnboardingFormState> {
  const session = await requireAuthenticatedUser(
    `${ACCOUNT_PATHS.onboarding}/business`,
  );
  const parsed = businessOnboardingSchema.safeParse({
    organizationName: formData.get("organizationName"),
  });

  if (!parsed.success) {
    return { error: firstZodError(parsed.error) };
  }

  const supabase = await createSessionSupabaseClient();
  if (!supabase) {
    return { error: CONFIG_ERROR };
  }

  const { error } = await supabase.rpc("create_organization", {
    p_name: parsed.data.organizationName,
  });

  if (error) {
    return { error: GENERIC_ERROR };
  }

  const completed = await markOnboardingCompleted(session.userId);
  if (completed.error) {
    return { error: completed.error };
  }

  redirect(ACCOUNT_PATHS.app);
}

export async function completeDeveloperOnboardingAction(
  _previous: OnboardingFormState,
  formData: FormData,
): Promise<OnboardingFormState> {
  const session = await requireAuthenticatedUser(
    `${ACCOUNT_PATHS.onboarding}/developer`,
  );
  const parsed = developerOnboardingSchema.safeParse({
    displayName: formData.get("displayName"),
    headline: formData.get("headline") || undefined,
    bio: formData.get("bio") || undefined,
    availabilityStatus: formData.get("availabilityStatus"),
  });

  if (!parsed.success) {
    return { error: firstZodError(parsed.error) };
  }

  const supabase = await createSessionSupabaseClient();
  if (!supabase) {
    return { error: CONFIG_ERROR };
  }

  const { error } = await supabase.from("developer_profiles").insert({
    user_id: session.userId,
    display_name: parsed.data.displayName,
    headline: parsed.data.headline ?? null,
    bio: parsed.data.bio ?? null,
    availability_status: parsed.data.availabilityStatus,
  });

  if (error && error.code !== "23505") {
    return { error: GENERIC_ERROR };
  }

  if (error?.code === "23505") {
    const { error: updateError } = await supabase
      .from("developer_profiles")
      .update({
        display_name: parsed.data.displayName,
        headline: parsed.data.headline ?? null,
        bio: parsed.data.bio ?? null,
        availability_status: parsed.data.availabilityStatus,
      })
      .eq("user_id", session.userId);

    if (updateError) {
      return { error: GENERIC_ERROR };
    }
  }

  const completed = await markOnboardingCompleted(session.userId);
  if (completed.error) {
    return { error: completed.error };
  }

  redirect(ACCOUNT_PATHS.app);
}
