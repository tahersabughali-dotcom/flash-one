export const AI_PATHS = {
  workspace: "/app/ai",
  admin: "/admin/settings/ai",
} as const;

export const AI_PURPOSES = [
  "project_idea",
  "general",
  "work_request",
  "project_assistance",
  "admin_assistance",
] as const;
export type AiPurpose = (typeof AI_PURPOSES)[number];

export const AI_AUDIENCES = ["customer", "developer", "admin"] as const;
export type AiAudience = (typeof AI_AUDIENCES)[number];

export const AI_CONFIRMATION_STATES = ["none", "suggested", "confirmed", "discarded"] as const;
export type AiConfirmationState = (typeof AI_CONFIRMATION_STATES)[number];

export const AI_TOOL_ALLOWLIST = [
  "draft_work_request",
  "summarize_project",
  "suggest_task_content",
  "explain_project_info",
] as const;
export type AiToolName = (typeof AI_TOOL_ALLOWLIST)[number];
