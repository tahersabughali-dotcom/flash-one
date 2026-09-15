import { createSessionSupabaseClient } from "@/lib/supabase/server";
import { createPrivilegedPaymentIngestClient } from "@/lib/server/payments/privileged-ingest";

type JsonMap = Record<string, unknown>;

export async function getAiStatus() {
  const supabase = await createSessionSupabaseClient();
  if (!supabase) {
    return { configured: false, code: null as string | null, developmentOnly: false };
  }
  const { data } = await supabase.rpc("public_ai_status");
  if (!data || typeof data !== "object") {
    return { configured: false, code: null as string | null, developmentOnly: false };
  }
  const row = data as JsonMap;
  const code = row.code ? String(row.code) : null;
  if (code === "development_test" && !isDevelopmentAiEnabled()) {
    return { configured: false, code: null, developmentOnly: true };
  }
  return {
    configured: Boolean(row.configured),
    code,
    displayName: row.display_name ? String(row.display_name) : null,
    developmentOnly: Boolean(row.development_only),
  };
}

export function isDevelopmentAiEnabled() {
  return (
    process.env.NODE_ENV !== "production" &&
    process.env.FLASH_ONE_ENABLE_DEV_AI_PROVIDER === "true"
  );
}

export function developmentAiReply(input: {
  body: string;
  idea?: string;
  goal?: string;
  businessContext?: string;
  desiredOutcome?: string;
}) {
  const title = (input.idea || input.body).slice(0, 160) || "Project idea";
  const summary =
    input.goal?.trim() ||
    input.body.slice(0, 400) ||
    "A structured work request draft prepared from the submitted idea.";
  const details = [
    input.businessContext ? `Context: ${input.businessContext}` : "",
    input.desiredOutcome ? `Desired outcome: ${input.desiredOutcome}` : "",
  ]
    .filter(Boolean)
    .join("\n");
  return {
    body: "This is a Flash One development assistant, not a live language model. Review the suggested work request before creating it. Nothing has been submitted yet.",
    suggestion: {
      title,
      summary,
      details: details || undefined,
      service_category: "other",
    },
  };
}

export async function sendAiMessage(input: {
  conversationPublicId?: string;
  body: string;
  idea?: string;
  goal?: string;
  businessContext?: string;
  desiredOutcome?: string;
}) {
  const status = await getAiStatus();
  if (!status.configured || status.code !== "development_test" || !isDevelopmentAiEnabled()) {
    return { error: "AI is not configured." };
  }
  const supabase = await createSessionSupabaseClient();
  if (!supabase) {
    return { error: "AI is not configured." };
  }
  let conversationPublicId = input.conversationPublicId;
  if (!conversationPublicId) {
    const { data, error } = await supabase.rpc("create_ai_conversation", {
      p_purpose: "project_idea",
    });
    if (error || !data || typeof data !== "object" || !("public_id" in data)) {
      return { error: "AI could not be started." };
    }
    conversationPublicId = String((data as { public_id: string }).public_id);
  }
  const combined = [
    input.body,
    input.idea ? `Idea: ${input.idea}` : "",
    input.goal ? `Goal: ${input.goal}` : "",
    input.businessContext ? `Context: ${input.businessContext}` : "",
    input.desiredOutcome ? `Outcome: ${input.desiredOutcome}` : "",
  ]
    .filter(Boolean)
    .join("\n");
  const { error: userError } = await supabase.rpc("insert_user_ai_message", {
    p_conversation_public_id: conversationPublicId,
    p_body: combined,
  });
  if (userError) {
    return { error: "AI could not be started." };
  }
  const reply = developmentAiReply(input);
  const privileged = createPrivilegedPaymentIngestClient();
  if (!privileged) {
    return { error: "AI is not configured." };
  }
  const { error: assistantError } = await privileged.rpc("insert_verified_assistant_ai_message", {
    p_conversation_public_id: conversationPublicId,
    p_body: reply.body,
    p_suggestion: reply.suggestion,
  });
  if (assistantError) {
    return { error: "AI could not be started." };
  }
  return { conversationPublicId };
}

export async function listAiConversations() {
  const supabase = await createSessionSupabaseClient();
  if (!supabase) {
    return [];
  }
  const { data } = await supabase
    .from("ai_conversations")
    .select("public_id, purpose, created_at, pending_suggestion, suggestion_consumed_at")
    .order("created_at", { ascending: false })
    .limit(20);
  return data ?? [];
}

export async function listAiMessages(conversationPublicId: string) {
  const supabase = await createSessionSupabaseClient();
  if (!supabase) {
    return [];
  }
  const { data: conversation } = await supabase
    .from("ai_conversations")
    .select("id")
    .eq("public_id", conversationPublicId)
    .maybeSingle();
  if (!conversation) {
    return [];
  }
  const { data } = await supabase
    .from("ai_messages")
    .select("public_id, role, body, structured_suggestion, created_at")
    .eq("conversation_id", conversation.id)
    .order("created_at", { ascending: true });
  return data ?? [];
}
