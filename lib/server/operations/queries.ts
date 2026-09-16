import { createSessionSupabaseClient } from "@/lib/supabase/server";
import { asMinor } from "@/modules/invoices/money";
import { listRange } from "@/lib/server/pagination";
import type { InvoiceCurrency } from "@/modules/invoices";
import {
  CASE_STATUSES,
  CASE_TYPES,
  COMMUNICATION_CHANNELS,
  COMMUNICATION_SOURCES,
  DOCUMENT_TYPES,
  EXPENSE_CATEGORIES,
  EXPENSE_STATUSES,
  NETWORK_STATUSES,
  NOTE_ENTITY_KINDS,
  PAYOUT_STATUSES,
  PERSON_STATUSES,
  PROCUREMENT_STATUSES,
  type CaseStatus,
  type CaseType,
  type CommunicationChannel,
  type CommunicationSource,
  type DocumentType,
  type ExpenseCategory,
  type ExpenseStatus,
  type NetworkStatus,
  type NoteEntityKind,
  type PayoutStatus,
  type PersonStatus,
  type ProcurementStatus,
} from "@/modules/operations";
import type { TaskPriority, TaskStatus } from "@/modules/tasks";

export type NamedRecord = {
  publicId: string;
  title: string;
  status: string;
  meta?: string;
};

async function client() {
  return createSessionSupabaseClient();
}

export async function listEmployees(page = 1): Promise<NamedRecord[]> {
  const supabase = await client();
  if (!supabase) return [];
  const { from, to } = listRange(page);
  const { data } = await supabase
    .from("employees")
    .select("public_id, display_name, status, job_title")
    .order("created_at", { ascending: false })
    .range(from, to);
  return (data ?? []).map((row) => ({
    publicId: row.public_id,
    title: row.display_name,
    status: row.status,
    meta: row.job_title ?? undefined,
  }));
}

export async function getEmployee(publicId: string) {
  const supabase = await client();
  if (!supabase) return null;
  const { data } = await supabase.from("employees").select("*").eq("public_id", publicId).maybeSingle();
  return data;
}

export async function listFreelancers(page = 1): Promise<NamedRecord[]> {
  const supabase = await client();
  if (!supabase) return [];
  const { from, to } = listRange(page);
  const { data } = await supabase
    .from("freelancers")
    .select("public_id, display_name, status, specialty")
    .order("created_at", { ascending: false })
    .range(from, to);
  return (data ?? []).map((row) => ({
    publicId: row.public_id,
    title: row.display_name,
    status: row.status,
    meta: row.specialty ?? undefined,
  }));
}

export async function getFreelancer(publicId: string) {
  const supabase = await client();
  if (!supabase) return null;
  const { data } = await supabase.from("freelancers").select("*").eq("public_id", publicId).maybeSingle();
  return data;
}

export async function listPartners(page = 1): Promise<NamedRecord[]> {
  const supabase = await client();
  if (!supabase) return [];
  const { from, to } = listRange(page);
  const { data } = await supabase
    .from("partner_companies")
    .select("public_id, name, status, relationship_type")
    .order("created_at", { ascending: false })
    .range(from, to);
  return (data ?? []).map((row) => ({
    publicId: row.public_id,
    title: row.name,
    status: row.status,
    meta: row.relationship_type,
  }));
}

export async function getPartner(publicId: string) {
  const supabase = await client();
  if (!supabase) return null;
  const { data } = await supabase.from("partner_companies").select("*").eq("public_id", publicId).maybeSingle();
  return data;
}

export async function listSuppliers(page = 1): Promise<NamedRecord[]> {
  const supabase = await client();
  if (!supabase) return [];
  const { from, to } = listRange(page);
  const { data } = await supabase
    .from("suppliers")
    .select("public_id, name, status, supplier_type")
    .order("created_at", { ascending: false })
    .range(from, to);
  return (data ?? []).map((row) => ({
    publicId: row.public_id,
    title: row.name,
    status: row.status,
    meta: row.supplier_type,
  }));
}

export async function getSupplier(publicId: string) {
  const supabase = await client();
  if (!supabase) return null;
  const { data } = await supabase.from("suppliers").select("*").eq("public_id", publicId).maybeSingle();
  return data;
}

