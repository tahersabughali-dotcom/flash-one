import { createSessionSupabaseClient } from "@/lib/supabase/server";
import type { ProjectStatus } from "@/modules/projects";
import type { QuoteStatus } from "@/modules/quotes";

export type PortalRequest = {
  publicId: string;
  title: string;
  status: string;
};

export type PortalQuote = {
  publicId: string;
  status: QuoteStatus;
  createdAt: string;
};

export type PortalProject = {
  publicId: string;
  name: string;
  status: ProjectStatus;
};

export type PortalDeliverable = {
  publicId: string;
  title: string;
  status: string;
};

export type PortalMessage = {
  publicId: string;
  body: string;
  createdAt: string;
};

export async function listPortalHomeData(userId: string): Promise<{
  requests: PortalRequest[];
  quotes: PortalQuote[];
  projects: PortalProject[];
  deliverables: PortalDeliverable[];
  messages: PortalMessage[];
}> {
  const supabase = await createSessionSupabaseClient();
  if (!supabase) {
    return { requests: [], quotes: [], projects: [], deliverables: [], messages: [] };
  }

  const { data: memberships } = await supabase
    .from("organization_memberships")
    .select("organization_id")
    .eq("user_id", userId);
  const organizationIds = (memberships ?? []).map((row) => row.organization_id);

  const [requests, quotes, projects, deliverables, messages] = await Promise.all([
    supabase
      .from("work_requests")
      .select("public_id, title, status, created_at")
      .in("status", ["submitted", "under_review", "needs_information", "qualified"])
      .order("created_at", { ascending: false })
      .limit(8),
    supabase
      .from("quotes")
      .select("public_id, status, created_at")
      .eq("status", "sent")
      .order("created_at", { ascending: false })
      .limit(8),
    supabase
      .from("projects")
      .select("public_id, name, status, individual_user_id, organization_id")
      .in("status", ["planned", "active", "on_hold"])
      .order("created_at", { ascending: false })
      .limit(12),
    supabase
      .from("deliverables")
      .select("public_id, title, status, created_at")
      .eq("status", "submitted")
      .order("created_at", { ascending: false })
      .limit(6),
    supabase
      .from("conversation_messages")
      .select("public_id, body, created_at")
      .order("created_at", { ascending: false })
      .limit(6),
  ]);

  const customerProjects = (projects.data ?? []).filter(
    (row) =>
      row.individual_user_id === userId ||
      (row.organization_id !== null && organizationIds.includes(row.organization_id)),
  );

  return {
    requests: (requests.data ?? []).map((row) => ({
      publicId: row.public_id,
      title: row.title,
      status: row.status,
    })),
    quotes: (quotes.data ?? []).flatMap((row) =>
      row.status === "sent"
        ? [{ publicId: row.public_id, status: row.status, createdAt: row.created_at }]
        : [],
    ),
    projects: customerProjects.map((row) => ({
      publicId: row.public_id,
      name: row.name,
      status: row.status as ProjectStatus,
    })),
    deliverables: (deliverables.data ?? []).map((row) => ({
      publicId: row.public_id,
      title: row.title,
      status: row.status,
    })),
    messages: (messages.data ?? []).map((row) => ({
      publicId: row.public_id,
      body: row.body,
      createdAt: row.created_at,
    })),
  };
}

export async function listAssignedDeveloperProjects(): Promise<PortalProject[]> {
  const supabase = await createSessionSupabaseClient();
  if (!supabase) {
    return [];
  }
  const { data: assignments } = await supabase
    .from("project_developer_assignments")
    .select("project_id")
    .eq("status", "active");
  const ids = (assignments ?? []).map((row) => row.project_id);
  if (ids.length === 0) {
    return [];
  }
  const { data } = await supabase
    .from("projects")
    .select("public_id, name, status")
    .in("id", ids)
    .order("created_at", { ascending: false });
  return (data ?? []).map((row) => ({
    publicId: row.public_id,
    name: row.name,
    status: row.status as ProjectStatus,
  }));
}
