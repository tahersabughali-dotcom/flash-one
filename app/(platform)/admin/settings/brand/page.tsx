import Image from "next/image";
import { requirePlatformAdmin } from "@/lib/server/auth";
import { getBrandSettings } from "@/lib/server/platform/settings-queries";
import { SETTINGS_PATHS } from "@/modules/settings";
import { PageHeader } from "@/components/platform/PageHeader";
import { SectionPanel } from "@/components/platform/SectionPanel";
import { BrandSettingsForm } from "../forms";

export default async function Page() {
  await requirePlatformAdmin(SETTINGS_PATHS.brand);
  const brand = await getBrandSettings();
  return (
    <main>
      <PageHeader
        eyebrow="Settings"
        title="Brand"
        description="Official Flash One identity. Logo remains the existing official file."
      />
      <SectionPanel title="Official logo">
        <Image src="/brand/flash-one-logo.png" alt="Flash One" width={180} height={48} />
        <p className="mt-3 text-sm text-muted">Path: /brand/flash-one-logo.png</p>
      </SectionPanel>
      <SectionPanel title="Brand metadata">
        <BrandSettingsForm brand={brand} />
      </SectionPanel>
    </main>
  );
}