export async function listContacts(page = 1): Promise<NamedRecord[]> {
  const supabase = await client();
  if (!supabase) return [];
  const { from, to } = listRange(page);
  const { data } = await supabase
    .from("contacts")
    .select("public_id, display_name, status, owner_kind, job_title")
    .order("created_at", { ascending: false })
    .range(from, to);
  return (data ?? []).map((row) => ({
    publicId: row.public_id,
    title: row.display_name,
    status: row.status,
    meta: [row.owner_kind, row.job_title].filter(Boolean).join(" · ") || undefined,
  }));
}

export async function getContact(publicId: string) {
  const supabase = await client();
  if (!supabase) return null;
  const { data } = await supabase.from("contacts").select("*").eq("public_id", publicId).maybeSingle();
  return data;
}

export async function listProcurement(page = 1): Promise<NamedRecord[]> {
  const supabase = await client();
  if (!supabase) return [];
  const { from, to } = listRange(page);
  const { data } = await supabase
    .from("procurement_purchases")
    .select("public_id, description, status, currency, amount_minor")
    .order("created_at", { ascending: false })
    .range(from, to);
  return (data ?? []).map((row) => ({
    publicId: row.public_id,
    title: row.description,
    status: row.status,
    meta: `${row.currency} ${row.amount_minor}`,
  }));
}

export async function getProcurement(publicId: string) {
  const supabase = await client();
  if (!supabase) return null;
  const { data } = await supabase.from("procurement_purchases").select("*").eq("public_id", publicId).maybeSingle();
  return data;
}

export async function listExpenses(page = 1) {
  const supabase = await client();
  if (!supabase) return [];
  const { from, to } = listRange(page);
  const { data } = await supabase
    .from("expenses")
    .select("public_id, description, status, category, currency, amount_minor, expense_date")
    .order("expense_date", { ascending: false })
    .range(from, to);
  return data ?? [];
}

export async function getExpense(publicId: string) {
  const supabase = await client();
  if (!supabase) return null;
  const { data } = await supabase.from("expenses").select("*").eq("public_id", publicId).maybeSingle();
  return data;
}

export async function listPayouts(page = 1) {
  const supabase = await client();
  if (!supabase) return [];
  const { from, to } = listRange(page);
  const { data } = await supabase
    .from("payouts")
    .select("public_id, reason, status, beneficiary_kind, currency, amount_minor, due_date")
    .order("created_at", { ascending: false })
    .range(from, to);
  return data ?? [];
}

export async function getPayout(publicId: string) {
  const supabase = await client();
  if (!supabase) return null;
  const { data } = await supabase.from("payouts").select("*").eq("public_id", publicId).maybeSingle();
  return data;
}

export async function listReferrals(page = 1) {
  const supabase = await client();
  if (!supabase) return [];
  const { from, to } = listRange(page);
  const { data } = await supabase
    .from("referrals")
    .select("public_id, source_kind, source_label, created_at")
    .order("created_at", { ascending: false })
    .range(from, to);
  return data ?? [];
}

export async function getReferral(publicId: string) {
  const supabase = await client();
  if (!supabase) return null;
  const { data } = await supabase.from("referrals").select("*").eq("public_id", publicId).maybeSingle();
  return data;
}

export async function listCommissions(page = 1) {
  const supabase = await client();
  if (!supabase) return [];
  const { from, to } = listRange(page);
  const { data } = await supabase
    .from("commissions")
    .select("public_id, reason, status, calculation_type, currency, amount_minor")
    .order("created_at", { ascending: false })
    .range(from, to);
  return data ?? [];
}

export async function getCommission(publicId: string) {
  const supabase = await client();
  if (!supabase) return null;
  const { data } = await supabase.from("commissions").select("*").eq("public_id", publicId).maybeSingle();
  return data;
}

export async function listSupportCases(page = 1, customerVisibleOnly = false) {
  const supabase = await client();
  if (!supabase) return [];
  const { from, to } = listRange(page);
  let query = supabase
    .from("support_cases")
    .select("public_id, title, status, case_type, priority, customer_visible, created_at")
    .order("created_at", { ascending: false })
    .range(from, to);
  if (customerVisibleOnly) {
    query = query.eq("customer_visible", true);
  }
  const { data } = await query;
  return data ?? [];
}

