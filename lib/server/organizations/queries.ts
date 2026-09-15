import { createSessionSupabaseClient } from "@/lib/supabase/server";

export type OrganizationRecord = {
  id: string;
  publicId: string;
  name: string;
  website: string | null;
  country: string | null;
  description: string | null;
};

export type OrganizationMember = {
  userId: string;
  role: "owner" | "member";
  displayName: string;
};

export type OrganizationInvitation = {
  id: string;
  publicId: string;
  invitedEmail: string;
  status: string;
  expiresAt: string;
};

export async function getOrganizationByPublicId(
  publicId: string,
): Promise<OrganizationRecord | null> {
  const supabase = await createSessionSupabaseClient();
  if (!supabase) {
    return null;
  }
  const { data } = await supabase
    .from("organizations")
    .select("id, public_id, name, website, country, description")
    .eq("public_id", publicId)
    .maybeSingle();
  if (!data) {
    return null;
  }
  return {
    id: data.id,
    publicId: data.public_id,
    name: data.name,
    website: data.website,
    country: data.country,
    description: data.description,
  };
}

export async function listOrganizationMembers(
  organizationId: string,
): Promise<OrganizationMember[]> {
  const supabase = await createSessionSupabaseClient();
  if (!supabase) {
    return [];
  }
  const { data: memberships } = await supabase
    .from("organization_memberships")
    .select("user_id, role")
    .eq("organization_id", organizationId);
  const userIds = (memberships ?? []).map((row) => row.user_id);
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
  return (memberships ?? []).flatMap((row) => {
    if (row.role !== "owner" && row.role !== "member") {
      return [];
    }
    return [
      {
        userId: row.user_id,
        role: row.role,
        displayName: names.get(row.user_id) ?? "Member",
      },
    ];
  });
}

export async function listOrganizationInvitations(
  organizationId: string,
): Promise<OrganizationInvitation[]> {
  const supabase = await createSessionSupabaseClient();
  if (!supabase) {
    return [];
  }
  const { data } = await supabase
    .from("organization_invitations")
    .select("id, public_id, invited_email, status, expires_at")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false });
  return (data ?? []).map((row) => ({
    id: row.id,
    publicId: row.public_id,
    invitedEmail: row.invited_email,
    status: row.status,
    expiresAt: row.expires_at,
  }));
}

export async function listOrganizationWork(
  organizationId: string,
): Promise<{
  requests: Array<{ publicId: string; title: string; status: string }>;
  quotes: Array<{ publicId: string; status: string }>;
  projects: Array<{ publicId: string; name: string; status: string }>;
  contracts: Array<{ publicId: string; title: string; status: string }>;
}> {
  const supabase = await createSessionSupabaseClient();
  if (!supabase) {
    return { requests: [], quotes: [], projects: [], contracts: [] };
  }
  const { data: requests } = await supabase
    .from("work_requests")
    .select("id, public_id, title, status")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false })
    .limit(50);
  const requestIds = (requests ?? []).map((row) => row.id);
  const { data: quotes } =
    requestIds.length > 0
      ? await supabase
          .from("quotes")
          .select("public_id, status, work_request_id")
          .in("work_request_id", requestIds)
      : { data: [] };
  const { data: projects } = await supabase
    .from("projects")
    .select("id, public_id, name, status")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false })
    .limit(50);
  const projectIds = (projects ?? []).map((row) => row.id);
  const { data: contracts } =
    projectIds.length > 0
      ? await supabase
          .from("contracts")
          .select("public_id, title, status")
          .in("project_id", projectIds)
      : { data: [] };
  return {
    requests: (requests ?? []).map((row) => ({
      publicId: row.public_id,
      title: row.title,
      status: row.status,
    })),
    quotes: (quotes ?? []).map((row) => ({
      publicId: row.public_id,
      status: row.status,
    })),
    projects: (projects ?? []).map((row) => ({
      publicId: row.public_id,
      name: row.name,
      status: row.status,
    })),
    contracts: (contracts ?? []).map((row) => ({
      publicId: row.public_id,
      title: row.title,
      status: row.status,
    })),
  };
}
