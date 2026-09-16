import { requirePlatformAdmin } from "@/lib/server/auth";
import { listAuditEvents } from "@/lib/server/audit";
import { parseListPage } from "@/lib/server/pagination";
import { ListPager } from "@/components/platform/ListPager";
import { PageHeader } from "@/components/platform/PageHeader";
import { EmptyState } from "@/components/platform/EmptyState";
import { formatDisplayDateTime } from "@/lib/format/display";

export default async function AdminAuditLogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  await requirePlatformAdmin("/admin/audit");
  const page = parseListPage((await searchParams).page);
  const rows = await listAuditEvents(page);

  return (
    <main>
      <PageHeader
        eyebrow="System"
        title="Audit log"
        description="Admin-only read interface for recorded audit events. No mutation. Secrets and provider payloads are not shown."
      />
      {rows.length === 0 ? (
        <EmptyState
          title="No audit events"
          description="Events appear here when the platform records them."
        />
      ) : (
        <ul className="mt-8 space-y-3">
          {rows.map((row) => (
            <li
              key={row.id}
              className="rounded-(--radius-panel) border border-white/70 bg-white/80 p-5 shadow-(--shadow-soft)"
            >
              <p className="text-xs font-semibold tracking-[0.14em] text-navy/50">
                {formatDisplayDateTime(row.occurredAt)}
              </p>
              <p className="mt-2 font-extrabold text-navy-deep">{row.action}</p>
              <p className="mt-1 text-sm text-muted">
                {row.actorType}
                {row.actorId ? ` · ${row.actorId.slice(0, 8)}…` : ""}
                {row.entityType ? ` · ${row.entityType}` : ""}
                {row.entityId ? ` · ${row.entityId.slice(0, 8)}…` : ""}
              </p>
              {row.metadataSummary ? (
                <p className="mt-2 text-sm text-navy">{row.metadataSummary}</p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
      <ListPager page={page} itemCount={rows.length} />
    </main>
  );
}