export async function getSupportCase(publicId: string) {
  const supabase = await client();
  if (!supabase) return null;
  const { data } = await supabase.from("support_cases").select("*").eq("public_id", publicId).maybeSingle();
  return data;
}

export async function listCaseEvents(caseId: string) {
  const supabase = await client();
  if (!supabase) return [];
  const { data } = await supabase
    .from("support_case_events")
    .select("event_type, summary, created_at")
    .eq("case_id", caseId)
    .order("created_at", { ascending: true });
  return data ?? [];
}

export async function listOperationalTasks(page = 1) {
  const supabase = await client();
  if (!supabase) return [];
  const { from, to } = listRange(page);
  const { data } = await supabase
    .from("operational_tasks")
    .select("public_id, title, status, priority, due_at")
    .order("created_at", { ascending: false })
    .range(from, to);
  return data ?? [];
}

export async function getOperationalTask(publicId: string) {
  const supabase = await client();
  if (!supabase) return null;
  const { data } = await supabase.from("operational_tasks").select("*").eq("public_id", publicId).maybeSingle();
  return data;
}

export async function listDocuments(page = 1) {
  const supabase = await client();
  if (!supabase) return [];
  const { from, to } = listRange(page);
  const { data } = await supabase
    .from("operational_documents")
    .select("public_id, title, document_type, entity_kind, entity_public_id, original_filename, uploaded_at")
    .order("uploaded_at", { ascending: false })
    .range(from, to);
  return data ?? [];
}

export async function getDocument(publicId: string) {
  const supabase = await client();
  if (!supabase) return null;
  const { data } = await supabase.from("operational_documents").select("*").eq("public_id", publicId).maybeSingle();
  return data;
}

export async function listCommunications(page = 1) {
  const supabase = await client();
  if (!supabase) return [];
  const { from, to } = listRange(page);
  const { data } = await supabase
    .from("operational_communications")
    .select("public_id, title, channel, source_kind, occurred_at, recorded_at, entity_kind, entity_public_id")
    .order("occurred_at", { ascending: false })
    .range(from, to);
  return data ?? [];
}

export async function getCommunication(publicId: string) {
  const supabase = await client();
  if (!supabase) return null;
  const { data } = await supabase
    .from("operational_communications")
    .select("*")
    .eq("public_id", publicId)
    .maybeSingle();
  return data;
}

export async function listInternalNotes(entityKind: NoteEntityKind, entityPublicId: string) {
  const supabase = await client();
  if (!supabase) return [];
  const { data } = await supabase
    .from("internal_notes")
    .select("public_id, content, created_at")
    .eq("entity_kind", entityKind)
    .eq("entity_public_id", entityPublicId)
    .order("created_at", { ascending: false })
    .limit(50);
  return data ?? [];
}

export async function listOperationalActivity(entityKind: string, entityPublicId: string) {
  const supabase = await client();
  if (!supabase) return [];
  const { data } = await supabase
    .from("operational_activity")
    .select("event_type, summary, occurred_at, created_at")
    .eq("entity_kind", entityKind)
    .eq("entity_public_id", entityPublicId)
    .order("occurred_at", { ascending: false })
    .limit(50);
  return data ?? [];
}

export async function listProjectTeam(projectId: string) {
  const supabase = await client();
  if (!supabase) return [];
  const { data } = await supabase
    .from("project_team_assignments")
    .select(
      "public_id, member_kind, role_label, status, employee_id, freelancer_id, partner_id, developer_user_id, assigned_at, ended_at",
    )
    .eq("project_id", projectId)
    .order("assigned_at", { ascending: false });
  return data ?? [];
}

