import { requirePlatformAdmin } from "@/lib/server/auth";
import { listIntegrationViews } from "@/lib/server/integrations/registry";
import { INTEGRATION_PATHS, CAPABILITY_LABELS } from "@/modules/integrations";
import { PageHeader } from "@/components/platform/PageHeader";
import { EmptyState } from "@/components/platform/EmptyState";
import { RecordCard } from "@/components/platform/RecordCard";

export default async function Page() {
  await requirePlatformAdmin(INTEGRATION_PATHS.admin);
  const rows = await listIntegrationViews();
  return (
    <main>
      <PageHeader
        eyebrow="System"
        title="Integrations"
        description="Supported integrations and setup state. Configured is not the same as healthy. Secrets are never displayed."
      />
      {rows.length === 0 ? (
        <EmptyState title="No integrations" description="Integration registry appears here after migration." />
      ) : (
        <ul className="mt-8 space-y-3">
          {rows.map((row) => {
            const caps = Object.entries(row.capabilities)
              .filter(([, enabled]) => enabled)
              .map(([key]) => CAPABILITY_LABELS[key] ?? key)
              .join(", ");
            return (
              <li key={row.code}>
                <RecordCard
                  href={INTEGRATION_PATHS.detail(row.code)}
                  reference={row.code}
                  title={row.displayName}
                  status={String(row.displayState)}
                  statusLabel={row.displayStateLabel}
                  meta={`${row.category}${caps ? ` · ${caps}` : ""}`}
                />
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
