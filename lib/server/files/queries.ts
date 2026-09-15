import { createSessionSupabaseClient } from "@/lib/supabase/server";
import type { FileVisibility } from "@/modules/files";

export type ProjectFile = {
  id: string;
  publicId: string;
  originalFilename: string;
  mimeType: string;
  sizeBytes: number;
  visibility: FileVisibility;
  createdAt: string;
};

export async function listProjectFiles(projectId: string): Promise<ProjectFile[]> {
  const supabase = await createSessionSupabaseClient();
  if (!supabase) {
    return [];
  }
  const { data } = await supabase
    .from("project_files")
    .select(
      "id, public_id, original_filename, mime_type, size_bytes, visibility, created_at",
    )
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  return (data ?? []).flatMap((row) => {
    if (row.visibility !== "customer" && row.visibility !== "internal") {
      return [];
    }
    return [
      {
        id: row.id,
        publicId: row.public_id,
        originalFilename: row.original_filename,
        mimeType: row.mime_type,
        sizeBytes: Number(row.size_bytes),
        visibility: row.visibility,
        createdAt: row.created_at,
      },
    ];
  });
}

export async function getProjectFileByPublicId(publicId: string): Promise<{
  id: string;
  publicId: string;
  originalFilename: string;
  storageBucket: string;
  storagePath: string;
} | null> {
  const supabase = await createSessionSupabaseClient();
  if (!supabase) {
    return null;
  }
  const { data } = await supabase
    .from("project_files")
    .select("id, public_id, original_filename, storage_bucket, storage_path")
    .eq("public_id", publicId)
    .maybeSingle();
  if (!data) {
    return null;
  }
  return {
    id: data.id,
    publicId: data.public_id,
    originalFilename: data.original_filename,
    storageBucket: data.storage_bucket,
    storagePath: data.storage_path,
  };
}
