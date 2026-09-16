"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { firstZodError } from "@/modules/auth";
import { AUTH_PATHS } from "@/modules/auth/constants";
import { requirePlatformAdmin } from "@/lib/server/auth";
import { createSessionSupabaseClient } from "@/lib/supabase/server";
import { canonicalMimeForFilename, FILE_MAX_BYTES } from "@/modules/files";
import { DOCUMENT_BUCKET, OPERATIONS_PATHS } from "@/modules/operations";
import {
  commissionUpsertSchema,
  communicationRecordSchema,
  contactUpsertSchema,
  documentRegisterSchema,
  employeeUpsertSchema,
  expenseUpsertSchema,
  freelancerUpsertSchema,
  internalNoteSchema,
  operationalTaskUpsertSchema,
  partnerUpsertSchema,
  payoutUpsertSchema,
  procurementUpsertSchema,
  referralCreateSchema,
  supplierUpsertSchema,
  supportCaseUpsertSchema,
  taskAssigneeSchema,
  teamAssignSchema,
  teamEndSchema,
} from "@/modules/operations";
import { PROJECT_PATHS } from "@/modules/projects";
import type { AdminFinanceFormState } from "./finance-errors";

export type AdminOpsFormState = AdminFinanceFormState;

async function requireAdmin(path: string) {
  const access = await requirePlatformAdmin(path);
  if (!access.authorized) {
    redirect(AUTH_PATHS.admin);
  }
  const supabase = await createSessionSupabaseClient();
  if (!supabase) {
    redirect(AUTH_PATHS.admin);
  }
  return supabase;
}

function mapOpsError(message: string | undefined): string {
  const lower = (message ?? "").toLowerCase();
  if (lower.includes("not authorized") || lower.includes("platform admin")) {
    return "Admin access is required.";
  }
  if (lower.includes("not found")) {
    return "That record was not found.";
  }
  if (lower.includes("paid_manual") || lower.includes("payment method")) {
    return "Paid payouts need a truthful method description and paid date.";
  }
  if (lower.includes("percentage")) {
    return "Percentage commission needs an explicit basis and integer basis points.";
  }
  if (lower.includes("invalid")) {
    return "Check the required fields and try again.";
  }
  return "Unable to save this operational record.";
}

function text(value: string | undefined) {
  return value ?? "";
}

async function resolveLinkedUserId(
  supabase: Awaited<ReturnType<typeof createSessionSupabaseClient>>,
  linkedPublicId?: string,
) {
  if (!supabase || !linkedPublicId) {
    return { id: null as string | null, error: null as string | null };
  }
  if (linkedPublicId.startsWith("CUS-")) {
    const { data } = await supabase
      .from("individual_accounts")
      .select("user_id")
      .eq("public_id", linkedPublicId)
      .maybeSingle();
    return data ? { id: data.user_id, error: null } : { id: null, error: "Linked customer was not found." };
  }
  const { data } = await supabase
    .from("developer_profiles")
    .select("user_id")
    .eq("public_id", linkedPublicId)
    .maybeSingle();
  return data ? { id: data.user_id, error: null } : { id: null, error: "Linked developer was not found." };
}

