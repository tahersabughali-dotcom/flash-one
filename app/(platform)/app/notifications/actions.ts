"use server";

import { redirect } from "next/navigation";
import { requireCompletedOnboarding } from "@/lib/server/account";
import { createSessionSupabaseClient } from "@/lib/supabase/server";
import { NOTIFICATION_PATHS } from "@/modules/notifications";

export async function markNotificationReadAction(formData: FormData) {
  await requireCompletedOnboarding(NOTIFICATION_PATHS.list);
  const publicId = String(formData.get("publicId") || "");
  const supabase = await createSessionSupabaseClient();
  if (!supabase || !publicId) {
    redirect(NOTIFICATION_PATHS.list);
  }
  await supabase.rpc("mark_notification_read", { p_public_id: publicId });
  redirect(NOTIFICATION_PATHS.list);
}
