/**
 * Server-only code.
 *
 * Import from `@/lib/server` in Server Components, Route Handlers,
 * and future Server Actions only. Do not import this folder from
 * files marked `"use client"`.
 *
 * Database clients, secrets, and provider SDKs belong here later.
 * SQL lives in supabase/migrations/. No connected client exists yet.
 */

export { createInternalId } from "./create-internal-id";
export { toPublicError, AppError } from "@/modules/core/errors";
export { toAuditEventInsert, type AuditEventRow } from "./database";
