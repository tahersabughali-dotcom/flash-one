"use server";

import { redirect } from "next/navigation";
import { requireCompletedOnboarding } from "@/lib/server/account/require-onboarding";
import { createSessionSupabaseClient } from "@/lib/supabase/server";
import { OPERATIONS_PATHS } from "@/modules/operations";

export type CaseFormState = { error: string | null };

export async function customerCreateSupportCaseAction(
  _prev: CaseFormState,
  formData: FormData,
): Promise<CaseFormState> {
  await requireCompletedOnboarding(OPERATIONS_PATHS.customerCaseNew);
  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();
  if (!title) {
    return { error: "Title is required." };
  }
  const supabase = await createSessionSupabaseClient();
  if (!supabase) {
    return { error: "Session unavailable." };
  }
  const { data, error } = await supabase.rpc("customer_create_support_case", {
    p_title: title,
    p_description: description,
  });
  if (error || !data) {
    return { error: "Could not create the case. Try again." };
  }
  const publicId =
    typeof data === "object" && data && "public_id" in data
      ? String((data as { public_id: string }).public_id)
      : null;
  if (!publicId) {
    redirect(OPERATIONS_PATHS.customerCases);
  }
  redirect(OPERATIONS_PATHS.customerCase(publicId));
}
