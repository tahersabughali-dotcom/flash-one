"use server";

import { redirect } from "next/navigation";
import { firstZodError } from "@/modules/auth";
import { AI_PATHS, aiMessageSchema, aiWorkRequestConfirmSchema } from "@/modules/ai";
import { requireCompletedOnboarding } from "@/lib/server/account";
import { sendAiMessage } from "@/lib/server/ai/core";
import { createSessionSupabaseClient } from "@/lib/supabase/server";
import { WORK_REQUEST_PATHS } from "@/modules/work-requests";

export type AiFormState = { error: string | null };

export async function sendAiMessageAction(
  _previous: AiFormState,
  formData: FormData,
): Promise<AiFormState> {
  await requireCompletedOnboarding(AI_PATHS.workspace);
  const parsed = aiMessageSchema.safeParse({
    conversationPublicId: formData.get("conversationPublicId") || undefined,
    body: formData.get("body"),
    idea: formData.get("idea") || undefined,
    goal: formData.get("goal") || undefined,
    businessContext: formData.get("businessContext") || undefined,
    desiredOutcome: formData.get("desiredOutcome") || undefined,
  });
  if (!parsed.success) {
    return { error: firstZodError(parsed.error) };
  }
  const result = await sendAiMessage(parsed.data);
  if ("error" in result) {
    return { error: result.error ?? "AI could not be started." };
  }
  redirect(`${AI_PATHS.workspace}?c=${result.conversationPublicId}`);
}

export async function confirmAiSuggestionAction(
  _previous: AiFormState,
  formData: FormData,
): Promise<AiFormState> {
  await requireCompletedOnboarding(AI_PATHS.workspace);
  const parsed = aiWorkRequestConfirmSchema.safeParse({
    conversationPublicId: formData.get("conversationPublicId"),
    owner: formData.get("owner"),
  });
  if (!parsed.success) {
    return { error: firstZodError(parsed.error) };
  }
  const supabase = await createSessionSupabaseClient();
  if (!supabase) {
    return { error: "Unable to create the request." };
  }
  const { data, error } = await supabase.rpc("confirm_ai_work_request_suggestion", {
    p_conversation_public_id: parsed.data.conversationPublicId,
    p_owner: parsed.data.owner,
  });
  if (error || !data || typeof data !== "object") {
    return { error: "Review the suggestion and try again. Nothing was created automatically." };
  }
  const publicId = String((data as { work_request_public_id?: string }).work_request_public_id ?? "");
  if (!publicId) {
    return { error: "Review the suggestion and try again. Nothing was created automatically." };
  }
  await supabase.rpc("process_pending_outbox");
  redirect(WORK_REQUEST_PATHS.detail(publicId));
}
