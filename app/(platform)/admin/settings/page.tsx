import Link from "next/link";
import { requirePlatformAdmin } from "@/lib/server/auth";
import { SETTINGS_PATHS, SETTINGS_SECTIONS } from "@/modules/settings";
import { PageHeader } from "@/components/platform/PageHeader";
import { RecordCard } from "@/components/platform/RecordCard";

export default async function Page() {
  await requirePlatformAdmin(SETTINGS_PATHS.hub);
  return (
    <main>
      <PageHeader
        eyebrow="System"
        title="Settings"
        description="Platform configuration. Secrets stay in environment storage and are never shown here."
      />
      <ul className="mt-8 space-y-3">
        {SETTINGS_SECTIONS.map((section) => (
          <li key={section.href}>
            <RecordCard
              href={section.href}
              reference="Settings"
              title={section.label}
              meta={section.description}
            />
          </li>
        ))}
      </ul>
      <p className="mt-8 text-sm text-muted">
        Integrations are managed separately in{" "}
        <Link href="/admin/integrations" className="font-semibold text-blue">
          Integrations
        </Link>
        .
      </p>
    </main>
  );
}