export async function adminUpsertEmployeeAction(
  _previous: AdminOpsFormState,
  formData: FormData,
): Promise<AdminOpsFormState> {
  const parsed = employeeUpsertSchema.safeParse({
    publicId: formData.get("publicId") || undefined,
    displayName: formData.get("displayName"),
    email: formData.get("email") || undefined,
    jobTitle: formData.get("jobTitle") || undefined,
    department: formData.get("department") || undefined,
    status: formData.get("status"),
    startDate: formData.get("startDate") || undefined,
    linkedPublicId: formData.get("linkedPublicId") || undefined,
    internalNotes: formData.get("internalNotes") || undefined,
  });
  if (!parsed.success) return { error: firstZodError(parsed.error) };
  const supabase = await requireAdmin(OPERATIONS_PATHS.employees);
  const linked = await resolveLinkedUserId(supabase, parsed.data.linkedPublicId);
  if (linked.error) return { error: linked.error };
  const { data, error } = await supabase.rpc("admin_upsert_employee", {
    p_public_id: text(parsed.data.publicId),
    p_display_name: parsed.data.displayName,
    p_email: text(parsed.data.email),
    p_job_title: text(parsed.data.jobTitle),
    p_department: text(parsed.data.department),
    p_status: parsed.data.status,
    p_start_date: (parsed.data.startDate ?? null) as unknown as string,
    p_user_id: (linked.id ?? null) as unknown as string,
    p_internal_notes: text(parsed.data.internalNotes),
  });
  if (error || !data) return { error: mapOpsError(error?.message) };
  redirect(OPERATIONS_PATHS.employee(data.public_id));
}

export async function adminUpsertFreelancerAction(
  _previous: AdminOpsFormState,
  formData: FormData,
): Promise<AdminOpsFormState> {
  const parsed = freelancerUpsertSchema.safeParse({
    publicId: formData.get("publicId") || undefined,
    displayName: formData.get("displayName"),
    email: formData.get("email") || undefined,
    specialty: formData.get("specialty") || undefined,
    country: formData.get("country") || undefined,
    status: formData.get("status"),
    developerPublicId: formData.get("developerPublicId") || undefined,
    internalNotes: formData.get("internalNotes") || undefined,
  });
  if (!parsed.success) return { error: firstZodError(parsed.error) };
  const supabase = await requireAdmin(OPERATIONS_PATHS.freelancers);
  const { data, error } = await supabase.rpc("admin_upsert_freelancer", {
    p_public_id: text(parsed.data.publicId),
    p_display_name: parsed.data.displayName,
    p_email: text(parsed.data.email),
    p_specialty: text(parsed.data.specialty),
    p_country: text(parsed.data.country),
    p_status: parsed.data.status,
    p_developer_public_id: text(parsed.data.developerPublicId),
    p_internal_notes: text(parsed.data.internalNotes),
  });
  if (error || !data) return { error: mapOpsError(error?.message) };
  redirect(OPERATIONS_PATHS.freelancer(data.public_id));
}

export async function adminUpsertPartnerAction(
  _previous: AdminOpsFormState,
  formData: FormData,
): Promise<AdminOpsFormState> {
  const parsed = partnerUpsertSchema.safeParse({
    publicId: formData.get("publicId") || undefined,
    name: formData.get("name"),
    relationshipType: formData.get("relationshipType"),
    capabilities: formData.get("capabilities") || undefined,
    website: formData.get("website") || undefined,
    country: formData.get("country") || undefined,
    status: formData.get("status"),
    internalNotes: formData.get("internalNotes") || undefined,
  });
  if (!parsed.success) return { error: firstZodError(parsed.error) };
  const supabase = await requireAdmin(OPERATIONS_PATHS.partners);
  const { data, error } = await supabase.rpc("admin_upsert_partner", {
    p_public_id: text(parsed.data.publicId),
    p_name: parsed.data.name,
    p_relationship_type: parsed.data.relationshipType,
    p_capabilities: text(parsed.data.capabilities),
    p_website: text(parsed.data.website),
    p_country: text(parsed.data.country),
    p_status: parsed.data.status,
    p_internal_notes: text(parsed.data.internalNotes),
  });
  if (error || !data) return { error: mapOpsError(error?.message) };
  redirect(OPERATIONS_PATHS.partner(data.public_id));
}

