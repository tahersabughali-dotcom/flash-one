/**
 * Server-only database boundary.
 *
 * No connected client exists in this phase.
 * Do not import this folder from Client Components.
 * Do not read environment variables here until a later phase
 * actually creates a client.
 */

export type { AuditEventRow } from "./audit-event";
export { toAuditEventInsert } from "./audit-event";
