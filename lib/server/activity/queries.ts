import { createSessionSupabaseClient } from "@/lib/supabase/server";

export type ProjectActivityItem = {
  eventType: string;
  label: string;
  createdAt: string;
};

export async function listProjectActivity(
  projectId: string,
): Promise<ProjectActivityItem[]> {
  const supabase = await createSessionSupabaseClient();
  if (!supabase) {
    return [];
  }
  const { data } = await supabase
    .from("project_activity")
    .select("event_type, label, created_at")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false })
    .limit(30);

  return (data ?? []).map((row) => ({
    eventType: row.event_type,
    label: row.label,
    createdAt: row.created_at,
  }));
}
