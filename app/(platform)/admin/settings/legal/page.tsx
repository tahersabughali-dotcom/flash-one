import { requirePlatformAdmin } from "@/lib/server/auth";
import { listLegalDrafts } from "@/lib/server/platform/settings-queries";
import { SETTINGS_PATHS } from "@/modules/settings";
import { PageHeader } from "@/components/platform/PageHeader";
import { EmptyState } from "@/components/platform/EmptyState";
import { SectionPanel } from "@/components/platform/SectionPanel";

export default async function Page() {
  await requirePlatformAdmin(SETTINGS_PATHS.legal);
  const drafts = await listLegalDrafts();
  return (
    <main>
      <PageHeader
        eyebrow="Settings"
        title="Legal drafts"
        description="Internal placeholders only. Not published. Owner and company facts are required before any public legal page."
      />
      {drafts.length === 0 ? (
        <EmptyState title="No legal drafts" description="Internal placeholders appear here when seeded." />
      ) : (
        <SectionPanel title="Internal only">
          <ul className="space-y-3">
            {drafts.map((draft) => (
              <li key={draft.public_id} className="rounded-2xl border border-line bg-white px-4 py-3">
                <p className="font-semibold text-navy">
                  {draft.title} · {draft.public_id}
                </p>
                <p className="mt-1 text-sm text-muted">
                  Status: {draft.status} · {draft.notes}
                </p>
              </li>
            ))}
          </ul>
        </SectionPanel>
      )}
    </main>
  );
}
