import Link from "next/link";
import { requirePlatformAdmin } from "@/lib/server/auth";
import { INTEGRATION_PATHS } from "@/modules/integrations";
import { OPERATIONS_PATHS } from "@/modules/operations";
import { PageHeader } from "@/components/platform/PageHeader";
import { SectionPanel } from "@/components/platform/SectionPanel";

const EXPORTS = [
  { href: OPERATIONS_PATHS.exportExpenses, label: "Expenses CSV" },
  { href: OPERATIONS_PATHS.exportPayouts, label: "Payouts CSV" },
  { href: OPERATIONS_PATHS.exportCases, label: "Cases CSV" },
  { href: OPERATIONS_PATHS.exportSuppliers, label: "Suppliers CSV" },
  { href: OPERATIONS_PATHS.exportFreelancers, label: "Freelancers CSV" },
  { href: "/admin/reports", label: "Reports hub" },
];

export default async function Page() {
  await requirePlatformAdmin(INTEGRATION_PATHS.exports);
  return (
    <main>
      <PageHeader
        eyebrow="System"
        title="Export Center"
        description="Authorized CSV exports already built in Phase 2/3. This hub does not duplicate export logic."
      />
      <SectionPanel title="Available exports">
        <ul className="space-y-2">
          {EXPORTS.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className="font-semibold text-blue">
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </SectionPanel>
    </main>
  );
}