export async function adminUpsertSupplierAction(
  _previous: AdminOpsFormState,
  formData: FormData,
): Promise<AdminOpsFormState> {
  const parsed = supplierUpsertSchema.safeParse({
    publicId: formData.get("publicId") || undefined,
    name: formData.get("name"),
    supplierType: formData.get("supplierType"),
    status: formData.get("status"),
    internalNotes: formData.get("internalNotes") || undefined,
  });
  if (!parsed.success) return { error: firstZodError(parsed.error) };
  const supabase = await requireAdmin(OPERATIONS_PATHS.suppliers);
  const { data, error } = await supabase.rpc("admin_upsert_supplier", {
    p_public_id: text(parsed.data.publicId),
    p_name: parsed.data.name,
    p_supplier_type: parsed.data.supplierType,
    p_status: parsed.data.status,
    p_internal_notes: text(parsed.data.internalNotes),
  });
  if (error || !data) return { error: mapOpsError(error?.message) };
  redirect(OPERATIONS_PATHS.supplier(data.public_id));
}

export async function adminUpsertContactAction(
  _previous: AdminOpsFormState,
  formData: FormData,
): Promise<AdminOpsFormState> {
  const parsed = contactUpsertSchema.safeParse({
    publicId: formData.get("publicId") || undefined,
    displayName: formData.get("displayName"),
    jobTitle: formData.get("jobTitle") || undefined,
    email: formData.get("email") || undefined,
    phone: formData.get("phone") || undefined,
    ownerKind: formData.get("ownerKind"),
    ownerPublicId: formData.get("ownerPublicId") || undefined,
    status: formData.get("status"),
    internalNotes: formData.get("internalNotes") || undefined,
  });
  if (!parsed.success) return { error: firstZodError(parsed.error) };
  const supabase = await requireAdmin(OPERATIONS_PATHS.contacts);
  const { data, error } = await supabase.rpc("admin_upsert_contact", {
    p_public_id: text(parsed.data.publicId),
    p_display_name: parsed.data.displayName,
    p_job_title: text(parsed.data.jobTitle),
    p_email: text(parsed.data.email),
    p_phone: text(parsed.data.phone),
    p_owner_kind: parsed.data.ownerKind,
    p_owner_public_id: text(parsed.data.ownerPublicId),
    p_status: parsed.data.status,
    p_internal_notes: text(parsed.data.internalNotes),
  });
  if (error || !data) return { error: mapOpsError(error?.message) };
  redirect(OPERATIONS_PATHS.contact(data.public_id));
}

export async function adminUpsertProcurementAction(
  _previous: AdminOpsFormState,
  formData: FormData,
): Promise<AdminOpsFormState> {
  const parsed = procurementUpsertSchema.safeParse({
    publicId: formData.get("publicId") || undefined,
    supplierPublicId: formData.get("supplierPublicId"),
    description: formData.get("description"),
    currency: formData.get("currency"),
    amount: formData.get("amount"),
    status: formData.get("status"),
    purchaseDate: formData.get("purchaseDate") || undefined,
    dueDate: formData.get("dueDate") || undefined,
    projectPublicId: formData.get("projectPublicId") || undefined,
    internalNotes: formData.get("internalNotes") || undefined,
  });
  if (!parsed.success) return { error: firstZodError(parsed.error) };
  const supabase = await requireAdmin(OPERATIONS_PATHS.procurement);
  const { data, error } = await supabase.rpc("admin_upsert_procurement", {
    p_public_id: text(parsed.data.publicId),
    p_supplier_public_id: parsed.data.supplierPublicId,
    p_description: parsed.data.description,
    p_currency: parsed.data.currency,
    p_amount_minor: parsed.data.amountMinor,
    p_status: parsed.data.status,
    p_purchase_date: (parsed.data.purchaseDate ?? null) as unknown as string,
    p_due_date: (parsed.data.dueDate ?? null) as unknown as string,
    p_project_public_id: text(parsed.data.projectPublicId),
    p_internal_notes: text(parsed.data.internalNotes),
  });
  if (error || !data) return { error: mapOpsError(error?.message) };
  redirect(OPERATIONS_PATHS.purchase(data.public_id));
}

