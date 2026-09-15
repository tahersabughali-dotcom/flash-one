import { createSessionSupabaseClient } from "@/lib/supabase/server";
import type { ProjectStatus } from "@/modules/projects";
import { listRange } from "@/lib/server/pagination";

export type ProjectListItem = {
  publicId: string;
  name: string;
  status: ProjectStatus;
  createdAt: string;
};

export type ProjectDetail = ProjectListItem & {
  id: string;
  workRequestPublicId: string;
  acceptedQuotePublicId: string;
  startedAt: string | null;
  targetCompletionAt: string | null;
  completedAt: string | null;
};

const STATUSES: ProjectStatus[] = [
  "planned",
  "active",
  "on_hold",
  "completed",
  "cancelled",
];

function isStatus(value: string): value is ProjectStatus {
  return STATUSES.includes(value as ProjectStatus);
}

export async function listProjects(page = 1): Promise<ProjectListItem[]> {
  const supabase = await createSessionSupabaseClient();
  if (!supabase) {
    return [];
  }
  const { from, to } = listRange(page);
  const { data } = await supabase
    .from("projects")
    .select("public_id, name, status, created_at")
    .order("created_at", { ascending: false })
    .range(from, to);

  return (data ?? []).flatMap((row) => {
    if (!isStatus(row.status)) {
      return [];
    }
    return [
      {
        publicId: row.public_id,
        name: row.name,
        status: row.status,
        createdAt: row.created_at,
      },
    ];
  });
}

export async function listCustomerProjects(
  userId: string,
  page = 1,
): Promise<ProjectListItem[]> {
  const supabase = await createSessionSupabaseClient();
  if (!supabase) {
    return [];
  }
  const { data: memberships } = await supabase
    .from("organization_memberships")
    .select("organization_id")
    .eq("user_id", userId);
  const organizationIds = (memberships ?? []).map((row) => row.organization_id);
  const { from, to } = listRange(page);
  let query = supabase
    .from("projects")
    .select("public_id, name, status, created_at, individual_user_id, organization_id")
    .order("created_at", { ascending: false })
    .range(from, to);
  query =
    organizationIds.length > 0
      ? query.or(
          `individual_user_id.eq.${userId},organization_id.in.(${organizationIds.join(",")})`,
        )
      : query.eq("individual_user_id", userId);
  const { data } = await query;

  return (data ?? []).flatMap((row) => {
    if (!isStatus(row.status)) {
      return [];
    }
    const owned =
      row.individual_user_id === userId ||
      (row.organization_id !== null && organizationIds.includes(row.organization_id));
    if (!owned) {
      return [];
    }
    return [
      {
        publicId: row.public_id,
        name: row.name,
        status: row.status,
        createdAt: row.created_at,
      },
    ];
  });
}

export async function getProjectByWorkRequestId(
  workRequestId: string,
): Promise<ProjectListItem | null> {
  const supabase = await createSessionSupabaseClient();
  if (!supabase) {
    return null;
  }
  const { data } = await supabase
    .from("projects")
    .select("public_id, name, status, created_at")
    .eq("work_request_id", workRequestId)
    .maybeSingle();

  if (!data || !isStatus(data.status)) {
    return null;
  }
  return {
    publicId: data.public_id,
    name: data.name,
    status: data.status,
    createdAt: data.created_at,
  };
}

export async function getProjectByPublicId(
  publicId: string,
): Promise<ProjectDetail | null> {
  const supabase = await createSessionSupabaseClient();
  if (!supabase) {
    return null;
  }

  const { data } = await supabase
    .from("projects")
    .select(
      "id, public_id, name, status, created_at, started_at, target_completion_at, completed_at, work_request_id, accepted_quote_id",
    )
    .eq("public_id", publicId)
    .maybeSingle();

  if (!data || !isStatus(data.status)) {
    return null;
  }

  const [{ data: request }, { data: quote }] = await Promise.all([
    supabase
      .from("work_requests")
      .select("public_id")
      .eq("id", data.work_request_id)
      .maybeSingle(),
    supabase
      .from("quotes")
      .select("public_id")
      .eq("id", data.accepted_quote_id)
      .maybeSingle(),
  ]);

  return {
    id: data.id,
    publicId: data.public_id,
    name: data.name,
    status: data.status,
    createdAt: data.created_at,
    startedAt: data.started_at,
    targetCompletionAt: data.target_completion_at,
    completedAt: data.completed_at,
    workRequestPublicId: request?.public_id ?? "",
    acceptedQuotePublicId: quote?.public_id ?? "",
  };
}
