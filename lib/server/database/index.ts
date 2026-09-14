/**
 * Server-only database boundary.
 *
 * Do not import this folder from Client Components.
 * Do not import this folder from public marketing pages.
 * Privileged credentials must never use the NEXT_PUBLIC_ prefix.
 */

export type { AuditEventRow } from "./audit-event";
export { toAuditEventInsert } from "./audit-event";
export type { Database, Json } from "./database.types";
export { getServerDatabaseConfig } from "./env";
export { createServerDatabaseClient } from "./client";
