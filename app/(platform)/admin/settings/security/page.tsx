import { requirePlatformAdmin } from "@/lib/server/auth";
import { listPlatformSettings } from "@/lib/server/platform/settings-queries";
import { SETTINGS_PATHS } from "@/modules/settings";
import { PageHeader } from "@/components/platform/PageHeader";
import { SectionPanel } from "@/components/platform/SectionPanel";

export default async function Page() {
  await requirePlatformAdmin(SETTINGS_PATHS.security);
  const settings = (await listPlatformSettings()).filter((row) => row.category === "security");
  return (
    <main>
      <PageHeader
        eyebrow="Settings"
        title="Security readiness"
        description="Truthful readiness metadata only. Unknown stays unknown. Never claim enabled unless verified."
      />
      <SectionPanel title="Readiness">
        <ul className="space-y-2 text-sm">
          {settings.map((row) => (
            <li key={row.key} className="rounded-xl border border-line bg-white px-4 py-3">
              <span className="font-semibold text-navy">{row.key.replace(/_/g, " ")}</span>
              {": "}
              {row.value_text ?? String(row.value_bool ?? row.value_int ?? "unknown")}
            </li>
          ))}
          <li className="rounded-xl border border-line bg-white px-4 py-3">
            Production environment: false (Development project)
          </li>
        </ul>
      </SectionPanel>
    </main>
  );
}
