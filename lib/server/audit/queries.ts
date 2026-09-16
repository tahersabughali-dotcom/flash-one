import { createSessionSupabaseClient } from "@/lib/supabase/server";
import { listRange } from "@/lib/server/pagination";

export type AuditEventRow = {
  id: string;
  occurredAt: string;
  actorType: string;
  actorId: string | null;
  action: string;
  entityType: string | null;
  entityId: string | null;
  metadataSummary: string;
  requestId: string | null;
  createdAt: string;
};

function summarizeMetadata(metadata: unknown): string {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    return "";
  }
  const entries = Object.entries(metadata as Record<string, unknown>)
    .filter(([key]) => !/secret|token|password|key|payload/i.test(key))
    .slice(0, 4)
    .map(([key, value]) => {
      if (value === null || value === undefined) {
        return key;
      }
      if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
        return `${key}=${String(value).slice(0, 40)}`;
      }
      return key;
    });
  return entries.join(", ");
}

export async function listAuditEvents(page = 1): Promise<AuditEventRow[]> {
  const supabase = await createSessionSupabaseClient();
  if (!supabase) {
    return [];
  }
  const { from, to } = listRange(page);
  const limit = to - from + 1;
  const { data, error } = await supabase.rpc("admin_list_audit_events", {
    p_limit: limit,
    p_offset: from,
  });
  if (error || !data) {
    return [];
  }
  return (data as Array<{
    id: string;
    occurred_at: string;
    actor_type: string;
    actor_id: string | null;
    action: string;
    entity_type: string | null;
    entity_id: string | null;
    metadata: unknown;
    request_id: string | null;
    created_at: string;
  }>).map((row) => ({
    id: row.id,
    occurredAt: row.occurred_at,
    actorType: row.actor_type,
    actorId: row.actor_id,
    action: row.action,
    entityType: row.entity_type,
    entityId: row.entity_id,
    metadataSummary: summarizeMetadata(row.metadata),
    requestId: row.request_id,
    createdAt: row.created_at,
  }));
}
