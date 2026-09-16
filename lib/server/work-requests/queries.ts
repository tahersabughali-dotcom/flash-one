import { createSessionSupabaseClient } from "@/lib/supabase/server";
import type { ServiceCategory, WorkRequestStatus } from "@/modules/work-requests";
import { listRange } from "@/lib/server/pagination";

export type WorkRequestListItem = {
  publicId: string;
  title: string;
  serviceCategory: ServiceCategory;
  status: WorkRequestStatus;
  createdAt: string;
};

export type WorkRequestDetail = WorkRequestListItem & {
  id: string;
  summary: string;
  details: string | null;
  budgetIndication: string | null;
  desiredTimeline: string | null;
  individualUserId: string | null;
  organizationId: string | null;
  organizationName: string | null;
  catalogServiceName: string | null;
};

function isServiceCategory(value: string): value is ServiceCategory {
  return [
    "software_development",
    "automation_ai",
    "it_consultancy",
    "technology_services",
    "other",
  ].includes(value);
}

function isWorkRequestStatus(value: string): value is WorkRequestStatus {
  return [
    "submitted",
    "under_review",
    "needs_information",
    "qualified",
    "declined",
    "converted",
  ].includes(value);
}

export async function listWorkRequests(page = 1): Promise<WorkRequestListItem[]> {
  const supabase = await createSessionSupabaseClient();
  if (!supabase) {
    return [];
  }

  const { from, to } = listRange(page);
  const { data } = await supabase
    .from("work_requests")
    .select("public_id, title, service_category, status, created_at")
    .order("created_at", { ascending: false })
    .range(from, to);

  return (data ?? []).flatMap((row) => {
    if (!isServiceCategory(row.service_category) || !isWorkRequestStatus(row.status)) {
      return [];
    }
    return [
      {
        publicId: row.public_id,
        title: row.title,
        serviceCategory: row.service_category,
        status: row.status,
        createdAt: row.created_at,
      },
    ];
  });
}

export async function getWorkRequestByPublicId(
  publicId: string,
): Promise<WorkRequestDetail | null> {
  const supabase = await createSessionSupabaseClient();
  if (!supabase) {
    return null;
  }

  const { data } = await supabase
    .from("work_requests")
    .select(
      "id, public_id, title, summary, details, service_category, budget_indication, desired_timeline, status, created_at, individual_user_id, organization_id, catalog_snapshot",
    )
    .eq("public_id", publicId)
    .maybeSingle();

  if (
    !data ||
    !isServiceCategory(data.service_category) ||
    !isWorkRequestStatus(data.status)
  ) {
    return null;
  }

  let organizationName: string | null = null;
  if (data.organization_id) {
    const { data: organization } = await supabase
      .from("organizations")
      .select("name")
      .eq("id", data.organization_id)
      .maybeSingle();
    organizationName = organization?.name ?? null;
  }
  const snapshot =
    data.catalog_snapshot && typeof data.catalog_snapshot === "object"
      ? (data.catalog_snapshot as { name?: string })
      : null;

  return {
    id: data.id,
    publicId: data.public_id,
    title: data.title,
    summary: data.summary,
    details: data.details,
    serviceCategory: data.service_category,
    budgetIndication: data.budget_indication,
    desiredTimeline: data.desired_timeline,
    status: data.status,
    createdAt: data.created_at,
    individualUserId: data.individual_user_id,
    organizationId: data.organization_id,
    organizationName,
    catalogServiceName: snapshot?.name ?? null,
  };
}

export async function getOrganizationIdForMember(
  userId: string,
  organizationPublicId: string,
): Promise<string | null> {
  const supabase = await createSessionSupabaseClient();
  if (!supabase) {
    return null;
  }

  const { data: organization } = await supabase
    .from("organizations")
    .select("id")
    .eq("public_id", organizationPublicId)
    .maybeSingle();

  if (!organization) {
    return null;
  }

  const { data: membership } = await supabase
    .from("organization_memberships")
    .select("id")
    .eq("organization_id", organization.id)
    .eq("user_id", userId)
    .maybeSingle();

  return membership ? organization.id : null;
}