export async function adminUpsertExpenseAction(
  _previous: AdminOpsFormState,
  formData: FormData,
): Promise<AdminOpsFormState> {
  const parsed = expenseUpsertSchema.safeParse({
    publicId: formData.get("publicId") || undefined,
    category: formData.get("category"),
    description: formData.get("description"),
    currency: formData.get("currency"),
    amount: formData.get("amount"),
    expenseDate: formData.get("expenseDate"),
    status: formData.get("status"),
    supplierPublicId: formData.get("supplierPublicId") || undefined,
    employeePublicId: formData.get("employeePublicId") || undefined,
    freelancerPublicId: formData.get("freelancerPublicId") || undefined,
    partnerPublicId: formData.get("partnerPublicId") || undefined,
    projectPublicId: formData.get("projectPublicId") || undefined,
    documentPublicId: formData.get("documentPublicId") || undefined,
    internalNotes: formData.get("internalNotes") || undefined,
  });
  if (!parsed.success) return { error: firstZodError(parsed.error) };
  const supabase = await requireAdmin(OPERATIONS_PATHS.expenses);
  const { data, error } = await supabase.rpc("admin_upsert_expense", {
    p_public_id: text(parsed.data.publicId),
    p_category: parsed.data.category,
    p_description: parsed.data.description,
    p_currency: parsed.data.currency,
    p_amount_minor: parsed.data.amountMinor,
    p_expense_date: parsed.data.expenseDate,
    p_status: parsed.data.status,
    p_supplier_public_id: text(parsed.data.supplierPublicId),
    p_employee_public_id: text(parsed.data.employeePublicId),
    p_freelancer_public_id: text(parsed.data.freelancerPublicId),
    p_partner_public_id: text(parsed.data.partnerPublicId),
    p_project_public_id: text(parsed.data.projectPublicId),
    p_document_public_id: text(parsed.data.documentPublicId),
    p_internal_notes: text(parsed.data.internalNotes),
  });
  if (error || !data) return { error: mapOpsError(error?.message) };
  redirect(OPERATIONS_PATHS.expense(data.public_id));
}

export async function adminUpsertPayoutAction(
  _previous: AdminOpsFormState,
  formData: FormData,
): Promise<AdminOpsFormState> {
  const parsed = payoutUpsertSchema.safeParse({
    publicId: formData.get("publicId") || undefined,
    beneficiaryKind: formData.get("beneficiaryKind"),
    beneficiaryPublicId: formData.get("beneficiaryPublicId"),
    amount: formData.get("amount"),
    currency: formData.get("currency"),
    reason: formData.get("reason"),
    status: formData.get("status"),
    dueDate: formData.get("dueDate") || undefined,
    paidAt: formData.get("paidAt") || undefined,
    paymentMethodDescription: formData.get("paymentMethodDescription") || undefined,
    referenceText: formData.get("referenceText") || undefined,
    projectPublicId: formData.get("projectPublicId") || undefined,
    expensePublicId: formData.get("expensePublicId") || undefined,
    internalNotes: formData.get("internalNotes") || undefined,
  });
  if (!parsed.success) return { error: firstZodError(parsed.error) };
  const supabase = await requireAdmin(OPERATIONS_PATHS.payouts);
  const paidAt = parsed.data.paidAt ? new Date(parsed.data.paidAt).toISOString() : null;
  const { data, error } = await supabase.rpc("admin_upsert_payout", {
    p_public_id: text(parsed.data.publicId),
    p_beneficiary_kind: parsed.data.beneficiaryKind,
    p_beneficiary_public_id: parsed.data.beneficiaryPublicId,
    p_amount_minor: parsed.data.amountMinor,
    p_currency: parsed.data.currency,
    p_reason: parsed.data.reason,
    p_status: parsed.data.status,
    p_due_date: (parsed.data.dueDate ?? null) as unknown as string,
    p_paid_at: (paidAt ?? null) as unknown as string,
    p_payment_method_description: text(parsed.data.paymentMethodDescription),
    p_reference_text: text(parsed.data.referenceText),
    p_project_public_id: text(parsed.data.projectPublicId),
    p_expense_public_id: text(parsed.data.expensePublicId),
    p_internal_notes: text(parsed.data.internalNotes),
  });
  if (error || !data) return { error: mapOpsError(error?.message) };
  redirect(OPERATIONS_PATHS.payout(data.public_id));
}

