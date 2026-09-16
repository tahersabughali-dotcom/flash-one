export const OPERATIONS_PATHS = {
  employees: "/admin/employees",
  employeeNew: "/admin/employees/new",
  employee: (publicId: string) => `/admin/employees/${publicId}`,
  freelancers: "/admin/freelancers",
  freelancerNew: "/admin/freelancers/new",
  freelancer: (publicId: string) => `/admin/freelancers/${publicId}`,
  partners: "/admin/partners",
  partnerNew: "/admin/partners/new",
  partner: (publicId: string) => `/admin/partners/${publicId}`,
  suppliers: "/admin/suppliers",
  supplierNew: "/admin/suppliers/new",
  supplier: (publicId: string) => `/admin/suppliers/${publicId}`,
  contacts: "/admin/contacts",
  contactNew: "/admin/contacts/new",
  contact: (publicId: string) => `/admin/contacts/${publicId}`,
  procurement: "/admin/procurement",
  procurementNew: "/admin/procurement/new",
  purchase: (publicId: string) => `/admin/procurement/${publicId}`,
  expenses: "/admin/expenses",
  expenseNew: "/admin/expenses/new",
  expense: (publicId: string) => `/admin/expenses/${publicId}`,
  payouts: "/admin/payouts",
  payoutNew: "/admin/payouts/new",
  payout: (publicId: string) => `/admin/payouts/${publicId}`,
  referrals: "/admin/referrals",
  referralNew: "/admin/referrals/new",
  referral: (publicId: string) => `/admin/referrals/${publicId}`,
  commissions: "/admin/commissions",
  commissionNew: "/admin/commissions/new",
  commission: (publicId: string) => `/admin/commissions/${publicId}`,
  tasks: "/admin/tasks",
  taskNew: "/admin/tasks/new",
  task: (publicId: string) => `/admin/tasks/${publicId}`,
  cases: "/admin/cases",
  caseNew: "/admin/cases/new",
  caseDetail: (publicId: string) => `/admin/cases/${publicId}`,
  documents: "/admin/documents",
  documentNew: "/admin/documents/new",
  document: (publicId: string) => `/admin/documents/${publicId}`,
  communications: "/admin/communications",
  communicationNew: "/admin/communications/new",
  communication: (publicId: string) => `/admin/communications/${publicId}`,
  health: "/admin/health",
  customerCases: "/app/cases",
  customerCase: (publicId: string) => `/app/cases/${publicId}`,
  exportExpenses: "/admin/reports/export/expenses",
  exportPayouts: "/admin/reports/export/payouts",
  exportCases: "/admin/reports/export/cases",
  exportSuppliers: "/admin/reports/export/suppliers",
  exportFreelancers: "/admin/reports/export/freelancers",
} as const;

export const DOCUMENT_BUCKET = "operational-documents";

export const PERSON_STATUSES = ["active", "inactive"] as const;
export type PersonStatus = (typeof PERSON_STATUSES)[number];
export const PERSON_STATUS_LABELS: Record<PersonStatus, string> = {
  active: "Active",
  inactive: "Inactive",
};

export const NETWORK_STATUSES = ["active", "inactive", "archived"] as const;
export type NetworkStatus = (typeof NETWORK_STATUSES)[number];
export const NETWORK_STATUS_LABELS: Record<NetworkStatus, string> = {
  active: "Active",
  inactive: "Inactive",
  archived: "Archived",
};

export const CONTACT_STATUSES = ["active", "archived"] as const;
export type ContactStatus = (typeof CONTACT_STATUSES)[number];
export const CONTACT_STATUS_LABELS: Record<ContactStatus, string> = {
  active: "Active",
  archived: "Archived",
};

export const CONTACT_OWNER_KINDS = ["organization", "partner", "supplier", "other"] as const;
export type ContactOwnerKind = (typeof CONTACT_OWNER_KINDS)[number];
export const CONTACT_OWNER_LABELS: Record<ContactOwnerKind, string> = {
  organization: "Customer organization",
  partner: "Partner company",
  supplier: "Supplier",
  other: "Other relationship",
};

