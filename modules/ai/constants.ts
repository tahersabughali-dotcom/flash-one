export const AI_PATHS = {
  workspace: "/app/ai",
} as const;

export const AI_PURPOSES = ["project_idea", "general"] as const;
export type AiPurpose = (typeof AI_PURPOSES)[number];