export async function adminCreateReferralAction(
  _previous: AdminOpsFormState,
  formData: FormData,
): Promise<AdminOpsFormState> {
  const parsed = referralCreateSchema.safeParse({
    sourceKind: formData.get("sourceKind"),
    sourcePublicId: formData.get("sourcePublicId") || undefined,
    sourceLabel: formData.get("sourceLabel") || undefined,
    customerPublicId: formData.get("customerPublicId") || undefined,
    organizationPublicId: formData.get("organizationPublicId") || undefined,
    projectPublicId: formData.get("projectPublicId") || undefined,
    internalNotes: formData.get("internalNotes") || undefined,
  });
  if (!parsed.success) return { error: firstZodError(parsed.error) };
  const supabase = await requireAdmin(OPERATIONS_PATHS.referrals);
  const { data, error } = await supabase.rpc("admin_create_referral", {
    p_source_kind: parsed.data.sourceKind,
    p_source_public_id: text(parsed.data.sourcePublicId),
    p_source_label: text(parsed.data.sourceLabel),
    p_customer_public_id: text(parsed.data.customerPublicId),
    p_organization_public_id: text(parsed.data.organizationPublicId),
    p_project_public_id: text(parsed.data.projectPublicId),
    p_internal_notes: text(parsed.data.internalNotes),
  });
  if (error || !data) return { error: mapOpsError(error?.message) };
  redirect(OPERATIONS_PATHS.referral(data.public_id));
}

export async function adminUpsertCommissionAction(
  _previous: AdminOpsFormState,
  formData: FormData,
): Promise<AdminOpsFormState> {
  const parsed = commissionUpsertSchema.safeParse({
    publicId: formData.get("publicId") || undefined,
    referralPublicId: formData.get("referralPublicId") || undefined,
    beneficiaryKind: formData.get("beneficiaryKind"),
    beneficiaryPublicId: formData.get("beneficiaryPublicId"),
    calculationType: formData.get("calculationType"),
    basisAmount: formData.get("basisAmount") || undefined,
    rateBps: formData.get("rateBps") || undefined,
    amount: formData.get("amount") || undefined,
    currency: formData.get("currency"),
    status: formData.get("status"),
    reason: formData.get("reason"),
    projectPublicId: formData.get("projectPublicId") || undefined,
    invoicePublicId: formData.get("invoicePublicId") || undefined,
    createPayout: formData.get("createPayout") === "on",
  });
  if (!parsed.success) return { error: firstZodError(parsed.error) };
  const supabase = await requireAdmin(OPERATIONS_PATHS.commissions);
  const { data, error } = await supabase.rpc("admin_upsert_commission", {
    p_public_id: text(parsed.data.publicId),
    p_referral_public_id: text(parsed.data.referralPublicId),
    p_beneficiary_kind: parsed.data.beneficiaryKind,
    p_beneficiary_public_id: parsed.data.beneficiaryPublicId,
    p_calculation_type: parsed.data.calculationType,
    p_basis_amount_minor: (parsed.data.basisAmountMinor ?? null) as unknown as number,
    p_rate_bps: (parsed.data.rateBps ?? null) as unknown as number,
    p_amount_minor: parsed.data.amountMinor,
    p_currency: parsed.data.currency,
    p_status: parsed.data.status,
    p_reason: parsed.data.reason,
    p_project_public_id: text(parsed.data.projectPublicId),
    p_invoice_public_id: text(parsed.data.invoicePublicId),
    p_create_payout: parsed.data.createPayout,
  });
  if (error || !data) return { error: mapOpsError(error?.message) };
  redirect(OPERATIONS_PATHS.commission(data.public_id));
}

