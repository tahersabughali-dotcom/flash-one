"use server";

import { redirect } from "next/navigation";
import { firstZodError } from "@/modules/auth";
import { AUTH_PATHS } from "@/modules/auth/constants";
import { taskWriteSchema } from "@/modules/tasks";
import { deliverableWriteSchema } from "@/modules/deliverables";
import { messageWriteSchema } from "@/modules/conversations";
import {
  FILE_BUCKET,
  FILE_MAX_BYTES,
  canonicalMimeForFilename,
  fileUploadMetaSchema,
} from "@/modules/files";
import { PROJECT_PATHS } from "@/modules/projects";
import { requirePlatformAdmin } from "@/lib/server/auth";
import { createSessionSupabaseClient } from "@/lib/supabase/server";
import { getProjectByPublicId } from "@/lib/server/projects";

export type AdminProjectFormState = {
  error: string | null;
};

async function requireAdminProject(projectPublicId: string) {
  const access = await requirePlatformAdmin(PROJECT_PATHS.adminDetail(projectPublicId));
  if (!access.authorized) {
    redirect(AUTH_PATHS.admin);
  }
  const project = await getProjectByPublicId(projectPublicId);
  const supabase = await createSessionSupabaseClient();
  return { project, supabase, userId: access.userId };
}

function mapError(message: string | undefined): string {
  const lower = (message ?? "").toLowerCase();
  if (lower.includes("not authorized")) {
    return "Admin access is required.";
  }
  if (lower.includes("frozen") || lower.includes("cannot be submitted")) {
    return "That deliverable can no longer be changed.";
  }
  if (lower.includes("invalid deliverable file")) {
    return "Choose files that already belong to this project.";
  }
  return "Unable to complete this admin action.";
}

export async function adminCreateTaskAction(
  _previous: AdminProjectFormState,
  formData: FormData,
): Promise<AdminProjectFormState> {
  const parsed = taskWriteSchema.safeParse({
    projectPublicId: formData.get("projectPublicId"),
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    status: formData.get("status"),
    priority: formData.get("priority"),
    dueAt: formData.get("dueAt") || undefined,
    customerVisible: formData.get("customerVisible") || "false",
  });
  if (!parsed.success) {
    return { error: firstZodError(parsed.error) };
  }
  const loaded = await requireAdminProject(parsed.data.projectPublicId);
  if (!loaded.project || !loaded.supabase) {
    return { error: "Project not found." };
  }
  const { error } = await loaded.supabase.rpc("admin_create_project_task", {
    p_project_id: loaded.project.id,
    p_title: parsed.data.title,
    p_description: parsed.data.description ?? "",
    p_status: parsed.data.status,
    p_priority: parsed.data.priority,
    p_due_at: (parsed.data.dueAt
      ? new Date(parsed.data.dueAt).toISOString()
      : null) as unknown as string,
    p_customer_visible: parsed.data.customerVisible,
  });
  if (error) {
    return { error: mapError(error.message) };
  }
  redirect(`${PROJECT_PATHS.adminDetail(parsed.data.projectPublicId)}#tasks`);
}

export async function adminUpdateTaskAction(
  _previous: AdminProjectFormState,
  formData: FormData,
): Promise<AdminProjectFormState> {
  const parsed = taskWriteSchema.safeParse({
    projectPublicId: formData.get("projectPublicId"),
    taskPublicId: formData.get("taskPublicId"),
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    status: formData.get("status"),
    priority: formData.get("priority"),
    dueAt: formData.get("dueAt") || undefined,
    customerVisible: formData.get("customerVisible") || "false",
  });
  if (!parsed.success) {
    return { error: firstZodError(parsed.error) };
  }
  const loaded = await requireAdminProject(parsed.data.projectPublicId);
  if (!loaded.project || !loaded.supabase) {
    return { error: "Project not found." };
  }
  const { data: task } = await loaded.supabase
    .from("project_tasks")
    .select("id")
    .eq("public_id", parsed.data.taskPublicId ?? "")
    .maybeSingle();
  if (!task) {
    return { error: "Task not found." };
  }
  const { error } = await loaded.supabase.rpc("admin_update_project_task", {
    p_task_id: task.id,
    p_title: parsed.data.title,
    p_description: parsed.data.description ?? "",
    p_status: parsed.data.status,
    p_priority: parsed.data.priority,
    p_due_at: (parsed.data.dueAt
      ? new Date(parsed.data.dueAt).toISOString()
      : null) as unknown as string,
    p_customer_visible: parsed.data.customerVisible,
  });
  if (error) {
    return { error: mapError(error.message) };
  }
  redirect(`${PROJECT_PATHS.adminDetail(parsed.data.projectPublicId)}#tasks`);
}

