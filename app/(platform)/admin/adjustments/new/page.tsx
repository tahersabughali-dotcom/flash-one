import { requirePlatformAdmin } from "@/lib/server/auth";
import { ADJUSTMENT_PATHS } from "@/modules/adjustments";
import { PageHeader } from "@/components/platform/PageHeader";
import { AdjustmentForm } from "../adjustment-form";

export default async function AdminNewAdjustmentPage() {
  await requirePlatformAdmin(ADJUSTMENT_PATHS.adminNew);
  return (
    <main>
      <PageHeader eyebrow="Finance" title="Record adjustment" description="Adjustments post an append-only ledger event. They do not rewrite original payments." />
      <AdjustmentForm />
    </main>
  );
}
