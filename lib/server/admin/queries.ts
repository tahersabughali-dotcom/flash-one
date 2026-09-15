import { createSessionSupabaseClient } from "@/lib/supabase/server";
import { adminSearchSchema } from "@/modules/account";

export type AdminCounts = {
  newRequests: number;
  requestsUnderReview: number;
  quotesAwaitingCustomer: number;
  activeProjects: number;
  deliverablesAwaitingCustomer: number;
  organizations: number;
  individualRelationships: number;
  developers: number;
};

async function count(
  table:
    | "work_requests"
    | "quotes"
    | "projects"
    | "deliverables"
    | "organizations"
    | "individual_accounts"
    | "developer_profiles",
  filter?: { column: string; value: string },
): Promise<number> {
  const supabase = await createSessionSupabaseClient();
  if (!supabase) {
    return 0;
  }
  const query = supabase.from(table).select("*", { count: "exact", head: true });
  const { count: total } = filter ? await query.eq(filter.column, filter.value) : await query;
  return total ?? 0;
}

export async function getAdminCounts(): Promise<AdminCounts> {
  const supabase = await createSessionSupabaseClient();
  if (!supabase) {
    return {
      newRequests: 0,
      requestsUnderReview: 0,
      quotesAwaitingCustomer: 0,
      activeProjects: 0,
      deliverablesAwaitingCustomer: 0,
      organizations: 0,
      individualRelationships: 0,
      developers: 0,
    };
  }
  const [
    newRequests,
    requestsUnderReview,
    quotesAwaitingCustomer,
    activeProjects,
    deliverablesAwaitingCustomer,
    organizations,
    individualRelationships,
    developers,
  ] = await Promise.all([
    count("work_requests", { column: "status", value: "submitted" }),
    count("work_requests", { column: "status", value: "under_review" }),
    count("quotes", { column: "status", value: "sent" }),
    count("projects", { column: "status", value: "active" }),
    count("deliverables", { column: "status", value: "submitted" }),
    count("organizations"),
    count("individual_accounts"),
    count("developer_profiles"),
  ]);
  return {
    newRequests,
    requestsUnderReview,
    quotesAwaitingCustomer,
    activeProjects,
    deliverablesAwaitingCustomer,
    organizations,
    individualRelationships,
    developers,
  };
}

export type AdminCustomerListItem = {
  publicId: string;
  displayName: string;
  createdAt: string;
  requestCount: number;
  projectCount: number;
};

export async function listAdminCustomers(): Promise<AdminCustomerListItem[]> {
  const supabase = await createSessionSupabaseClient();
  if (!supabase) {
    return [];
  }
  const { data: accounts } = await supabase
    .from("individual_accounts")
    .select("user_id, public_id, created_at")
    .order("created_at", { ascending: false });
  const userIds = (accounts ?? []).map((row) => row.user_id);
  const names = new Map<string, string>();
  if (userIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, full_name")
      .in("user_id", userIds);
    for (const profile of profiles ?? []) {
      names.set(profile.user_id, profile.full_name);
    }
  }
  const items: AdminCustomerListItem[] = [];
  for (const account of accounts ?? []) {
    const [{ count: requestCount }, { count: projectCount }] = await Promise.all([
      supabase
        .from("work_requests")
        .select("id", { count: "exact", head: true })
        .eq("individual_user_id", account.user_id),
      supabase
        .from("projects")
        .select("id", { count: "exact", head: true })
        .eq("individual_user_id", account.user_id),
    ]);
    items.push({
      publicId: account.public_id,
      displayName: names.get(account.user_id) ?? "Customer",
      createdAt: account.created_at,
      requestCount: requestCount ?? 0,
      projectCount: projectCount ?? 0,
    });
  }
  return items;
}

export async function getAdminCustomerByPublicId(publicId: string): Promise<{
  publicId: string;
  displayName: string;
  createdAt: string;
  userId: string;
} | null> {
  const supabase = await createSessionSupabaseClient();
  if (!supabase) {
    return null;
  }
  const { data } = await supabase
    .from("individual_accounts")
    .select("user_id, public_id, created_at")
    .eq("public_id", publicId)
    .maybeSingle();
  if (!data) {
    return null;
  }
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("user_id", data.user_id)
    .maybeSingle();
  return {
    publicId: data.public_id,
    displayName: profile?.full_name ?? "Customer",
    createdAt: data.created_at,
    userId: data.user_id,
  };
}

export type AdminOrganizationListItem = {
  publicId: string;
  name: string;
  createdAt: string;
  memberCount: number;
};

