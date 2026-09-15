"use server";

import { redirect } from "next/navigation";
import { firstZodError } from "@/modules/auth";
import {
  FILE_BUCKET,
  FILE_MAX_BYTES,
  canonicalMimeForFilename,
  fileUploadMetaSchema,
} from "@/modules/files";
import { changeRequestSchema } from "@/modules/deliverables";
import { messageWriteSchema } from "@/modules/conversations";
import { PROJECT_PATHS } from "@/modules/projects";
import { requireCompletedOnboarding } from "@/lib/server/account";
import { isPlatformAdmin, requireAuthenticatedUser } from "@/lib/server/auth";
import { createSessionSupabaseClient } from "@/lib/supabase/server";
import { getProjectByPublicId } from "@/lib/server/projects";
import { getProjectFileByPublicId } from "@/lib/server/files";

export type ProjectWorkspaceFormState = {
  error: string | null;
};

function mapError(message: string | undefined): string {
  const lower = (message ?? "").toLowerCase();
  if (lower.includes("not authorized")) {
    return "You do not have access to this project.";
  }
  if (lower.includes("unsupported") || lower.includes("filename")) {
    return "That file type is not accepted.";
  }
  if (lower.includes("file size") || lower.includes("empty")) {
    return "Check the file size and try again.";
  }
  if (lower.includes("change request")) {
    return "Explain the changes needed.";
  }
  return "Unable to complete this action. Please try again.";
}

async function requireProject(projectPublicId: string) {
  const { session } = await requireCompletedOnboarding(PROJECT_PATHS.detail(projectPublicId));
  const project = await getProjectByPublicId(projectPublicId);
  if (!project) {
    return { error: "Project not found." as const, project: null, supabase: null, session: null };
  }
  const supabase = await createSessionSupabaseClient();
  if (!supabase) {
    return {
      error: "Unable to continue. Please try again." as const,
      project: null,
      supabase: null,
      session: null,
    };
  }
  const { data: customer } = await supabase.rpc("is_project_customer", {
    p_project_id: project.id,
  });
  if (!customer) {
    return {
      error: "You do not have access to this project." as const,
      project: null,
      supabase: null,
      session: null,
    };
  }
  return { error: null, project, supabase, session };
}