export const PARTNER_TYPES = [
  "delivery_partner",
  "referral_partner",
  "technology_partner",
  "subcontractor",
  "other",
] as const;
export type PartnerType = (typeof PARTNER_TYPES)[number];
export const PARTNER_TYPE_LABELS: Record<PartnerType, string> = {
  delivery_partner: "Delivery partner",
  referral_partner: "Referral partner",
  technology_partner: "Technology partner",
  subcontractor: "Subcontractor",
  other: "Other",
};

export const SUPPLIER_TYPES = [
  "software_vendor",
  "hosting_infrastructure",
  "freelancer_supplier",
  "consultant",
  "professional_service",
  "other",
] as const;
export type SupplierType = (typeof SUPPLIER_TYPES)[number];
export const SUPPLIER_TYPE_LABELS: Record<SupplierType, string> = {
  software_vendor: "Software vendor",
  hosting_infrastructure: "Hosting / infrastructure",
  freelancer_supplier: "Freelancer supplier",
  consultant: "Consultant",
  professional_service: "Professional service",
  other: "Other",
};

export const PROCUREMENT_STATUSES = ["draft", "ordered", "received", "cancelled", "recorded"] as const;
export type ProcurementStatus = (typeof PROCUREMENT_STATUSES)[number];
export const PROCUREMENT_STATUS_LABELS: Record<ProcurementStatus, string> = {
  draft: "Draft",
  ordered: "Ordered",
  received: "Received",
  cancelled: "Cancelled",
  recorded: "Recorded",
};

export const EXPENSE_CATEGORIES = [
  "software",
  "services",
  "freelance",
  "infrastructure",
  "consulting",
  "operations",
  "other",
] as const;
export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];
export const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  software: "Software",
  services: "Services",
  freelance: "Freelance",
  infrastructure: "Infrastructure",
  consulting: "Consulting",
  operations: "Operations",
  other: "Other",
};

export const EXPENSE_STATUSES = ["draft", "submitted", "approved", "recorded", "cancelled"] as const;
export type ExpenseStatus = (typeof EXPENSE_STATUSES)[number];
export const EXPENSE_STATUS_LABELS: Record<ExpenseStatus, string> = {
  draft: "Draft",
  submitted: "Submitted",
  approved: "Approved",
  recorded: "Recorded",
  cancelled: "Cancelled",
};

export const PAYOUT_STATUSES = ["draft", "approved", "pending", "paid_manual", "cancelled"] as const;
export type PayoutStatus = (typeof PAYOUT_STATUSES)[number];
export const PAYOUT_STATUS_LABELS: Record<PayoutStatus, string> = {
  draft: "Draft",
  approved: "Approved",
  pending: "Pending",
  paid_manual: "Paid (manual record)",
  cancelled: "Cancelled",
};

export const BENEFICIARY_KINDS = ["employee", "freelancer", "supplier", "partner"] as const;
export type BeneficiaryKind = (typeof BENEFICIARY_KINDS)[number];
export const BENEFICIARY_KIND_LABELS: Record<BeneficiaryKind, string> = {
  employee: "Employee",
  freelancer: "Freelancer",
  supplier: "Supplier",
  partner: "Partner company",
};

export const COMMISSION_BENEFICIARIES = ["employee", "freelancer", "partner"] as const;
export type CommissionBeneficiary = (typeof COMMISSION_BENEFICIARIES)[number];

export const REFERRAL_SOURCES = ["employee", "freelancer", "partner", "other"] as const;
export type ReferralSource = (typeof REFERRAL_SOURCES)[number];
export const REFERRAL_SOURCE_LABELS: Record<ReferralSource, string> = {
  employee: "Employee",
  freelancer: "Freelancer",
  partner: "Partner company",
  other: "Other",
};

export const COMMISSION_CALCULATIONS = ["fixed", "percentage"] as const;
export type CommissionCalculation = (typeof COMMISSION_CALCULATIONS)[number];
export const COMMISSION_CALCULATION_LABELS: Record<CommissionCalculation, string> = {
  fixed: "Fixed amount",
  percentage: "Percentage (basis points)",
};

export const COMMISSION_STATUSES = ["draft", "approved", "cancelled", "paid"] as const;
export type CommissionStatus = (typeof COMMISSION_STATUSES)[number];
export const COMMISSION_STATUS_LABELS: Record<CommissionStatus, string> = {
  draft: "Draft",
  approved: "Approved",
  cancelled: "Cancelled",
  paid: "Paid via payout",
};

