import { createSessionSupabaseClient } from "@/lib/supabase/server";
import type { ContractDocumentType, ContractStatus } from "@/modules/contracts";

export type ContractDetail = {
  id: string;
  publicId: string;
  projectPublicId: string;
  quotePublicId: string;
  documentType: ContractDocumentType;
  version: number;
  title: string;
  status: ContractStatus;
  acknowledgmentText: string;
  commercialSnapshot: unknown;
  effectiveDate: string | null;
  acceptedAt: string | null;
  createdAt: string;
};

const TYPES: ContractDocumentType[] = ["contract", "statement_of_work"];
const STATUSES: ContractStatus[] = ["draft", "issued", "accepted", "superseded"];

export async function listContractsForProject(
  projectId: string,
): Promise<ContractDetail[]> {
  const supabase = await createSessionSupabaseClient();
  if (!supabase) {
    return [];
  }
  const { data } = await supabase
    .from("contracts")
    .select(
      "id, public_id, project_id, quote_id, document_type, version, title, status, acknowledgment_text, commercial_snapshot, effective_date, accepted_at, created_at",
    )
    .eq("project_id", projectId)
    .order("version", { ascending: false });

  const rows = data ?? [];
  const mapped: ContractDetail[] = [];
  for (const row of rows) {
    const item = await mapContract(row);
    if (item) {
      mapped.push(item);
    }
  }
  return mapped;
}

export async function getContractByPublicId(
  publicId: string,
): Promise<ContractDetail | null> {
  const supabase = await createSessionSupabaseClient();
  if (!supabase) {
    return null;
  }
  const { data } = await supabase
    .from("contracts")
    .select(
      "id, public_id, project_id, quote_id, document_type, version, title, status, acknowledgment_text, commercial_snapshot, effective_date, accepted_at, created_at",
    )
    .eq("public_id", publicId)
    .maybeSingle();

  if (!data) {
    return null;
  }
  return mapContract(data);
}

async function mapContract(row: {
  id: string;
  public_id: string;
  project_id: string;
  quote_id: string;
  document_type: string;
  version: number;
  title: string;
  status: string;
  acknowledgment_text: string;
  commercial_snapshot: unknown;
  effective_date: string | null;
  accepted_at: string | null;
  created_at: string;
}): Promise<ContractDetail | null> {
  if (
    !TYPES.includes(row.document_type as ContractDocumentType) ||
    !STATUSES.includes(row.status as ContractStatus)
  ) {
    return null;
  }
  const supabase = await createSessionSupabaseClient();
  if (!supabase) {
    return null;
  }
  const [{ data: project }, { data: quote }] = await Promise.all([
    supabase
      .from("projects")
      .select("public_id")
      .eq("id", row.project_id)
      .maybeSingle(),
    supabase.from("quotes").select("public_id").eq("id", row.quote_id).maybeSingle(),
  ]);

  return {
    id: row.id,
    publicId: row.public_id,
    projectPublicId: project?.public_id ?? "",
    quotePublicId: quote?.public_id ?? "",
    documentType: row.document_type as ContractDocumentType,
    version: row.version,
    title: row.title,
    status: row.status as ContractStatus,
    acknowledgmentText: row.acknowledgment_text,
    commercialSnapshot: row.commercial_snapshot,
    effectiveDate: row.effective_date,
    acceptedAt: row.accepted_at,
    createdAt: row.created_at,
  };
}
