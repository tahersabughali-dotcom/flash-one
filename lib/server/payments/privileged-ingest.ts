/**
 * Narrow privileged client for verified server-only RPCs.
 *
 * Trust boundary:
 * - Verified payment ingest after provider signature checks, or
 *   development_test confirm after NODE_ENV, feature-flag, and database
 *   environment gates.
 * - Trusted assistant message write after a session user message.
 * - Reads SUPABASE_SECRET_KEY or SUPABASE_SERVICE_ROLE_KEY.
 * - Never NEXT_PUBLIC_. Never imported from Client Components.
 * - Must not be logged, returned, or stored.
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/server/database/database.types";
import { getServerDatabaseConfig } from "@/lib/server/database/env";

function readPrivilegedKey(): string | null {
  const secret = process.env.SUPABASE_SECRET_KEY?.trim();
  if (secret) {
    return secret;
  }
  const legacy = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  return legacy ? legacy : null;
}

export function createPrivilegedPaymentIngestClient(): SupabaseClient<Database> | null {
  const config = getServerDatabaseConfig();
  const privilegedKey = readPrivilegedKey();
  if (!config || !privilegedKey) {
    return null;
  }

  return createClient<Database>(config.url, privilegedKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export function isPrivilegedPaymentIngestConfigured(): boolean {
  return Boolean(getServerDatabaseConfig() && readPrivilegedKey());
}
