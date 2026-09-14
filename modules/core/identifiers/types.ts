/**
 * Internal identifiers are stable, opaque UUIDs and never sequential
 * user-facing numbers (1, 2, 3…).
 *
 * Postgres: uuid primary keys with gen_random_uuid().
 * TypeScript: createInternalId() in lib/server.
 *
 * Public identifiers may exist later for URLs or receipts.
 * They must be treated as a separate concern from InternalId.
 */
export type InternalId = string;
export type PublicId = string;
