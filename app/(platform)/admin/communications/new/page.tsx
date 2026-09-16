import { requirePlatformAdmin } from "@/lib/server/auth";
import { OPERATIONS_PATHS } from "@/modules/operations";
import { PageHeader } from "@/components/platform/PageHeader";
import { CommunicationForm } from "../../ops-forms";

export default async function Page() {
  await requirePlatformAdmin(OPERATIONS_PATHS.communicationNew);
  return (
    <main>
      <PageHeader
        eyebrow="System"
        title="Record communication"
        description="External channels are saved as manual records. This does not send WhatsApp, email, or SMS."
      />
      <CommunicationForm />
    </main>
  );
}
