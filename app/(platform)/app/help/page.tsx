import Link from "next/link";
import { requireAuthenticatedUser } from "@/lib/server/auth";
import { SETTINGS_PATHS } from "@/modules/settings";
import { OPERATIONS_PATHS } from "@/modules/operations";
import { PageHeader } from "@/components/platform/PageHeader";
import { SectionPanel } from "@/components/platform/SectionPanel";

export default async function Page() {
  await requireAuthenticatedUser(SETTINGS_PATHS.help);
  return (
    <main>
      <PageHeader
        eyebrow="Help"
        title="Support"
        description="Use Flash One Cases for support requests. There is no fabricated knowledge base in this phase."
      />
      <SectionPanel title="What you can do">
        <ul className="space-y-3 text-sm">
          <li>
            <Link href={OPERATIONS_PATHS.customerCases} className="font-semibold text-blue">
              View your cases
            </Link>
          </li>
          <li>
            <Link href={`${OPERATIONS_PATHS.customerCases}?new=1`} className="font-semibold text-blue">
              Open the cases area to create or follow up
            </Link>
          </li>
          <li>Project and invoice questions stay inside your existing workspace records.</li>
        </ul>
      </SectionPanel>
    </main>
  );
}
