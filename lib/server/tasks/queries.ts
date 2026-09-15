import { createSessionSupabaseClient } from "@/lib/supabase/server";
import type { TaskPriority, TaskStatus } from "@/modules/tasks";

export type ProjectTask = {
  id: string;
  publicId: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueAt: string | null;
  completedAt: string | null;
  customerVisible: boolean;
  createdAt: string;
};

const STATUSES: TaskStatus[] = [
  "todo",
  "in_progress",
  "blocked",
  "completed",
  "cancelled",
];
const PRIORITIES: TaskPriority[] = ["low", "normal", "high", "urgent"];

export async function listProjectTasks(projectId: string): Promise<ProjectTask[]> {
  const supabase = await createSessionSupabaseClient();
  if (!supabase) {
    return [];
  }
  const { data } = await supabase
    .from("project_tasks")
    .select(
      "id, public_id, title, description, status, priority, due_at, completed_at, customer_visible, created_at",
    )
    .eq("project_id", projectId)
    .order("created_at", { ascending: true });

  return (data ?? []).flatMap((row) => {
    if (
      !STATUSES.includes(row.status as TaskStatus) ||
      !PRIORITIES.includes(row.priority as TaskPriority)
    ) {
      return [];
    }
    return [
      {
        id: row.id,
        publicId: row.public_id,
        title: row.title,
        description: row.description,
        status: row.status as TaskStatus,
        priority: row.priority as TaskPriority,
        dueAt: row.due_at,
        completedAt: row.completed_at,
        customerVisible: row.customer_visible,
        createdAt: row.created_at,
      },
    ];
  });
}