export async function adminUploadProjectFileAction(
  _previous: AdminProjectFormState,
  formData: FormData,
): Promise<AdminProjectFormState> {
  const projectPublicId = String(formData.get("projectPublicId") || "");
  const loaded = await requireAdminProject(projectPublicId);
  if (!loaded.project || !loaded.supabase) {
    return { error: "Project not found." };
  }
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return { error: "Choose a file to upload." };
  }
  const parsed = fileUploadMetaSchema.safeParse({
    projectPublicId,
    visibility: formData.get("visibility") || "internal",
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

  const { data: registered, error: registerError } = await loaded.supabase.rpc(
    "register_project_file",
    {
      p_project_id: loaded.project.id,
      p_original_filename: file.name,
      p_claimed_mime: file.type || mime,
      p_size_bytes: file.size,
      p_visibility: parsed.data.visibility ?? "internal",
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
    return { error: "The file could not be stored." };
  }
  const { error: confirmError } = await loaded.supabase.rpc("confirm_project_file_upload", {
    p_file_id: registered.id,
  });
  if (confirmError) {
    return { error: mapError(confirmError.message) };
  }
  redirect(`${PROJECT_PATHS.adminDetail(projectPublicId)}#files`);
}

export async function adminCreateDeliverableAction(
  _previous: AdminProjectFormState,
  formData: FormData,
): Promise<AdminProjectFormState> {
  const parsed = deliverableWriteSchema.safeParse({
    projectPublicId: formData.get("projectPublicId"),
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    filePublicIds: formData.getAll("filePublicId").map(String).filter(Boolean),
  });
  if (!parsed.success) {
    return { error: firstZodError(parsed.error) };
  }
  const loaded = await requireAdminProject(parsed.data.projectPublicId);
  if (!loaded.project || !loaded.supabase) {
    return { error: "Project not found." };
  }
  const { data: created, error } = await loaded.supabase.rpc("admin_create_deliverable", {
    p_project_id: loaded.project.id,
    p_title: parsed.data.title,
    p_description: parsed.data.description ?? "",
  });
  if (error || !created) {
    return { error: mapError(error?.message) };
  }
  const fileIds: string[] = [];
  for (const publicId of parsed.data.filePublicIds ?? []) {
    const { data: file } = await loaded.supabase
      .from("project_files")
      .select("id")
      .eq("public_id", publicId)
      .maybeSingle();
    if (file) {
      fileIds.push(file.id);
    }
  }
  if (fileIds.length > 0) {
    const { error: filesError } = await loaded.supabase.rpc("admin_set_deliverable_files", {
      p_deliverable_id: created.id,
      p_file_ids: fileIds,
    });
    if (filesError) {
      return { error: mapError(filesError.message) };
    }
  }
  const { error: submitError } = await loaded.supabase.rpc("admin_submit_deliverable", {
    p_deliverable_id: created.id,
  });
  if (submitError) {
    return { error: mapError(submitError.message) };
  }
  redirect(`${PROJECT_PATHS.adminDetail(parsed.data.projectPublicId)}#deliverables`);
}

export async function adminSendProjectMessageAction(
  _previous: AdminProjectFormState,
  formData: FormData,
): Promise<AdminProjectFormState> {
  const parsed = messageWriteSchema.safeParse({
    projectPublicId: formData.get("projectPublicId"),
    body: formData.get("body"),
  });
  if (!parsed.success) {
    return { error: firstZodError(parsed.error) };
  }
  const loaded = await requireAdminProject(parsed.data.projectPublicId);
  if (!loaded.project || !loaded.supabase) {
    return { error: "Project not found." };
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
    sender_user_id: loaded.userId,
    sender_kind: "staff",
    body: parsed.data.body,
  });
  if (error) {
    return { error: mapError(error.message) };
  }
  redirect(`${PROJECT_PATHS.adminDetail(parsed.data.projectPublicId)}#conversation`);
}

export async function adminSubmitDeliverableAction(formData: FormData) {
  const projectPublicId = String(formData.get("projectPublicId") || "");
  const deliverablePublicId = String(formData.get("deliverablePublicId") || "");
  const loaded = await requireAdminProject(projectPublicId);
  if (!loaded.project || !loaded.supabase) {
    redirect("/admin/projects");
  }
  const { data: deliverable } = await loaded.supabase
    .from("deliverables")
    .select("id")
    .eq("public_id", deliverablePublicId)
    .maybeSingle();
  if (!deliverable) {
    redirect(`${PROJECT_PATHS.adminDetail(projectPublicId)}#deliverables`);
  }
  await loaded.supabase.rpc("admin_submit_deliverable", {
    p_deliverable_id: deliverable.id,
  });
  redirect(`${PROJECT_PATHS.adminDetail(projectPublicId)}#deliverables`);
}
