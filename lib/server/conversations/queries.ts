import { createSessionSupabaseClient } from "@/lib/supabase/server";
import type { MessageSenderKind } from "@/modules/conversations";

export type ProjectConversation = {
  id: string;
  publicId: string;
  status: string;
};

export type ProjectMessage = {
  publicId: string;
  senderKind: MessageSenderKind;
  isSelf: boolean;
  body: string;
  createdAt: string;
};

export async function getProjectConversation(
  projectId: string,
): Promise<ProjectConversation | null> {
  const supabase = await createSessionSupabaseClient();
  if (!supabase) {
    return null;
  }
  await supabase.rpc("ensure_project_conversation", { p_project_id: projectId });
  const { data } = await supabase
    .from("conversations")
    .select("id, public_id, status")
    .eq("project_id", projectId)
    .maybeSingle();
  if (!data) {
    return null;
  }
  return { id: data.id, publicId: data.public_id, status: data.status };
}

export async function listConversationMessages(
  conversationId: string,
  viewerUserId: string,
): Promise<ProjectMessage[]> {
  const supabase = await createSessionSupabaseClient();
  if (!supabase) {
    return [];
  }
  const { data } = await supabase
    .from("conversation_messages")
    .select("public_id, sender_user_id, sender_kind, body, created_at")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  return (data ?? []).flatMap((row) => {
    if (row.sender_kind !== "customer" && row.sender_kind !== "staff" && row.sender_kind !== "developer") {
      return [];
    }
    return [
      {
        publicId: row.public_id,
        senderKind: row.sender_kind,
        isSelf: row.sender_user_id === viewerUserId,
        body: row.body,
        createdAt: row.created_at,
      },
    ];
  });
}