export async function adminAssignTeamAction(
  _previous: AdminOpsFormState,
  formData: FormData,
): Promise<AdminOpsFormState> {
  const parsed = teamAssignSchema.safeParse({
    projectPublicId: formData.get("projectPublicId"),
    memberKind: formData.get("memberKind"),
    memberPublicId: formData.get("memberPublicId"),
    roleLabel: formData.get("roleLabel"),
  });
  if (!parsed.success) return { error: firstZodError(parsed.error) };
  const supabase = await requireAdmin(PROJECT_PATHS.adminDetail(parsed.data.projectPublicId));
  const { error } = await supabase.rpc("admin_assign_project_team", {
    p_project_public_id: parsed.data.projectPublicId,
    p_member_kind: parsed.data.memberKind,
    p_member_public_id: parsed.data.memberPublicId,
    p_role_label: parsed.data.roleLabel,
  });
  if (error) return { error: mapOpsError(error.message) };
  redirect(`${PROJECT_PATHS.adminDetail(parsed.data.projectPublicId)}#team`);
}

export async function adminEndTeamAction(formData: FormData) {
  const parsed = teamEndSchema.safeParse({
    publicId: formData.get("publicId"),
    projectPublicId: formData.get("projectPublicId"),
  });
  if (!parsed.success) {
    redirect("/admin/projects");
  }
  const supabase = await requireAdmin(PROJECT_PATHS.adminDetail(parsed.data.projectPublicId));
  await supabase.rpc("admin_end_project_team", { p_public_id: parsed.data.publicId });
  redirect(`${PROJECT_PATHS.adminDetail(parsed.data.projectPublicId)}#team`);
}

export async function adminSetTaskAssigneeAction(
  _previous: AdminOpsFormState,
  formData: FormData,
): Promise<AdminOpsFormState> {
  const parsed = taskAssigneeSchema.safeParse({
    taskPublicId: formData.get("taskPublicId"),
    projectPublicId: formData.get("projectPublicId"),
    assigneeKind: formData.get("assigneeKind") || "",
    assigneePublicId: formData.get("assigneePublicId") || undefined,
  });
  if (!parsed.success) return { error: firstZodError(parsed.error) };
  const supabase = await requireAdmin(PROJECT_PATHS.adminDetail(parsed.data.projectPublicId));
  const { error } = await supabase.rpc("admin_set_project_task_assignee", {
    p_task_public_id: parsed.data.taskPublicId,
    p_assignee_kind: parsed.data.assigneeKind ?? "",
    p_assignee_public_id: text(parsed.data.assigneePublicId),
  });
  if (error) return { error: mapOpsError(error.message) };
  redirect(`${PROJECT_PATHS.adminDetail(parsed.data.projectPublicId)}#tasks`);
}

export async function adminUpsertOperationalTaskAction(
  _previous: AdminOpsFormState,
  formData: FormData,
): Promise<AdminOpsFormState> {
  const parsed = operationalTaskUpsertSchema.safeParse({
    publicId: formData.get("publicId") || undefined,
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    status: formData.get("status"),
    priority: formData.get("priority"),
    dueAt: formData.get("dueAt") || undefined,
    projectPublicId: formData.get("projectPublicId") || undefined,
    customerPublicId: formData.get("customerPublicId") || undefined,
    invoicePublicId: formData.get("invoicePublicId") || undefined,
    casePublicId: formData.get("casePublicId") || undefined,
    assigneeEmployeePublicId: formData.get("assigneeEmployeePublicId") || undefined,
  });
  if (!parsed.success) return { error: firstZodError(parsed.error) };
  const supabase = await requireAdmin(OPERATIONS_PATHS.tasks);
  const dueAt = parsed.data.dueAt ? new Date(parsed.data.dueAt).toISOString() : null;
  const { data, error } = await supabase.rpc("admin_upsert_operational_task", {
    p_public_id: text(parsed.data.publicId),
    p_title: parsed.data.title,
    p_description: text(parsed.data.description),
    p_status: parsed.data.status,
    p_priority: parsed.data.priority,
    p_due_at: (dueAt ?? null) as unknown as string,
    p_project_public_id: text(parsed.data.projectPublicId),
    p_customer_public_id: text(parsed.data.customerPublicId),
    p_invoice_public_id: text(parsed.data.invoicePublicId),
    p_case_public_id: text(parsed.data.casePublicId),
    p_assignee_employee_public_id: text(parsed.data.assigneeEmployeePublicId),
  });
  if (error || !data) return { error: mapOpsError(error?.message) };
  redirect(OPERATIONS_PATHS.task(data.public_id));
}

