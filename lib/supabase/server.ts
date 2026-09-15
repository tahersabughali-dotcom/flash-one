import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/lib/server/database/database.types";
import { getSupabaseAuthConfig, getSupabaseAuthCookieOptions } from "./env";

/**
 * Session-aware server Supabase client.
 * Create a new instance per request. Do not import from Client Components.
 */
export async function createSessionSupabaseClient() {
  const config = getSupabaseAuthConfig();
  if (!config) {
    return null;
  }

  const cookieStore = await cookies();

  return createServerClient<Database>(config.url, config.publishableKey, {
    cookieOptions: getSupabaseAuthCookieOptions(),
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet, headers) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
          void headers;
        } catch {
          // Server Components cannot set cookies. proxy.ts refreshes the session.
        }
      },
    },
  });
}
