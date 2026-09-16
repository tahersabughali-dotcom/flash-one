import { requirePlatformAdmin } from "@/lib/server/auth";
import { getCompanySettings } from "@/lib/server/platform/settings-queries";
import { SETTINGS_PATHS } from "@/modules/settings";
import { PageHeader } from "@/components/platform/PageHeader";
import { SectionPanel } from "@/components/platform/SectionPanel";
import { CompanySettingsForm } from "../forms";

export default async function Page() {
  await requirePlatformAdmin(SETTINGS_PATHS.company);
  const company = await getCompanySettings();
  return (
    <main>
      <PageHeader
        eyebrow="Settings"
        title="Company"
        description="Verified company fields only. Leave unknown values blank. Do not invent legal details."
      />
      <SectionPanel title="Company details">
        <CompanySettingsForm company={company} />
      </SectionPanel>
    </main>
  );
}
