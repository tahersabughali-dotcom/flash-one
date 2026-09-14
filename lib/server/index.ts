/**
 * Server-only code.
 *
 * Import from `@/lib/server` in Server Components, Route Handlers,
 * and future Server Actions only. Do not import this folder from
 * files marked `"use client"`.
 *
 * Database access lives under ./database/.
 * Public pages must not import this folder.
 */

export { createInternalId } from "./create-internal-id";
export { toPublicError, AppError } from "@/modules/core/errors";
export {
  toAuditEventInsert,
  createServerDatabaseClient,
  getServerDatabaseConfig,
  type AuditEventRow,
  type Database,
} from "./database";