export const TEAM_MEMBER_KINDS = ["employee", "developer", "freelancer", "partner"] as const;
export type TeamMemberKind = (typeof TEAM_MEMBER_KINDS)[number];
export const TEAM_MEMBER_KIND_LABELS: Record<TeamMemberKind, string> = {
  employee: "Employee",
  developer: "Developer",
  freelancer: "Freelancer",
  partner: "Partner company",
};

export const TEAM_ROLE_LABELS_VALUES = [
  "project_lead",
  "developer",
  "designer",
  "consultant",
  "qa",
  "support",
  "partner",
  "other",
] as const;
export type TeamRoleLabel = (typeof TEAM_ROLE_LABELS_VALUES)[number];
export const TEAM_ROLE_LABELS: Record<TeamRoleLabel, string> = {
  project_lead: "Project Lead",
  developer: "Developer",
  designer: "Designer",
  consultant: "Consultant",
  qa: "QA",
  support: "Support",
  partner: "Partner",
  other: "Other",
};

export const TASK_ASSIGNEE_KINDS = ["employee", "freelancer", "developer"] as const;
export type TaskAssigneeKind = (typeof TASK_ASSIGNEE_KINDS)[number];

export const CASE_TYPES = [
  "technical_support",
  "billing",
  "project",
  "order",
  "general",
  "other",
] as const;
export type CaseType = (typeof CASE_TYPES)[number];
export const CASE_TYPE_LABELS: Record<CaseType, string> = {
  technical_support: "Technical support",
  billing: "Billing",
  project: "Project",
  order: "Order",
  general: "General",
  other: "Other",
};

export const CASE_STATUSES = ["open", "in_progress", "waiting_customer", "resolved", "closed"] as const;
export type CaseStatus = (typeof CASE_STATUSES)[number];
export const CASE_STATUS_LABELS: Record<CaseStatus, string> = {
  open: "Open",
  in_progress: "In progress",
  waiting_customer: "Waiting on customer",
  resolved: "Resolved",
  closed: "Closed",
};

export const DOCUMENT_TYPES = [
  "customer",
  "supplier",
  "contract",
  "procurement",
  "expense",
  "partner",
  "internal",
  "other",
] as const;
export type DocumentType = (typeof DOCUMENT_TYPES)[number];
export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  customer: "Customer",
  supplier: "Supplier",
  contract: "Contract",
  procurement: "Procurement",
  expense: "Expense",
  partner: "Partner",
  internal: "Internal",
  other: "Other",
};

export const NOTE_ENTITY_KINDS = [
  "customer",
  "organization",
  "project",
  "invoice",
  "order",
  "partner",
  "supplier",
  "employee",
  "freelancer",
  "case",
  "expense",
  "payout",
  "procurement",
  "contact",
  "other",
] as const;
export type NoteEntityKind = (typeof NOTE_ENTITY_KINDS)[number];

export const COMMUNICATION_CHANNELS = [
  "platform_conversation",
  "email",
  "phone",
  "meeting",
  "whatsapp",
  "zoom",
  "teams",
  "sms",
  "other",
] as const;
export type CommunicationChannel = (typeof COMMUNICATION_CHANNELS)[number];
export const COMMUNICATION_CHANNEL_LABELS: Record<CommunicationChannel, string> = {
  platform_conversation: "Platform conversation",
  email: "Email",
  phone: "Phone call",
  meeting: "Meeting",
  whatsapp: "WhatsApp",
  zoom: "Zoom",
  teams: "Teams",
  sms: "SMS",
  other: "Other",
};

export const COMMUNICATION_SOURCES = ["platform", "manual_record"] as const;
export type CommunicationSource = (typeof COMMUNICATION_SOURCES)[number];
export const COMMUNICATION_SOURCE_LABELS: Record<CommunicationSource, string> = {
  platform: "Platform",
  manual_record: "Manual record",
};

export const MAX_NAME_LENGTH = 160;
export const MAX_NOTES_LENGTH = 4000;
export const MAX_BODY_LENGTH = 8000;
