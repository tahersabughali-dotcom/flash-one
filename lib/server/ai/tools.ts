import { AI_TOOL_ALLOWLIST, type AiToolName } from "@/modules/ai/constants";

export type AiToolCall = {
  name: AiToolName;
  arguments: Record<string, unknown>;
};

const FORBIDDEN = new Set([
  "sql",
  "shell",
  "javascript",
  "http",
  "database_mutation",
  "execute",
  "eval",
]);

export function parseAllowlistedTool(name: string): AiToolName | null {
  if (FORBIDDEN.has(name.toLowerCase())) {
    return null;
  }
  return (AI_TOOL_ALLOWLIST as readonly string[]).includes(name)
    ? (name as AiToolName)
    : null;
}

export function describeAiToolBoundary() {
  return {
    allowlist: AI_TOOL_ALLOWLIST,
    forbidden: Array.from(FORBIDDEN),
    note: "Model-generated content cannot run SQL, shell, JavaScript, HTTP, or database mutations.",
  };
}
