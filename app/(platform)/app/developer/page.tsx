import Link from "next/link";
import { notFound } from "next/navigation";
import { requireCompletedOnboarding } from "@/lib/server/account";
import { getDeveloperProfileByUserId } from "@/lib/server/developers/queries";
import { ACCOUNT_PATHS } from "@/modules/account";
import { DeveloperProfileForm } from "./profile-form";

export default async function DeveloperProfilePage() {
  const { session } = await requireCompletedOnboarding(ACCOUNT_PATHS.developer);
  const profile = await getDeveloperProfileByUserId(session.userId);
  if (!profile) {
    notFound();
  }

  return (
    <main>
      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-navy/50">
        {profile.publicId}
      </p>
      <h1 className="mt-3 text-3xl font-extrabold tracking-[-0.04em] text-navy-deep">
        Developer profile
      </h1>
      <p className="mt-4 text-[15px] text-muted">
        This profile is account data, not a public marketplace listing.
      </p>
      <p className="mt-4 text-sm">
        <Link href={ACCOUNT_PATHS.developerProjects} className="font-semibold text-blue">
          Assigned projects
        </Link>
      </p>
      <DeveloperProfileForm
        displayName={profile.displayName}
        headline={profile.headline}
        bio={profile.bio}
        availabilityStatus={profile.availabilityStatus}
        country={profile.country}
        timezone={profile.timezone}
        skills={profile.skills}
        links={profile.links}
      />
    </main>
  );
}
