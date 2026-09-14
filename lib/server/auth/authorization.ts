import { createSessionSupabaseClient } from "@/lib/supabase/server";

/**
 * Trusted admin check from user_platform_roles.
 * Never uses email, client state, or user-editable metadata.
 */
export async function isPlatformAdmin(userId: string): Promise<boolean> {
  const supabase = await createSessionSupabaseClient();
  if (!supabase) {
    return false;
  }

  const { data, error } = await supabase
    .from("user_platform_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();

  return !error && data?.role === "admin";
}