export async function adminUpsertSupportCaseAction(
  _previous: AdminOpsFormState,
  formData: FormData,
): Promise<AdminOpsFormState> {
  const parsed = supportCaseUpsertSchema.safeParse({
    publicId: formData.get("publicId") || undefined,
    title: formData.get("title"),
    caseType: formData.get("caseType"),
    priority: formData.get("priority"),
    status: formData.get("status"),
    description: formData.get("description") || undefined,
    customerPublicId: formData.get("customerPublicId") || undefined,
    organizationPublicId: formData.get("organizationPublicId") || undefined,
    projectPublicId: formData.get("projectPublicId") || undefined,
    orderPublicId: formData.get("orderPublicId") || undefined,
    invoicePublicId: formData.get("invoicePublicId") || undefined,
    assignedEmployeePublicId: formData.get("assignedEmployeePublicId") || undefined,
    customerVisible: formData.get("customerVisible") === "on",
  });
  if (!parsed.success) return { error: firstZodError(parsed.error) };
  const supabase = await requireAdmin(OPERATIONS_PATHS.cases);
  const { data, error } = await supabase.rpc("admin_upsert_support_case", {
    p_public_id: text(parsed.data.publicId),
    p_title: parsed.data.title,
    p_case_type: parsed.data.caseType,
    p_priority: parsed.data.priority,
    p_status: parsed.data.status,
    p_description: text(parsed.data.description),
    p_customer_public_id: text(parsed.data.customerPublicId),
    p_organization_public_id: text(parsed.data.organizationPublicId),
    p_project_public_id: text(parsed.data.projectPublicId),
    p_order_public_id: text(parsed.data.orderPublicId),
    p_invoice_public_id: text(parsed.data.invoicePublicId),
    p_assigned_employee_public_id: text(parsed.data.assignedEmployeePublicId),
    p_customer_visible: parsed.data.customerVisible,
  });
  if (error || !data) return { error: mapOpsError(error?.message) };
  redirect(OPERATIONS_PATHS.caseDetail(data.public_id));
}

export async function adminRecordCommunicationAction(
  _previous: AdminOpsFormState,
  formData: FormData,
): Promise<AdminOpsFormState> {
  const parsed = communicationRecordSchema.safeParse({
    channel: formData.get("channel"),
    title: formData.get("title"),
    body: formData.get("body") || undefined,
    occurredAt: formData.get("occurredAt"),
    entityKind: formData.get("entityKind") || undefined,
    entityPublicId: formData.get("entityPublicId") || undefined,
    customerPublicId: formData.get("customerPublicId") || undefined,
    organizationPublicId: formData.get("organizationPublicId") || undefined,
    projectPublicId: formData.get("projectPublicId") || undefined,
  });
  if (!parsed.success) return { error: firstZodError(parsed.error) };
  const supabase = await requireAdmin(OPERATIONS_PATHS.communications);
  const { data, error } = await supabase.rpc("admin_record_communication", {
    p_channel: parsed.data.channel,
    p_source_kind: parsed.data.channel === "platform_conversation" ? "platform" : "manual_record",
    p_title: parsed.data.title,
    p_body: text(parsed.data.body),
    p_occurred_at: new Date(parsed.data.occurredAt).toISOString(),
    p_entity_kind: text(parsed.data.entityKind),
    p_entity_public_id: text(parsed.data.entityPublicId),
    p_customer_public_id: text(parsed.data.customerPublicId),
    p_organization_public_id: text(parsed.data.organizationPublicId),
    p_project_public_id: text(parsed.data.projectPublicId),
  });
  if (error || !data) return { error: mapOpsError(error?.message) };
  redirect(OPERATIONS_PATHS.communication(data.public_id));
}

