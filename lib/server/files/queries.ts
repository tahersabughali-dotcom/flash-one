import { createSessionSupabaseClient } from "@/lib/supabase/server";
import type { FileVisibility } from "@/modules/files";
import { parseMinor } from "@/modules/invoices/money";

export type ProjectFile = {
  id: string;
  publicId: string;
  originalFilename: string;
  mimeType: string;
  sizeBytes: number;
  visibility: FileVisibility;
  createdAt: string;
  malwareScanStatus: string;
};

type FileRow = {
  id: string;
  public_id: string;
  original_filename: string;
  mime_type: string;
  size_bytes: number | string;
  visibility: string;
  created_at: string;
  malware_scan_status?: string | null;
};

function mapFile(row: FileRow): ProjectFile | null {
  if (
    row.visibility !== "customer" &&
    row.visibility !== "internal" &&
    row.visibility !== "project_team"
  ) {
    return null;
  }
  return {
    id: row.id,
    publicId: row.public_id,
    originalFilename: row.original_filename,
    mimeType: row.mime_type,
    sizeBytes: parseMinor(row.size_bytes) ?? 0,
    visibility: row.visibility,
    createdAt: row.created_at,
    malwareScanStatus: row.malware_scan_status?.trim() || "unavailable",
  };
}

export async function listProjectFiles(projectId: string): Promise<ProjectFile[]> {
  const supabase = await createSessionSupabaseClient();
  if (!supabase) {
    return [];
  }

  const withScan = await supabase
    .from("project_files")
    .select(
      "id, public_id, original_filename, mime_type, size_bytes, visibility, created_at, malware_scan_status",
    )
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  const data = withScan.error
    ? (
        await supabase
          .from("project_files")
          .select(
            "id, public_id, original_filename, mime_type, size_bytes, visibility, created_at",
          )
          .eq("project_id", projectId)
          .order("created_at", { ascending: false })
      ).data
    : withScan.data;

  return (data ?? []).flatMap((row) => {
    const mapped = mapFile(row as FileRow);
    return mapped ? [mapped] : [];
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
