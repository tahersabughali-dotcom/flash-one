import { requirePlatformAdmin } from "@/lib/server/auth";
import {
  getLaunchReadiness,
  READINESS_STATUS_LABELS,
  type ReadinessStatus,
} from "@/lib/server/platform/readiness";
import { PageHeader } from "@/components/platform/PageHeader";
import { SectionPanel } from "@/components/platform/SectionPanel";
import { StatusBadge } from "@/components/platform/StatusBadge";

const ORDER: ReadinessStatus[] = [
  "ready",
  "requires_configuration",
  "requires_owner_data",
  "deferred",
  "not_verified",
];

export default async function LaunchReadinessPage() {
  await requirePlatformAdmin("/admin/readiness");
  const items = await getLaunchReadiness();
  const categories = [...new Set(items.map((item) => item.category))];

  return (
    <main>
      <PageHeader
        eyebrow="System"
        title="Launch readiness"
        description="Evidence-based readiness only. Production is never marked ready automatically. Unknown values stay unknown."
      />
      {categories.map((category) => {
        const group = items
          .filter((item) => item.category === category)
          .sort((a, b) => ORDER.indexOf(a.status) - ORDER.indexOf(b.status));
        return (
          <SectionPanel key={category} title={category}>
            <ul className="space-y-4">
              {group.map((item) => (
                <li key={item.id} className="rounded-2xl border border-line bg-white px-4 py-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="font-semibold text-navy-deep">{item.label}</p>
                    <StatusBadge
                      status={item.status}
                      label={READINESS_STATUS_LABELS[item.status]}
                    />
                  </div>
                  <p className="mt-2 text-sm text-muted">{item.detail}</p>
                </li>
              ))}
            </ul>
          </SectionPanel>
        );
      })}
    </main>
  );
}
