"use server";

import { redirect } from "next/navigation";
import { firstZodError } from "@/modules/auth";
import { ACCOUNT_PATHS, profileNameSchema } from "@/modules/account";
import { requireCompletedOnboarding } from "@/lib/server/account";
import { createSessionSupabaseClient } from "@/lib/supabase/server";

export type AccountFormState = {
  error: string | null;
  message: string | null;
};

export async function updateProfileNameAction(
  _previous: AccountFormState,
  formData: FormData,
): Promise<AccountFormState> {
  const { session } = await requireCompletedOnboarding(ACCOUNT_PATHS.account);
  const parsed = profileNameSchema.safeParse({
    fullName: formData.get("fullName"),
  });
  if (!parsed.success) {
    return { error: firstZodError(parsed.error), message: null };
  }
  const supabase = await createSessionSupabaseClient();
  if (!supabase) {
    return { error: "Unable to update your name.", message: null };
  }
  const { error } = await supabase
    .from("profiles")
    .update({ full_name: parsed.data.fullName })
    .eq("user_id", session.userId);
  if (error) {
    return { error: "Unable to update your name.", message: null };
  }
  redirect(ACCOUNT_PATHS.account);
}
