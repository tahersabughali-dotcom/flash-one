import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePlatformAdmin } from "@/lib/server/auth";
import { ADMIN_PATHS } from "@/modules/account";
import {
  getOrganizationByPublicId,
  listOrganizationMembers,
  listOrganizationWork,
} from "@/lib/server/organizations/queries";
import { WORK_REQUEST_PATHS } from "@/modules/work-requests";
import { PROJECT_PATHS } from "@/modules/projects";
import { QUOTE_PATHS } from "@/modules/quotes";

export default async function AdminBusinessDetailPage({
  params,
}: {
  params: Promise<{ publicId: string }>;
}) {
  const { publicId } = await params;
  const access = await requirePlatformAdmin(ADMIN_PATHS.business(publicId));
  if (!access.authorized) {
    notFound();
  }
  const organization = await getOrganizationByPublicId(publicId);
  if (!organization) {
    notFound();
  }
  const [members, work] = await Promise.all([
    listOrganizationMembers(organization.id),
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
      {organization.website ? <p className="mt-3 text-sm">{organization.website}</p> : null}
      {organization.country ? <p className="mt-2 text-sm text-muted">{organization.country}</p> : null}
      {organization.description ? <p className="mt-4 text-[15px]">{organization.description}</p> : null}
      <section className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-navy/50">Members</h2>
        <ul className="mt-3 space-y-2 text-[15px]">
          {members.map((member) => (
            <li key={member.userId}>
              {member.displayName} · {member.role}
            </li>
          ))}
        </ul>
      </section>
      <section className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-navy/50">Requests</h2>
        <ul className="mt-3 space-y-2">
          {work.requests.map((item) => (
            <li key={item.publicId}>
              <Link href={WORK_REQUEST_PATHS.adminDetail(item.publicId)} className="font-semibold text-blue">
                {item.title}
              </Link>
            </li>
          ))}
        </ul>
      </section>
      <section className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-navy/50">Quotes</h2>
        <ul className="mt-3 space-y-2">
          {work.quotes.map((item) => (
            <li key={item.publicId}>
              <Link href={QUOTE_PATHS.detail(item.publicId)} className="font-semibold text-blue">
                {item.publicId}
              </Link>{" "}
              · {item.status}
            </li>
          ))}
        </ul>
      </section>
      <section className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-navy/50">Projects</h2>
        <ul className="mt-3 space-y-2">
          {work.projects.map((item) => (
            <li key={item.publicId}>
              <Link href={PROJECT_PATHS.adminDetail(item.publicId)} className="font-semibold text-blue">
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </section>
      <section className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-navy/50">Contracts / SOW</h2>
        <ul className="mt-3 space-y-2 text-[15px]">
          {work.contracts.map((item) => (
            <li key={item.publicId}>
              {item.publicId} · {item.title}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