export async function optionLists() {
  const supabase = await client();
  if (!supabase) {
    return {
      employees: [] as Array<{ public_id: string; display_name: string }>,
      freelancers: [] as Array<{ public_id: string; display_name: string }>,
      partners: [] as Array<{ public_id: string; name: string }>,
      suppliers: [] as Array<{ public_id: string; name: string }>,
      developers: [] as Array<{ public_id: string; display_name: string }>,
      organizations: [] as Array<{ public_id: string; name: string }>,
      documents: [] as Array<{ public_id: string; title: string }>,
    };
  }
  const [employees, freelancers, partners, suppliers, developers, organizations, documents] = await Promise.all([
    supabase.from("employees").select("public_id, display_name").eq("status", "active").limit(200),
    supabase.from("freelancers").select("public_id, display_name").eq("status", "active").limit(200),
    supabase.from("partner_companies").select("public_id, name").eq("status", "active").limit(200),
    supabase.from("suppliers").select("public_id, name").eq("status", "active").limit(200),
    supabase.from("developer_profiles").select("public_id, display_name").limit(200),
    supabase.from("organizations").select("public_id, name").limit(200),
    supabase.from("operational_documents").select("public_id, title").limit(200),
  ]);
  return {
    employees: employees.data ?? [],
    freelancers: freelancers.data ?? [],
    partners: partners.data ?? [],
    suppliers: suppliers.data ?? [],
    developers: developers.data ?? [],
    organizations: organizations.data ?? [],
    documents: documents.data ?? [],
  };
}

export async function getOperationsDashboard() {
  const supabase = await client();
  if (!supabase) {
    return {
      openCases: 0,
      overdueTasks: 0,
      pendingPayouts: 0,
      outstandingExpenses: 0,
      recentCommunications: [] as Awaited<ReturnType<typeof listCommunications>>,
    };
  }
  const now = new Date().toISOString();
  const [openCases, overdueProject, overdueInternal, pendingPayouts, outstandingExpenses, recentCommunications] =
    await Promise.all([
      supabase
        .from("support_cases")
        .select("id", { count: "exact", head: true })
        .in("status", ["open", "in_progress", "waiting_customer"]),
      supabase
        .from("project_tasks")
        .select("id", { count: "exact", head: true })
        .in("status", ["todo", "in_progress", "blocked"])
        .lt("due_at", now),
      supabase
        .from("operational_tasks")
        .select("id", { count: "exact", head: true })
        .in("status", ["todo", "in_progress", "blocked"])
        .lt("due_at", now),
      supabase
        .from("payouts")
        .select("id", { count: "exact", head: true })
        .in("status", ["approved", "pending"]),
      supabase
        .from("expenses")
        .select("id", { count: "exact", head: true })
        .in("status", ["submitted", "approved"]),
      listCommunications(1),
    ]);
  return {
    openCases: openCases.count ?? 0,
    overdueTasks: (overdueProject.count ?? 0) + (overdueInternal.count ?? 0),
    pendingPayouts: pendingPayouts.count ?? 0,
    outstandingExpenses: outstandingExpenses.count ?? 0,
    recentCommunications: recentCommunications.slice(0, 6),
  };
}

