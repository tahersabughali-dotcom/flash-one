import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePlatformAdmin } from "@/lib/server/auth";
import { getAdminCustomerByPublicId } from "@/lib/server/admin/queries";
import { createSessionSupabaseClient } from "@/lib/supabase/server";
import { ADMIN_PATHS } from "@/modules/account";
import { WORK_REQUEST_PATHS } from "@/modules/work-requests";
import { PROJECT_PATHS } from "@/modules/projects";
import { QUOTE_PATHS } from "@/modules/quotes";

export default async function AdminCustomerDetailPage({
  params,
}: {
  params: Promise<{ publicId: string }>;
}) {
  const { publicId } = await params;
  const access = await requirePlatformAdmin(ADMIN_PATHS.customer(publicId));
  if (!access.authorized) {
    notFound();
  }
  const customer = await getAdminCustomerByPublicId(publicId);
  if (!customer) {
    notFound();
  }
  const supabase = await createSessionSupabaseClient();
  if (!supabase) {
    notFound();
  }
  const [{ data: requests }, { data: projects }, { data: memberships }, { data: developer }] =
    await Promise.all([
      supabase
        .from("work_requests")
        .select("id, public_id, title, status")
        .eq("individual_user_id", customer.userId)
        .order("created_at", { ascending: false }),
      supabase
        .from("projects")
        .select("id, public_id, name, status")
        .eq("individual_user_id", customer.userId)
        .order("created_at", { ascending: false }),
      supabase
        .from("organization_memberships")
        .select("role, organization_id")
        .eq("user_id", customer.userId),
      supabase
        .from("developer_profiles")
        .select("public_id, display_name")
        .eq("user_id", customer.userId)
        .maybeSingle(),
    ]);
  const requestIds = (requests ?? []).map((row) => row.id);
  const { data: quotes } =
    requestIds.length > 0
      ? await supabase.from("quotes").select("public_id, status").in("work_request_id", requestIds)
      : { data: [] };
  const orgIds = (memberships ?? []).map((row) => row.organization_id);
  const { data: organizations } =
    orgIds.length > 0
      ? await supabase.from("organizations").select("public_id, name").in("id", orgIds)
      : { data: [] };

  return (
    <main>
      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-navy/50">
        {customer.publicId}
      </p>
      <h1 className="mt-3 text-3xl font-extrabold tracking-[-0.04em] text-navy-deep">
        {customer.displayName}
      </h1>
      <p className="mt-4 text-sm text-muted">
        Individual relationship since {new Date(customer.createdAt).toLocaleDateString("en-GB")}
      </p>
      <section className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-navy/50">Relationships</h2>
        <ul className="mt-3 space-y-2 text-[15px]">
          <li>Individual customer</li>
          {(organizations ?? []).map((organization) => (
            <li key={organization.public_id}>
              <Link href={ADMIN_PATHS.business(organization.public_id)} className="font-semibold text-blue">
                {organization.name}
              </Link>
            </li>
          ))}
          {developer ? (
            <li>
              <Link href={ADMIN_PATHS.developer(developer.public_id)} className="font-semibold text-blue">
                Developer · {developer.display_name}
              </Link>
            </li>
          ) : null}
        </ul>
      </section>
      <section className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-navy/50">Requests</h2>
        <ul className="mt-3 space-y-2">
          {(requests ?? []).map((request) => (
            <li key={request.public_id}>
              <Link href={WORK_REQUEST_PATHS.adminDetail(request.public_id)} className="font-semibold text-blue">
                {request.title}
              </Link>
            </li>
          ))}
        </ul>
      </section>
      <section className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-navy/50">Quotes</h2>
        <ul className="mt-3 space-y-2">
          {(quotes ?? []).map((quote) => (
            <li key={quote.public_id}>
              <Link href={QUOTE_PATHS.detail(quote.public_id)} className="font-semibold text-blue">
                {quote.public_id}
              </Link>{" "}
              · {quote.status}
            </li>
          ))}
        </ul>
      </section>
      <section className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-navy/50">Projects</h2>
        <ul className="mt-3 space-y-2">
          {(projects ?? []).map((project) => (
            <li key={project.public_id}>
              <Link href={PROJECT_PATHS.adminDetail(project.public_id)} className="font-semibold text-blue">
                {project.name}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
