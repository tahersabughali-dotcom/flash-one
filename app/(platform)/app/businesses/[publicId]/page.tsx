import { notFound } from "next/navigation";
import Link from "next/link";
import { requireCompletedOnboarding } from "@/lib/server/account";
import { ACCOUNT_PATHS } from "@/modules/account";
import {
  getOrganizationByPublicId,
  listOrganizationInvitations,
  listOrganizationMembers,
  listOrganizationWork,
} from "@/lib/server/organizations/queries";
import { PROJECT_PATHS } from "@/modules/projects";
import { WORK_REQUEST_PATHS } from "@/modules/work-requests";
import { QUOTE_PATHS } from "@/modules/quotes";
import { OrganizationOwnerTools } from "./owner-tools";

export default async function BusinessWorkspacePage({
  params,
}: {
  params: Promise<{ publicId: string }>;
}) {
  const { publicId } = await params;
  const { session, summary } = await requireCompletedOnboarding(ACCOUNT_PATHS.business(publicId));
  const organization = await getOrganizationByPublicId(publicId);
  if (!organization) {
    notFound();
  }
  const membership = summary.organizations.find((item) => item.publicId === publicId);
  const isOwner = membership?.role === "owner";
  const [members, invitations, work] = await Promise.all([
    listOrganizationMembers(organization.id),
    isOwner ? listOrganizationInvitations(organization.id) : Promise.resolve([]),
    listOrganizationWork(organization.id),
  ]);

  return (
    <main>
      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-navy/50">
        {organization.publicId}
      </p>
      <h1 className="mt-3 text-3xl font-extrabold tracking-[-0.04em] text-navy-deep">
        {organization.name}
      </h1>
      <p className="mt-4 text-[15px] text-muted">
        Your role: {membership?.role ?? "member"}
      </p>
      {organization.website ? (
        <p className="mt-2 text-sm">
          <a href={organization.website} className="font-semibold text-blue" rel="noreferrer">
            Website
          </a>
        </p>
      ) : null}
      {organization.country ? <p className="mt-2 text-sm text-muted">{organization.country}</p> : null}
      {organization.description ? (
        <p className="mt-4 whitespace-pre-wrap text-[15px]">{organization.description}</p>
      ) : null}

      <Section title="Work requests" empty="No business requests.">
        {work.requests.map((item) => (
          <Link key={item.publicId} href={WORK_REQUEST_PATHS.detail(item.publicId)} className="block">
            {item.title}
          </Link>
        ))}
      </Section>
      <Section title="Quotes" empty="No business quotes.">
        {work.quotes.map((item) => (
          <Link key={item.publicId} href={QUOTE_PATHS.detail(item.publicId)} className="block">
            {item.publicId} · {item.status}
          </Link>
        ))}
      </Section>
      <Section title="Projects" empty="No business projects.">
        {work.projects.map((item) => (
          <Link key={item.publicId} href={PROJECT_PATHS.detail(item.publicId)} className="block">
            {item.name}
          </Link>
        ))}
      </Section>
      <Section title="Contracts / SOW" empty="No contracts yet.">
        {work.contracts.map((item) => (
          <p key={item.publicId}>
            {item.publicId} · {item.title}
          </p>
        ))}
      </Section>

      {isOwner ? (
        <OrganizationOwnerTools
          organizationPublicId={organization.publicId}
          name={organization.name}
          website={organization.website}
          country={organization.country}
          description={organization.description}
          members={members}
          invitations={invitations}
          currentUserId={session.userId}
        />
      ) : (
        <section className="mt-10">
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-navy/50">Members</h2>
          <ul className="mt-4 space-y-2 text-[15px]">
            {members.map((member) => (
              <li key={member.userId}>
                {member.displayName} · {member.role}
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}

function Section({
  title,
  empty,
  children,
}: {
  title: string;
  empty: string;
  children: React.ReactNode;
}) {
  const items = Array.isArray(children) ? children : [children];
  const hasItems = items.filter(Boolean).length > 0;
  return (
    <section className="mt-8">
      <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-navy/50">{title}</h2>
      {hasItems ? <div className="mt-4 space-y-2 text-[15px]">{children}</div> : <p className="mt-4 text-sm text-muted">{empty}</p>}
    </section>
  );
}
