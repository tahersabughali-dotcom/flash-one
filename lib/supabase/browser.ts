import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/lib/server/database/database.types";
import { getSupabaseAuthCookieOptions } from "./env";

/**
 * Browser Supabase client for Client Components.
 * Reads only NEXT_PUBLIC_ values. Do not use this for authorization.
 */
export function createBrowserSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();

  if (!url || !publishableKey) {
    return null;
  }

  return createBrowserClient<Database>(url, publishableKey, {
    cookieOptions: getSupabaseAuthCookieOptions(),
  });
}
