import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";
import { getServerDatabaseConfig } from "./env";

/**
 * Server-only Supabase client using the publishable key.
 *
 * This client is subject to RLS and table grants. It cannot access
 * audit_events (deny by default, no policies, privileges revoked).
 *
 * A service-role / secret key is intentionally not wired. Privileged
 * audit writes remain outside this client until a later dedicated phase.
 *
 * Returns null when server env is not configured so public builds stay safe.
 */
export function createServerDatabaseClient(): SupabaseClient<Database> | null {
  const config = getServerDatabaseConfig();
  if (!config) {
    return null;
  }

  return createClient<Database>(config.url, config.publishableKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
