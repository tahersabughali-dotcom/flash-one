import { requirePlatformAdmin } from "@/lib/server/auth";
import { OPERATIONS_PATHS } from "@/modules/operations";
import { PageHeader } from "@/components/platform/PageHeader";
import { DocumentUploadForm } from "../../ops-forms";

export default async function Page() {
  await requirePlatformAdmin(OPERATIONS_PATHS.documentNew);
  return (
    <main>
      <PageHeader eyebrow="System" title="Upload document" description="Private storage. Signed access after authorization." />
      <DocumentUploadForm />
    </main>
  );
}
