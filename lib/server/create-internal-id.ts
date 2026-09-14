import type { InternalId } from "@/modules/core/identifiers";

/**
 * Create a stable internal identifier.
 * Uses the platform Web Crypto API. No extra package required.
 *
 * Server-only: import from `@/lib/server`, never from client components.
 */
export function createInternalId(): InternalId {
  return crypto.randomUUID();
}
