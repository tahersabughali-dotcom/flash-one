import { requirePlatformAdmin } from "@/lib/server/auth";
import { OPERATIONS_PATHS } from "@/modules/operations";
import { PageHeader } from "@/components/platform/PageHeader";
import { ContactForm } from "../../ops-forms";

export default async function Page() {
  await requirePlatformAdmin(OPERATIONS_PATHS.contactNew);
  return (
    <main>
      <PageHeader eyebrow="People & network" title="New contact" description="Internal contact registry. Not a public directory." />
      <ContactForm />
    </main>
  );
}
