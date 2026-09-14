import type { InternalId } from "@/modules/core/identifiers";
import type { AuditActorType, AuditEvent } from "@/modules/core/audit";

/**
 * Row shape for public.audit_events.
 * This is application-owned. It is not a generated Supabase Database type.
 */
export type AuditEventRow = {
  id: InternalId;
  occurred_at: string;
  actor_type: AuditActorType;
  actor_id: InternalId | null;
  action: string;
  entity_type: string;
  entity_id: InternalId | null;
  metadata: Record<string, string | number | boolean | null>;
  request_id: InternalId | null;
  created_at: string;
};

export function toAuditEventInsert(event: AuditEvent): Omit<
  AuditEventRow,
  "id" | "created_at"
> {
  return {
    occurred_at: event.occurredAt,
    actor_type: event.actor.kind,
    actor_id: "id" in event.actor ? (event.actor.id ?? null) : null,
    action: event.action,
    entity_type: event.entityType,
    entity_id: event.entityId,
    metadata: event.metadata ?? {},
    request_id: event.requestId ?? null,
  };
}
