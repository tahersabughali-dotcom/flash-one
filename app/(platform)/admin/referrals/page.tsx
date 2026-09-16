import { requirePlatformAdmin } from "@/lib/server/auth";
import { listReferrals } from "@/lib/server/operations";
import { parseListPage } from "@/lib/server/pagination";
import { OPERATIONS_PATHS, REFERRAL_SOURCE_LABELS } from "@/modules/operations";
import { OpsList } from "../ops-list";

export default async function Page({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  await requirePlatformAdmin(OPERATIONS_PATHS.referrals);
  const page = parseListPage((await searchParams).page);
  const rows = await listReferrals(page);
  return (
    <OpsList
      eyebrow="People & network"
      title="Referrals"
      description="Referral relationships. A referral does not automatically create commission."
      createHref={OPERATIONS_PATHS.referralNew}
      createLabel="New referral"
      emptyTitle="No referrals"
      emptyDescription="Record a referral source when a genuine relationship exists."
      page={page}
      items={rows.map((row) => ({
        href: OPERATIONS_PATHS.referral(row.public_id),
        publicId: row.public_id,
        title: row.source_label || row.source_kind,
        status: row.source_kind,
        statusLabel: REFERRAL_SOURCE_LABELS[row.source_kind as keyof typeof REFERRAL_SOURCE_LABELS] ?? row.source_kind,
      }))}
    />
  );
}
