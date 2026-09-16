"use server";

import { redirect } from "next/navigation";
import { firstZodError } from "@/modules/auth";
import {
  WORK_REQUEST_PATHS,
  workRequestCreateSchema,
} from "@/modules/work-requests";
import { requireCompletedOnboarding } from "@/lib/server/account";
import { getOrganizationIdForMember } from "@/lib/server/work-requests";
import { createSessionSupabaseClient } from "@/lib/supabase/server";

export type RequestFormValues = {
  owner?: string;
  serviceCategory?: string;
  title?: string;
  summary?: string;
  details?: string;
  budgetIndication?: string;
  desiredTimeline?: string;
  catalogServicePublicId?: string;
};

export type WorkflowFormState = {
  error: string | null;
  values?: RequestFormValues;
};

function requestValuesFrom(formData: FormData): RequestFormValues {
  return {
    owner: String(formData.get("owner") ?? ""),
    serviceCategory: String(formData.get("serviceCategory") ?? ""),
    title: String(formData.get("title") ?? ""),
    summary: String(formData.get("summary") ?? ""),
    details: String(formData.get("details") ?? ""),
    budgetIndication: String(formData.get("budgetIndication") ?? ""),
    desiredTimeline: String(formData.get("desiredTimeline") ?? ""),
    catalogServicePublicId: String(formData.get("catalogServicePublicId") ?? ""),
  };
}

export async function createWorkRequestAction(
  _previous: WorkflowFormState,
  formData: FormData,
): Promise<WorkflowFormState> {
  const values = requestValuesFrom(formData);
  const { session } = await requireCompletedOnboarding(WORK_REQUEST_PATHS.new);
  const parsed = workRequestCreateSchema.safeParse({
    owner: formData.get("owner"),
    serviceCategory: formData.get("serviceCategory"),
    title: formData.get("title"),
    summary: formData.get("summary"),
    details: formData.get("details") || undefined,
    budgetIndication: formData.get("budgetIndication") || undefined,
    desiredTimeline: formData.get("desiredTimeline") || undefined,
    catalogServicePublicId: formData.get("catalogServicePublicId") || undefined,
  });

  if (!parsed.success) {
    return { error: firstZodError(parsed.error), values };
  }

  const supabase = await createSessionSupabaseClient();
  if (!supabase) {
    return { error: "Unable to submit the request. Please try again.", values };
  }

  let individualUserId: string | null = null;
  let organizationId: string | null = null;

  if (parsed.data.owner === "individual") {
    const { data: individual } = await supabase
      .from("individual_accounts")
      .select("user_id")
      .eq("user_id", session.userId)
      .maybeSingle();
    if (!individual) {
      return {
        error: "Create an individual relationship before submitting for yourself.",
        values,
      };
    }
    individualUserId = session.userId;
  } else if (parsed.data.owner.startsWith("org:")) {
    const publicId = parsed.data.owner.slice(4);
    const resolved = await getOrganizationIdForMember(session.userId, publicId);
    if (!resolved) {
      return { error: "You can only submit a request for a business you belong to.", values };
    }
    organizationId = resolved;
  } else {
    return { error: "Choose who this request is for.", values };
  }

  let catalogServiceId: string | null = null;
  if (parsed.data.catalogServicePublicId) {
    const { data: service } = await supabase
      .from("commercial_services")
      .select("id")
      .eq("public_id", parsed.data.catalogServicePublicId)
      .maybeSingle();
    if (!service) {
      return { error: "That catalog service is not available.", values };
    }
    catalogServiceId = service.id;
  }

  const { data, error } = await supabase
    .from("work_requests")
    .insert({
      created_by_user_id: session.userId,
      individual_user_id: individualUserId,
      organization_id: organizationId,
      title: parsed.data.title,
      summary: parsed.data.summary,
      details: parsed.data.details ?? null,
      service_category: parsed.data.serviceCategory,
      budget_indication: parsed.data.budgetIndication ?? null,
      desired_timeline: parsed.data.desiredTimeline ?? null,
      catalog_service_id: catalogServiceId,
      status: "submitted",
    })
    .select("public_id")
    .maybeSingle();

  if (error || !data) {
    return { error: "Unable to submit the request. Please try again.", values };
  }

  redirect(WORK_REQUEST_PATHS.detail(data.public_id));
}

export async function acceptQuoteAction(
  _previous: WorkflowFormState,
  formData: FormData,
): Promise<WorkflowFormState> {
  const quotePublicId = String(formData.get("quotePublicId") || "");
  await requireCompletedOnboarding(`/app/quotes/${quotePublicId}`);
  const supabase = await createSessionSupabaseClient();
  if (!supabase) {
    return { error: "Unable to accept this quote. Please try again." };
  }

  const { data: quote } = await supabase
    .from("quotes")
    .select("id")
    .eq("public_id", quotePublicId)
    .maybeSingle();

  if (!quote) {
    return { error: "Quote not found." };
  }

  const { data, error } = await supabase.rpc("accept_quote", {
    p_quote_id: quote.id,
  });

  if (error || !data) {
    return { error: mapWorkflowError(error?.message) };
  }

  const payload = data as {
    project_public_id?: string;
  };
  if (payload.project_public_id) {
    redirect(`/app/projects/${payload.project_public_id}`);
  }
  return { error: "Quote accepted." };
}

export async function rejectQuoteAction(
  _previous: WorkflowFormState,
  formData: FormData,
): Promise<WorkflowFormState> {
  const quotePublicId = String(formData.get("quotePublicId") || "");
  await requireCompletedOnboarding(`/app/quotes/${quotePublicId}`);
  const supabase = await createSessionSupabaseClient();
  if (!supabase) {
    return { error: "Unable to reject this quote. Please try again." };
  }

  const { data: quote } = await supabase
    .from("quotes")
    .select("id")
    .eq("public_id", quotePublicId)
    .maybeSingle();

  if (!quote) {
    return { error: "Quote not found." };
  }

  const { error } = await supabase.rpc("reject_quote", {
    p_quote_id: quote.id,
  });

  if (error) {
    return { error: mapWorkflowError(error.message) };
  }

  redirect(`/app/quotes/${quotePublicId}`);
}

export async function acceptContractAction(
  _previous: WorkflowFormState,
  formData: FormData,
): Promise<WorkflowFormState> {
  const contractPublicId = String(formData.get("contractPublicId") || "");
  await requireCompletedOnboarding(`/app/contracts/${contractPublicId}`);
  const supabase = await createSessionSupabaseClient();
  if (!supabase) {
    return { error: "Unable to accept this record. Please try again." };
  }

  const { data: contract } = await supabase
    .from("contracts")
    .select("id")
    .eq("public_id", contractPublicId)
    .maybeSingle();

  if (!contract) {
    return { error: "Record not found." };
  }

  const { error } = await supabase.rpc("accept_contract", {
    p_contract_id: contract.id,
  });

  if (error) {
    return { error: mapWorkflowError(error.message) };
  }

  redirect(`/app/contracts/${contractPublicId}`);
}

function mapWorkflowError(message: string | undefined): string {
  const lower = (message ?? "").toLowerCase();
  if (lower.includes("expired")) {
    return "This quote has expired.";
  }
  if (lower.includes("cannot be accepted") || lower.includes("cannot be rejected")) {
    return "This quote is no longer available.";
  }
  if (lower.includes("not authorized")) {
    return "You do not have access to this record.";
  }
  return "Unable to complete this action. Please try again.";
}