export async function adminAddInternalNoteAction(
  _previous: AdminOpsFormState,
  formData: FormData,
): Promise<AdminOpsFormState> {
  const parsed = internalNoteSchema.safeParse({
    entityKind: formData.get("entityKind"),
    entityPublicId: formData.get("entityPublicId"),
    content: formData.get("content"),
  });
  if (!parsed.success) return { error: firstZodError(parsed.error) };
  const supabase = await requireAdmin("/admin");
  const { error } = await supabase.rpc("admin_add_internal_note", {
    p_entity_kind: parsed.data.entityKind,
    p_entity_public_id: parsed.data.entityPublicId,
    p_content: parsed.data.content,
  });
  if (error) return { error: mapOpsError(error.message) };
  revalidatePath("/admin");
  return { error: null };
}

export async function adminUploadDocumentAction(
  _previous: AdminOpsFormState,
  formData: FormData,
): Promise<AdminOpsFormState> {
  const parsed = documentRegisterSchema.safeParse({
    title: formData.get("title"),
    documentType: formData.get("documentType"),
    entityKind: formData.get("entityKind") || "other",
    entityPublicId: formData.get("entityPublicId") || undefined,
    internalNotes: formData.get("internalNotes") || undefined,
  });
  if (!parsed.success) return { error: firstZodError(parsed.error) };
  const file = formData.get("file");
  if (!(file instanceof File)) return { error: "Choose a file to upload." };
  if (file.size > FILE_MAX_BYTES) return { error: "That file is too large. The limit is 20 MB." };
  const mime = canonicalMimeForFilename(file.name);
  if (!mime) return { error: "That file type is not accepted." };
  const supabase = await requireAdmin(OPERATIONS_PATHS.documents);
  const { data: registered, error } = await supabase.rpc("register_operational_document", {
    p_title: parsed.data.title,
    p_document_type: parsed.data.documentType,
    p_entity_kind: parsed.data.entityKind,
    p_entity_public_id: text(parsed.data.entityPublicId),
    p_original_filename: file.name,
    p_claimed_mime: file.type || mime,
    p_size_bytes: file.size,
    p_internal_notes: text(parsed.data.internalNotes),
  });
  if (error || !registered) return { error: mapOpsError(error?.message) };
  const bytes = Buffer.from(await file.arrayBuffer());
  const { error: uploadError } = await supabase.storage.from(DOCUMENT_BUCKET).upload(registered.storage_path, bytes, {
    contentType: registered.mime_type,
    upsert: false,
  });
  if (uploadError) return { error: "The file could not be stored." };
  redirect(OPERATIONS_PATHS.document(registered.public_id));
}

export async function adminDownloadDocumentAction(formData: FormData) {
  const publicId = String(formData.get("publicId") || "");
  const supabase = await requireAdmin(OPERATIONS_PATHS.documents);
  const { data } = await supabase
    .from("operational_documents")
    .select("storage_path, original_filename")
    .eq("public_id", publicId)
    .maybeSingle();
  if (!data) redirect(OPERATIONS_PATHS.documents);
  const { data: signed } = await supabase.storage
    .from(DOCUMENT_BUCKET)
    .createSignedUrl(data.storage_path, 60, { download: data.original_filename });
  if (!signed?.signedUrl) redirect(OPERATIONS_PATHS.document(publicId));
  redirect(signed.signedUrl);
}