export async function getOperationsReport() {
  const supabase = await client();
  const empty = {
    projectsByStatus: [] as Array<{ status: string; count: number }>,
    tasksByStatus: [] as Array<{ status: string; count: number }>,
    openCases: 0,
    expensesByCategory: [] as Array<{ category: string; currency: InvoiceCurrency; amountMinor: number; count: number }>,
    payoutsByStatus: [] as Array<{ status: string; currency: InvoiceCurrency; amountMinor: number; count: number }>,
    freelancerObligations: [] as Array<{ currency: InvoiceCurrency; amountMinor: number; count: number }>,
    supplierObligations: [] as Array<{ currency: InvoiceCurrency; amountMinor: number; count: number }>,
    commissionsByStatus: [] as Array<{ status: string; currency: InvoiceCurrency; amountMinor: number; count: number }>,
  };
  if (!supabase) return empty;
  const [projects, tasks, cases, expenses, payouts, commissions] = await Promise.all([
    supabase.from("projects").select("status").limit(2000),
    supabase.from("project_tasks").select("status").limit(2000),
    supabase.from("support_cases").select("status").in("status", ["open", "in_progress", "waiting_customer"]).limit(2000),
    supabase.from("expenses").select("category, currency, amount_minor, status").limit(2000),
    supabase.from("payouts").select("status, currency, amount_minor, beneficiary_kind").limit(2000),
    supabase.from("commissions").select("status, currency, amount_minor").limit(2000),
  ]);
  const countBy = (rows: Array<{ status: string }> | null) => {
    const map = new Map<string, number>();
    for (const row of rows ?? []) {
      map.set(row.status, (map.get(row.status) ?? 0) + 1);
    }
    return [...map.entries()].map(([status, count]) => ({ status, count }));
  };
  const moneyGroups = (
    rows: Array<{ status?: string; category?: string; currency: string; amount_minor: number | string }>,
    key: "status" | "category",
  ) => {
    const map = new Map<string, { currency: InvoiceCurrency; amountMinor: number; count: number }>();
    for (const row of rows) {
      const currency = row.currency as InvoiceCurrency;
      const groupKey = `${row[key]}:${currency}`;
      const current = map.get(groupKey) ?? { currency, amountMinor: 0, count: 0 };
      current.amountMinor += asMinor(row.amount_minor);
      current.count += 1;
      map.set(groupKey, current);
    }
    return [...map.entries()].map(([combo, value]) => ({
      [key]: combo.split(":")[0],
      ...value,
    }));
  };
  const obligation = (
    rows: Array<{ status: string; currency: string; amount_minor: number | string; beneficiary_kind: string }>,
    kind: string,
  ) => {
    const map = new Map<string, { currency: InvoiceCurrency; amountMinor: number; count: number }>();
    for (const row of rows) {
      if (row.beneficiary_kind !== kind || !["approved", "pending"].includes(row.status)) continue;
      const currency = row.currency as InvoiceCurrency;
      const current = map.get(currency) ?? { currency, amountMinor: 0, count: 0 };
      current.amountMinor += asMinor(row.amount_minor);
      current.count += 1;
      map.set(currency, current);
    }
    return [...map.values()];
  };
  return {
    projectsByStatus: countBy(projects.data),
    tasksByStatus: countBy(tasks.data),
    openCases: cases.data?.length ?? 0,
    expensesByCategory: moneyGroups(expenses.data ?? [], "category") as Array<{
      category: string;
      currency: InvoiceCurrency;
      amountMinor: number;
      count: number;
    }>,
    payoutsByStatus: moneyGroups(payouts.data ?? [], "status") as Array<{
      status: string;
      currency: InvoiceCurrency;
      amountMinor: number;
      count: number;
    }>,
    freelancerObligations: obligation(payouts.data ?? [], "freelancer"),
    supplierObligations: obligation(payouts.data ?? [], "supplier"),
    commissionsByStatus: moneyGroups(commissions.data ?? [], "status") as Array<{
      status: string;
      currency: InvoiceCurrency;
      amountMinor: number;
      count: number;
    }>,
  };
}

export function isPersonStatus(value: string): value is PersonStatus {
  return (PERSON_STATUSES as readonly string[]).includes(value);
}
export function isNetworkStatus(value: string): value is NetworkStatus {
  return (NETWORK_STATUSES as readonly string[]).includes(value);
}
export function isExpenseStatus(value: string): value is ExpenseStatus {
  return (EXPENSE_STATUSES as readonly string[]).includes(value);
}
export function isExpenseCategory(value: string): value is ExpenseCategory {
  return (EXPENSE_CATEGORIES as readonly string[]).includes(value);
}
export function isPayoutStatus(value: string): value is PayoutStatus {
  return (PAYOUT_STATUSES as readonly string[]).includes(value);
}
export function isProcurementStatus(value: string): value is ProcurementStatus {
  return (PROCUREMENT_STATUSES as readonly string[]).includes(value);
}
export function isCaseStatus(value: string): value is CaseStatus {
  return (CASE_STATUSES as readonly string[]).includes(value);
}
export function isCaseType(value: string): value is CaseType {
  return (CASE_TYPES as readonly string[]).includes(value);
}
export function isDocumentType(value: string): value is DocumentType {
  return (DOCUMENT_TYPES as readonly string[]).includes(value);
}
export function isChannel(value: string): value is CommunicationChannel {
  return (COMMUNICATION_CHANNELS as readonly string[]).includes(value);
}
export function isSource(value: string): value is CommunicationSource {
  return (COMMUNICATION_SOURCES as readonly string[]).includes(value);
}
export function isNoteKind(value: string): value is NoteEntityKind {
  return (NOTE_ENTITY_KINDS as readonly string[]).includes(value);
}
export function isTaskStatus(value: string): value is TaskStatus {
  return ["todo", "in_progress", "blocked", "completed", "cancelled"].includes(value);
}
export function isTaskPriority(value: string): value is TaskPriority {
  return ["low", "normal", "high", "urgent"].includes(value);
}