export async function uploadProjectFileAction(
  _previous: ProjectWorkspaceFormState,
  formData: FormData,
): Promise<ProjectWorkspaceFormState> {
  const projectPublicId = String(formData.get("projectPublicId") || "");
  const loaded = await requireProject(projectPublicId);
  if (loaded.error || !loaded.project || !loaded.supabase) {
    return { error: loaded.error ?? "Project not found." };
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return { error: "Choose a file to upload." };
  }
  const parsed = fileUploadMetaSchema.safeParse({
    projectPublicId,
    filename: file.name,
    size: file.size,
  });
  if (!parsed.success) {
    return { error: firstZodError(parsed.error) };
  }
  if (file.size > FILE_MAX_BYTES) {
    return { error: "That file is too large. The limit is 20 MB." };
  }
  const mime = canonicalMimeForFilename(file.name);
  if (!mime) {
    return { error: "That file type is not accepted." };
  }
  if (file.type && file.type !== mime && file.type !== "application/octet-stream") {
    return { error: "That file type is not accepted." };
  }

  const { data: registered, error: registerError } = await loaded.supabase.rpc(
    "register_project_file",
    {
      p_project_id: loaded.project.id,
      p_original_filename: file.name,
      p_claimed_mime: file.type || mime,
      p_size_bytes: file.size,
      p_visibility: "customer",
    },
  );
  if (registerError || !registered) {
    return { error: mapError(registerError?.message) };
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const { error: uploadError } = await loaded.supabase.storage
    .from(FILE_BUCKET)
    .upload(registered.storage_path, bytes, {
      contentType: registered.mime_type,
      upsert: false,
    });
  if (uploadError) {
    return { error: "The file could not be stored. Please try again." };
  }

  const { error: confirmError } = await loaded.supabase.rpc("confirm_project_file_upload", {
    p_file_id: registered.id,
  });
  if (confirmError) {
    return { error: mapError(confirmError.message) };
  }

  redirect(`${PROJECT_PATHS.detail(projectPublicId)}#files`);
}

export async function sendProjectMessageAction(
  _previous: ProjectWorkspaceFormState,
  formData: FormData,
): Promise<ProjectWorkspaceFormState> {
  const parsed = messageWriteSchema.safeParse({
    projectPublicId: formData.get("projectPublicId"),
    body: formData.get("body"),
  });
  if (!parsed.success) {
    return { error: firstZodError(parsed.error) };
  }
  const loaded = await requireProject(parsed.data.projectPublicId);
  if (loaded.error || !loaded.project || !loaded.supabase || !loaded.session) {
    return { error: loaded.error ?? "Project not found." };
  }

  const { data: conversation, error: conversationError } = await loaded.supabase.rpc(
    "ensure_project_conversation",
    { p_project_id: loaded.project.id },
  );
  if (conversationError || !conversation) {
    return { error: mapError(conversationError?.message) };
  }

  const { error } = await loaded.supabase.from("conversation_messages").insert({
    conversation_id: conversation.id,
    sender_user_id: loaded.session.userId,
    sender_kind: "customer",
    body: parsed.data.body,
  });
  if (error) {
    return { error: mapError(error.message) };
  }
  redirect(`${PROJECT_PATHS.detail(parsed.data.projectPublicId)}#conversation`);
}

export async function acceptDeliverableAction(
  _previous: ProjectWorkspaceFormState,
  formData: FormData,
): Promise<ProjectWorkspaceFormState> {
  const projectPublicId = String(formData.get("projectPublicId") || "");
  const deliverablePublicId = String(formData.get("deliverablePublicId") || "");
  const loaded = await requireProject(projectPublicId);
  if (loaded.error || !loaded.supabase) {
    return { error: loaded.error ?? "Project not found." };
  }
  const { data: deliverable } = await loaded.supabase
    .from("deliverables")
    .select("id")
    .eq("public_id", deliverablePublicId)
    .maybeSingle();
  if (!deliverable) {
    return { error: "Deliverable not found." };
  }
  const { error } = await loaded.supabase.rpc("accept_deliverable", {
    p_deliverable_id: deliverable.id,
  });
  if (error) {
    return { error: mapError(error.message) };
  }
  redirect(`${PROJECT_PATHS.detail(projectPublicId)}#deliverables`);
}

export async function requestDeliverableChangesAction(
  _previous: ProjectWorkspaceFormState,
  formData: FormData,
): Promise<ProjectWorkspaceFormState> {
  const parsed = changeRequestSchema.safeParse({
    deliverablePublicId: formData.get("deliverablePublicId"),
    note: formData.get("note"),
  });
  if (!parsed.success) {
    return { error: firstZodError(parsed.error) };
  }
  const projectPublicId = String(formData.get("projectPublicId") || "");
  const loaded = await requireProject(projectPublicId);
  if (loaded.error || !loaded.supabase) {
    return { error: loaded.error ?? "Project not found." };
  }
  const { data: deliverable } = await loaded.supabase
    .from("deliverables")
    .select("id")
    .eq("public_id", parsed.data.deliverablePublicId)
    .maybeSingle();
  if (!deliverable) {
    return { error: "Deliverable not found." };
  }
  const { error } = await loaded.supabase.rpc("request_deliverable_changes", {
    p_deliverable_id: deliverable.id,
    p_note: parsed.data.note,
  });
  if (error) {
    return { error: mapError(error.message) };
  }
  redirect(`${PROJECT_PATHS.detail(projectPublicId)}#deliverables`);
}

export async function downloadProjectFileAction(formData: FormData): Promise<void> {
  const filePublicId = String(formData.get("filePublicId") || "");
  const projectPublicId = String(formData.get("projectPublicId") || "");
  const session = await requireAuthenticatedUser(
    projectPublicId ? PROJECT_PATHS.detail(projectPublicId) : "/app/projects",
  );
  const admin = await isPlatformAdmin(session.userId);
  if (!admin) {
    await requireCompletedOnboarding(
      projectPublicId ? PROJECT_PATHS.detail(projectPublicId) : "/app/projects",
    );
  }
  const workspace = String(formData.get("workspace") || "customer");
  const fallback = admin
    ? projectPublicId
      ? `${PROJECT_PATHS.adminDetail(projectPublicId)}#files`
      : "/admin/projects"
    : projectPublicId
      ? workspace === "developer"
        ? `/app/developer/projects/${projectPublicId}#files`
        : `${PROJECT_PATHS.detail(projectPublicId)}#files`
      : workspace === "developer"
        ? "/app/developer/projects"
        : "/app/projects";
  const file = await getProjectFileByPublicId(filePublicId);
  if (!file) {
    redirect(fallback);
  }
  const supabase = await createSessionSupabaseClient();
  if (!supabase) {
    redirect(fallback);
  }
  const { data, error } = await supabase.storage
    .from(file.storageBucket)
    .createSignedUrl(file.storagePath, 60, {
      download: file.originalFilename,
    });
  if (error || !data?.signedUrl) {
    redirect(fallback);
  }
  redirect(data.signedUrl);
}