export async function listAdminOrganizations(): Promise<AdminOrganizationListItem[]> {
  const supabase = await createSessionSupabaseClient();
  if (!supabase) {
    return [];
  }
  const { data } = await supabase
    .from("organizations")
    .select("id, public_id, name, created_at")
    .order("created_at", { ascending: false });
  const items: AdminOrganizationListItem[] = [];
  for (const organization of data ?? []) {
    const { count: memberCount } = await supabase
      .from("organization_memberships")
      .select("user_id", { count: "exact", head: true })
      .eq("organization_id", organization.id);
    items.push({
      publicId: organization.public_id,
      name: organization.name,
      createdAt: organization.created_at,
      memberCount: memberCount ?? 0,
    });
  }
  return items;
}

export type AdminDeveloperListItem = {
  publicId: string;
  displayName: string;
  availabilityStatus: string;
  createdAt: string;
};

export async function listAdminDevelopers(): Promise<AdminDeveloperListItem[]> {
  const supabase = await createSessionSupabaseClient();
  if (!supabase) {
    return [];
  }
  const { data } = await supabase
    .from("developer_profiles")
    .select("public_id, display_name, availability_status, created_at")
    .order("created_at", { ascending: false });
  return (data ?? []).map((row) => ({
    publicId: row.public_id,
    displayName: row.display_name,
    availabilityStatus: row.availability_status,
    createdAt: row.created_at,
  }));
}

export type AdminSearchResult = {
  kind: "customer" | "business" | "developer" | "project" | "request";
  publicId: string;
  label: string;
  href: string;
};

export async function searchAdminRecords(rawQuery: string): Promise<AdminSearchResult[]> {
  const parsed = adminSearchSchema.safeParse({ q: rawQuery });
  if (!parsed.success || parsed.data.q.length < 2) {
    return [];
  }
  const supabase = await createSessionSupabaseClient();
  if (!supabase) {
    return [];
  }
  const q = `%${parsed.data.q}%`;
  const [customers, organizations, developers, projects, requests] = await Promise.all([
    supabase.from("individual_accounts").select("public_id, user_id").ilike("public_id", q).limit(8),
    supabase
      .from("organizations")
      .select("public_id, name")
      .or(`public_id.ilike.${q},name.ilike.${q}`)
      .limit(8),
    supabase
      .from("developer_profiles")
      .select("public_id, display_name")
      .or(`public_id.ilike.${q},display_name.ilike.${q}`)
      .limit(8),
    supabase
      .from("projects")
      .select("public_id, name")
      .or(`public_id.ilike.${q},name.ilike.${q}`)
      .limit(8),
    supabase
      .from("work_requests")
      .select("public_id, title")
      .or(`public_id.ilike.${q},title.ilike.${q}`)
      .limit(8),
  ]);

  const results: AdminSearchResult[] = [];
  const customerUserIds = (customers.data ?? []).map((row) => row.user_id);
  const names = new Map<string, string>();
  if (customerUserIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, full_name")
      .in("user_id", customerUserIds);
    for (const profile of profiles ?? []) {
      names.set(profile.user_id, profile.full_name);
    }
  }
  if (parsed.data.q.length >= 2) {
    const { data: namedProfiles } = await supabase
      .from("profiles")
      .select("user_id, full_name")
      .ilike("full_name", q)
      .limit(8);
    const extraIds = (namedProfiles ?? []).map((row) => row.user_id);
    if (extraIds.length > 0) {
      const { data: extraAccounts } = await supabase
        .from("individual_accounts")
        .select("public_id, user_id")
        .in("user_id", extraIds);
      for (const account of extraAccounts ?? []) {
        results.push({
          kind: "customer",
          publicId: account.public_id,
          label: namedProfiles?.find((row) => row.user_id === account.user_id)?.full_name ?? account.public_id,
          href: `/admin/customers/${account.public_id}`,
        });
      }
    }
  }
  for (const row of customers.data ?? []) {
    results.push({
      kind: "customer",
      publicId: row.public_id,
      label: names.get(row.user_id) ?? row.public_id,
      href: `/admin/customers/${row.public_id}`,
    });
  }
  for (const row of organizations.data ?? []) {
    results.push({
      kind: "business",
      publicId: row.public_id,
      label: row.name,
      href: `/admin/businesses/${row.public_id}`,
    });
  }
  for (const row of developers.data ?? []) {
    results.push({
      kind: "developer",
      publicId: row.public_id,
      label: row.display_name,
      href: `/admin/developers/${row.public_id}`,
    });
  }
  for (const row of projects.data ?? []) {
    results.push({
      kind: "project",
      publicId: row.public_id,
      label: row.name,
      href: `/admin/projects/${row.public_id}`,
    });
  }
  for (const row of requests.data ?? []) {
    results.push({
      kind: "request",
      publicId: row.public_id,
      label: row.title,
      href: `/admin/requests/${row.public_id}`,
    });
  }
  const seen = new Set<string>();
  return results.filter((item) => {
    const key = `${item.kind}:${item.publicId}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}
