import { createSessionSupabaseClient } from "@/lib/supabase/server";

export type DeveloperRecord = {
  userId: string;
  publicId: string;
  displayName: string;
  headline: string | null;
  bio: string | null;
  availabilityStatus: string;
  country: string | null;
  timezone: string | null;
  skills: string[];
  links: Array<{ label: string; url: string }>;
};

export async function getDeveloperProfileByUserId(
  userId: string,
): Promise<DeveloperRecord | null> {
  const supabase = await createSessionSupabaseClient();
  if (!supabase) {
    return null;
  }
  const { data } = await supabase
    .from("developer_profiles")
    .select(
      "user_id, public_id, display_name, headline, bio, availability_status, country, timezone",
    )
    .eq("user_id", userId)
    .maybeSingle();
  if (!data) {
    return null;
  }
  const [{ data: skills }, { data: links }] = await Promise.all([
    supabase
      .from("developer_skills")
      .select("skill")
      .eq("developer_user_id", data.user_id)
      .order("position"),
    supabase
      .from("developer_links")
      .select("label, url")
      .eq("developer_user_id", data.user_id)
      .order("position"),
  ]);
  return {
    userId: data.user_id,
    publicId: data.public_id,
    displayName: data.display_name,
    headline: data.headline,
    bio: data.bio,
    availabilityStatus: data.availability_status,
    country: data.country,
    timezone: data.timezone,
    skills: (skills ?? []).map((row) => row.skill),
    links: (links ?? []).map((row) => ({ label: row.label, url: row.url })),
  };
}

export async function getDeveloperProfileByPublicId(
  publicId: string,
): Promise<DeveloperRecord | null> {
  const supabase = await createSessionSupabaseClient();
  if (!supabase) {
    return null;
  }
  const { data } = await supabase
    .from("developer_profiles")
    .select("user_id")
    .eq("public_id", publicId)
    .maybeSingle();
  if (!data) {
    return null;
  }
  return getDeveloperProfileByUserId(data.user_id);
}

export async function listDeveloperAssignments(userId: string): Promise<
  Array<{
    projectPublicId: string;
    projectName: string;
    status: string;
    assignedAt: string;
  }>
> {
  const supabase = await createSessionSupabaseClient();
  if (!supabase) {
    return [];
  }
  const { data } = await supabase
    .from("project_developer_assignments")
    .select("status, assigned_at, project_id")
    .eq("developer_user_id", userId)
    .order("assigned_at", { ascending: false });
  const projectIds = (data ?? []).map((row) => row.project_id);
  const names = new Map<string, { publicId: string; name: string }>();
  if (projectIds.length > 0) {
    const { data: projects } = await supabase
      .from("projects")
      .select("id, public_id, name")
      .in("id", projectIds);
    for (const project of projects ?? []) {
      names.set(project.id, { publicId: project.public_id, name: project.name });
    }
  }
  return (data ?? []).flatMap((row) => {
    const project = names.get(row.project_id);
    if (!project) {
      return [];
    }
    return [
      {
        projectPublicId: project.publicId,
        projectName: project.name,
        status: row.status,
        assignedAt: row.assigned_at,
      },
    ];
  });
}
