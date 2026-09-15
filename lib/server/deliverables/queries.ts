import { createSessionSupabaseClient } from "@/lib/supabase/server";
import type { DeliverableStatus } from "@/modules/deliverables";
import { parseMinor } from "@/modules/invoices/money";

export type DeliverableFileSnapshot = {
  publicId: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
};

export type ProjectDeliverable = {
  id: string;
  publicId: string;
  title: string;
  description: string | null;
  status: DeliverableStatus;
  version: number;
  fileSnapshot: DeliverableFileSnapshot[];
  changeRequestNote: string | null;
  submittedAt: string | null;
  acceptedAt: string | null;
  createdAt: string;
};

const STATUSES: DeliverableStatus[] = [
  "draft",
  "submitted",
  "accepted",
  "changes_requested",
  "superseded",
];

function parseSnapshot(value: unknown): DeliverableFileSnapshot[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.flatMap((item) => {
    if (
      !item ||
      typeof item !== "object" ||
      typeof (item as { public_id?: unknown }).public_id !== "string" ||
      typeof (item as { filename?: unknown }).filename !== "string"
    ) {
      return [];
    }
    const row = item as {
      public_id: string;
      filename: string;
      mime_type?: string;
      size_bytes?: number;
    };
    return [
      {
        publicId: row.public_id,
        filename: row.filename,
        mimeType: row.mime_type ?? "",
        sizeBytes: parseMinor(row.size_bytes) ?? 0,
      },
    ];
  });
}

export async function listProjectDeliverables(
  projectId: string,
): Promise<ProjectDeliverable[]> {
  const supabase = await createSessionSupabaseClient();
  if (!supabase) {
    return [];
  }
  const { data } = await supabase
    .from("deliverables")
    .select(
      "id, public_id, title, description, status, version, file_snapshot, change_request_note, submitted_at, accepted_at, created_at",
    )
    .eq("project_id", projectId)
    .order("version", { ascending: false });

  return (data ?? []).flatMap((row) => {
    if (!STATUSES.includes(row.status as DeliverableStatus)) {
      return [];
    }
    return [
      {
        id: row.id,
        publicId: row.public_id,
        title: row.title,
        description: row.description,
        status: row.status as DeliverableStatus,
        version: row.version,
        fileSnapshot: parseSnapshot(row.file_snapshot),
        changeRequestNote: row.change_request_note,
        submittedAt: row.submitted_at,
        acceptedAt: row.accepted_at,
        createdAt: row.created_at,
      },
    ];
  });
}
