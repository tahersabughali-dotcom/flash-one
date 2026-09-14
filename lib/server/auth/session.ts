import { createSessionSupabaseClient } from "@/lib/supabase/server";

export type VerifiedSession = {
  userId: string;
};

/**
 * Verified Auth identity from the JWT. Do not use getSession() for this.
 */
export async function getVerifiedSession(): Promise<VerifiedSession | null> {
  const supabase = await createSessionSupabaseClient();
  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;

  if (error || typeof userId !== "string" || userId.length === 0) {
    return null;
  }

  return { userId };
}
