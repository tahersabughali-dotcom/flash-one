import type { InternalId } from "@/modules/core/identifiers";

/**
 * Application audit contract.
 * Maps to public.audit_events — see docs/DATABASE_ARCHITECTURE.md.
 */
export type AuditActorType =
  | "system"
  | "anonymous"
  | "user"
  | "admin"
  | "service";

export type AuditActor =
  | { kind: "system" }
  | { kind: "anonymous" }
  | { kind: "user"; id: InternalId }
  | { kind: "admin"; id: InternalId }
  | { kind: "service"; id: InternalId | null };

export type AuditEvent = {
  actor: AuditActor;
  action: string;
  entityType: string;
  entityId: InternalId | null;
  occurredAt: string;
  metadata?: Record<string, string | number | boolean | null>;
  requestId?: InternalId | null;
};
