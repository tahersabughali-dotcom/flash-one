"use server";

import { redirect } from "next/navigation";
import { firstZodError } from "@/modules/auth";
import { AUTH_PATHS } from "@/modules/auth/constants";
import { quoteIssueSchema } from "@/modules/quotes";
import { projectStatusSchema } from "@/modules/projects";
import { workRequestStatusSchema } from "@/modules/work-requests";
import { requirePlatformAdmin } from "@/lib/server/auth";
import { createSessionSupabaseClient } from "@/lib/supabase/server";

export type AdminWorkflowFormState = {
  error: string | null;
};

async function requireAdmin(nextPath: string) {
  const access = await requirePlatformAdmin(nextPath);
  if (!access.authorized) {
    redirect(AUTH_PATHS.admin);
  }
  return access;
}

export async function adminUpdateWorkRequestStatusAction(
  _previous: AdminWorkflowFormState,
  formData: FormData,
): Promise<AdminWorkflowFormState> {
  const publicId = String(formData.get("publicId") || "");
  await requireAdmin(`/admin/requests/${publicId}`);
  const parsed = workRequestStatusSchema.safeParse(formData.get("status"));
  if (!parsed.success) {
    return { error: firstZodError(parsed.error) };
  }

  const supabase = await createSessionSupabaseClient();
  if (!supabase) {
    return { error: "Unable to update status." };
  }

  const { data: request } = await supabase
    .from("work_requests")
    .select("id")
    .eq("public_id", publicId)
    .maybeSingle();

  if (!request) {
    return { error: "Request not found." };
  }

  const { error } = await supabase.rpc("admin_update_work_request_status", {
    p_work_request_id: request.id,
    p_status: parsed.data,
  });

  if (error) {
    return { error: mapAdminError(error.message) };
  }

  redirect(`/admin/requests/${publicId}`);
}

export async function adminIssueQuoteAction(
  _previous: AdminWorkflowFormState,
  formData: FormData,
): Promise<AdminWorkflowFormState> {
  const workRequestPublicId = String(formData.get("workRequestPublicId") || "");
  await requireAdmin(`/admin/requests/${workRequestPublicId}`);

  const descriptions = formData.getAll("lineDescription").map(String);
  const quantities = formData.getAll("lineQuantity").map(String);
  const amounts = formData.getAll("lineAmount").map(String);
  const lines = descriptions.map((description, index) => ({
    description,
    quantity: quantities[index],
    unitAmount: amounts[index],
  }));

  const parsed = quoteIssueSchema.safeParse({
    workRequestPublicId,
    currency: formData.get("currency"),
    validUntil: formData.get("validUntil"),
    customerNotes: formData.get("customerNotes") || undefined,
    lines,
  });

  if (!parsed.success) {
    return { error: firstZodError(parsed.error) };
  }

  const supabase = await createSessionSupabaseClient();
  if (!supabase) {
    return { error: "Unable to issue quote." };
  }

  const { data: request } = await supabase
    .from("work_requests")
    .select("id")
    .eq("public_id", parsed.data.workRequestPublicId)
    .maybeSingle();

  if (!request) {
    return { error: "Request not found." };
  }

  const { error } = await supabase.rpc("admin_issue_quote", {
    p_work_request_id: request.id,
    p_currency: parsed.data.currency,
    p_valid_until: parsed.data.validUntil,
    p_customer_notes: parsed.data.customerNotes ?? "",
    p_lines: parsed.data.lines.map((line) => ({
      description: line.description,
      quantity: line.quantity,
      unit_amount_minor: line.unitAmount,
    })),
  });

  if (error) {
    return { error: mapAdminError(error.message) };
  }

  redirect(`/admin/requests/${workRequestPublicId}`);
}

export async function adminUpdateProjectStatusAction(
  _previous: AdminWorkflowFormState,
  formData: FormData,
): Promise<AdminWorkflowFormState> {
  const publicId = String(formData.get("publicId") || "");
  await requireAdmin(`/admin/projects/${publicId}`);
  const parsed = projectStatusSchema.safeParse(formData.get("status"));
  if (!parsed.success) {
    return { error: firstZodError(parsed.error) };
  }

  const supabase = await createSessionSupabaseClient();
  if (!supabase) {
    return { error: "Unable to update project." };
  }

  const { data: project } = await supabase
    .from("projects")
    .select("id")
    .eq("public_id", publicId)
    .maybeSingle();

  if (!project) {
    return { error: "Project not found." };
  }

  const { error } = await supabase.rpc("admin_update_project_status", {
    p_project_id: project.id,
    p_status: parsed.data,
  });

  if (error) {
    return { error: mapAdminError(error.message) };
  }

  redirect(`/admin/projects/${publicId}`);
}

function mapAdminError(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("not authorized")) {
    return "Admin access is required.";
  }
  if (lower.includes("invalid work request status")) {
    return "That status change is not allowed.";
  }
  if (lower.includes("quote can only be issued")) {
    return "Review or qualify the request before sending a quote.";
  }
  if (lower.includes("valid-until")) {
    return "Valid-until must be today or later.";
  }
  if (lower.includes("line item")) {
    return "Check the quote line items.";
  }
  return "Unable to complete this admin action.";
}
