export const PROJECT_PATHS = {
  list: "/app/projects",
  detail: (publicId: string) => `/app/projects/${publicId}`,
  adminList: "/admin/projects",
  adminDetail: (publicId: string) => `/admin/projects/${publicId}`,
} as const;

export const PROJECT_STATUSES = [
  "planned",
  "active",
  "on_hold",
  "completed",
  "cancelled",
] as const;

export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  planned: "Planned",
  active: "Active",
  on_hold: "On hold",
  completed: "Completed",
  cancelled: "Cancelled",
};
