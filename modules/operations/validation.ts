import { z } from "zod";
import { INVOICE_CURRENCIES, MAX_UNIT_MINOR } from "@/modules/invoices/constants";
import { parseMajorToMinor } from "@/modules/invoices/money";
import { TASK_PRIORITIES, TASK_STATUSES } from "@/modules/tasks";
import {
  BENEFICIARY_KINDS,
  CASE_STATUSES,
  CASE_TYPES,
  COMMISSION_BENEFICIARIES,
  COMMISSION_CALCULATIONS,
  COMMISSION_STATUSES,
  COMMUNICATION_CHANNELS,
  CONTACT_OWNER_KINDS,
  CONTACT_STATUSES,
  DOCUMENT_TYPES,
  EXPENSE_CATEGORIES,
  EXPENSE_STATUSES,
  MAX_BODY_LENGTH,
  MAX_NAME_LENGTH,
  MAX_NOTES_LENGTH,
  NETWORK_STATUSES,
  NOTE_ENTITY_KINDS,
  PARTNER_TYPES,
  PAYOUT_STATUSES,
  PERSON_STATUSES,
  PROCUREMENT_STATUSES,
  REFERRAL_SOURCES,
  SUPPLIER_TYPES,
  TASK_ASSIGNEE_KINDS,
  TEAM_MEMBER_KINDS,
  TEAM_ROLE_LABELS_VALUES,
} from "./constants";

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((value) => (value ? value : undefined));

function moneyMinor(amount: string | undefined, ctx: z.RefinementCtx, path: string) {
  const minor = parseMajorToMinor(amount ?? "");
  if (minor === null || minor < 0 || minor > MAX_UNIT_MINOR) {
    ctx.addIssue({ code: "custom", message: "Enter a valid amount with up to two decimal places.", path: [path] });
    return z.NEVER;
  }
  return minor;
}

export const employeeUpsertSchema = z.object({
  publicId: optionalText(40),
  displayName: z.string().trim().min(1, "Enter a name.").max(120),
  email: optionalText(160),
  jobTitle: optionalText(120),
  department: optionalText(120),
  status: z.enum(PERSON_STATUSES),
  startDate: optionalText(20),
  linkedPublicId: optionalText(40),
  internalNotes: optionalText(MAX_NOTES_LENGTH),
});

export const freelancerUpsertSchema = z.object({
  publicId: optionalText(40),
  displayName: z.string().trim().min(1, "Enter a name.").max(120),
  email: optionalText(160),
  specialty: optionalText(160),
  country: optionalText(80),
  status: z.enum(NETWORK_STATUSES),
  developerPublicId: optionalText(40),
  internalNotes: optionalText(MAX_NOTES_LENGTH),
});

export const partnerUpsertSchema = z.object({
  publicId: optionalText(40),
  name: z.string().trim().min(1, "Enter a company name.").max(MAX_NAME_LENGTH),
  relationshipType: z.enum(PARTNER_TYPES),
  capabilities: optionalText(MAX_NOTES_LENGTH),
  website: optionalText(200),
  country: optionalText(80),
  status: z.enum(NETWORK_STATUSES),
  internalNotes: optionalText(MAX_NOTES_LENGTH),
});

export const supplierUpsertSchema = z.object({
  publicId: optionalText(40),
  name: z.string().trim().min(1, "Enter a supplier name.").max(MAX_NAME_LENGTH),
  supplierType: z.enum(SUPPLIER_TYPES),
  status: z.enum(NETWORK_STATUSES),
  internalNotes: optionalText(MAX_NOTES_LENGTH),
});

export const contactUpsertSchema = z
  .object({
    publicId: optionalText(40),
    displayName: z.string().trim().min(1, "Enter a name.").max(120),
    jobTitle: optionalText(120),
    email: optionalText(160),
    phone: optionalText(40),
    ownerKind: z.enum(CONTACT_OWNER_KINDS),
    ownerPublicId: optionalText(40),
    status: z.enum(CONTACT_STATUSES),
    internalNotes: optionalText(MAX_NOTES_LENGTH),
  })
  .superRefine((value, ctx) => {
    if (value.ownerKind !== "other" && !value.ownerPublicId) {
      ctx.addIssue({ code: "custom", message: "Select the related organization, partner, or supplier." });
    }
  });

export const procurementUpsertSchema = z
  .object({
    publicId: optionalText(40),
    supplierPublicId: z.string().trim().min(1, "Select a supplier."),
    description: z.string().trim().min(1, "Enter a description.").max(400),
    currency: z.enum(INVOICE_CURRENCIES),
    amount: z.string().trim().min(1, "Enter an amount."),
    status: z.enum(PROCUREMENT_STATUSES),
    purchaseDate: optionalText(20),
    dueDate: optionalText(20),
    projectPublicId: optionalText(40),
    internalNotes: optionalText(MAX_NOTES_LENGTH),
  })
  .transform((value, ctx) => ({ ...value, amountMinor: moneyMinor(value.amount, ctx, "amount") }));

export const expenseUpsertSchema = z
  .object({
    publicId: optionalText(40),
    category: z.enum(EXPENSE_CATEGORIES),
    description: z.string().trim().min(1, "Enter a description.").max(400),
    currency: z.enum(INVOICE_CURRENCIES),
    amount: z.string().trim().min(1, "Enter an amount."),
    expenseDate: z.string().trim().min(1, "Enter a date."),
    status: z.enum(EXPENSE_STATUSES),
    supplierPublicId: optionalText(40),
    employeePublicId: optionalText(40),
    freelancerPublicId: optionalText(40),
    partnerPublicId: optionalText(40),
    projectPublicId: optionalText(40),
    documentPublicId: optionalText(40),
    internalNotes: optionalText(MAX_NOTES_LENGTH),
  })
  .transform((value, ctx) => ({ ...value, amountMinor: moneyMinor(value.amount, ctx, "amount") }));

export const payoutUpsertSchema = z
  .object({
    publicId: optionalText(40),
    beneficiaryKind: z.enum(BENEFICIARY_KINDS),
    beneficiaryPublicId: z.string().trim().min(1, "Select a beneficiary."),
    amount: z.string().trim().min(1, "Enter an amount."),
    currency: z.enum(INVOICE_CURRENCIES),
    reason: z.string().trim().min(1, "Enter a reason.").max(400),
    status: z.enum(PAYOUT_STATUSES),
    dueDate: optionalText(20),
    paidAt: optionalText(40),
    paymentMethodDescription: optionalText(160),
    referenceText: optionalText(160),
    projectPublicId: optionalText(40),
    expensePublicId: optionalText(40),
    internalNotes: optionalText(MAX_NOTES_LENGTH),
  })
  .superRefine((value, ctx) => {
    if (value.status === "paid_manual") {
      if (!value.paidAt || !value.paymentMethodDescription) {
        ctx.addIssue({
          code: "custom",
          message: "Paid manual records need a paid date and a truthful payment method description.",
        });
      }
    }
  })
  .transform((value, ctx) => {
    const amountMinor = moneyMinor(value.amount, ctx, "amount");
    if (amountMinor < 1) {
      ctx.addIssue({ code: "custom", message: "Payout amount must be greater than zero.", path: ["amount"] });
      return z.NEVER;
    }
    return { ...value, amountMinor };
  });

export const referralCreateSchema = z.object({
  sourceKind: z.enum(REFERRAL_SOURCES),
  sourcePublicId: optionalText(40),
  sourceLabel: optionalText(160),
  customerPublicId: optionalText(40),
  organizationPublicId: optionalText(40),
  projectPublicId: optionalText(40),
  internalNotes: optionalText(MAX_NOTES_LENGTH),
});

export const commissionUpsertSchema = z
  .object({
    publicId: optionalText(40),
    referralPublicId: optionalText(40),
    beneficiaryKind: z.enum(COMMISSION_BENEFICIARIES),
    beneficiaryPublicId: z.string().trim().min(1, "Select a beneficiary."),
    calculationType: z.enum(COMMISSION_CALCULATIONS),
    basisAmount: optionalText(40),
    rateBps: optionalText(10),
    amount: optionalText(40),
    currency: z.enum(INVOICE_CURRENCIES),
    status: z.enum(COMMISSION_STATUSES),
    reason: z.string().trim().min(1, "Enter a reason.").max(400),
    projectPublicId: optionalText(40),
    invoicePublicId: optionalText(40),
    createPayout: z.boolean(),
  })
  .transform((value, ctx) => {
    let basisAmountMinor: number | undefined;
    let rateBps: number | undefined;
    let amountMinor = 0;
    if (value.calculationType === "percentage") {
      const basis = parseMajorToMinor(value.basisAmount ?? "");
      const bps = Number.parseInt(value.rateBps ?? "", 10);
      if (basis === null || !Number.isInteger(bps) || bps < 1 || bps > 10000) {
        ctx.addIssue({
          code: "custom",
          message: "Percentage commission needs an explicit basis amount and integer basis points (1–10000).",
        });
        return z.NEVER;
      }
      basisAmountMinor = basis;
      rateBps = bps;
      amountMinor = Math.floor((basis * bps) / 10000);
      if (amountMinor < 1) {
        ctx.addIssue({ code: "custom", message: "Commission amount is too small." });
        return z.NEVER;
      }
    } else {
      const minor = parseMajorToMinor(value.amount ?? "");
      if (minor === null || minor < 1) {
        ctx.addIssue({ code: "custom", message: "Enter a fixed commission amount." });
        return z.NEVER;
      }
      amountMinor = minor;
    }
    return { ...value, basisAmountMinor, rateBps, amountMinor };
  });

export const teamAssignSchema = z.object({
  projectPublicId: z.string().trim().min(1),
  memberKind: z.enum(TEAM_MEMBER_KINDS),
  memberPublicId: z.string().trim().min(1, "Select a team member."),
  roleLabel: z.enum(TEAM_ROLE_LABELS_VALUES),
});

export const teamEndSchema = z.object({
  publicId: z.string().trim().min(1),
  projectPublicId: z.string().trim().min(1),
});

export const taskAssigneeSchema = z.object({
  taskPublicId: z.string().trim().min(1),
  projectPublicId: z.string().trim().min(1),
  assigneeKind: z.enum(["", ...TASK_ASSIGNEE_KINDS]).transform((value) => (value === "" ? undefined : value)),
  assigneePublicId: optionalText(40),
});

export const operationalTaskUpsertSchema = z.object({
  publicId: optionalText(40),
  title: z.string().trim().min(1, "Enter a title.").max(160),
  description: optionalText(4000),
  status: z.enum(TASK_STATUSES),
  priority: z.enum(TASK_PRIORITIES),
  dueAt: optionalText(40),
  projectPublicId: optionalText(40),
  customerPublicId: optionalText(40),
  invoicePublicId: optionalText(40),
  casePublicId: optionalText(40),
  assigneeEmployeePublicId: optionalText(40),
});

export const supportCaseUpsertSchema = z.object({
  publicId: optionalText(40),
  title: z.string().trim().min(1, "Enter a title.").max(160),
  caseType: z.enum(CASE_TYPES),
  priority: z.enum(TASK_PRIORITIES),
  status: z.enum(CASE_STATUSES),
  description: optionalText(MAX_BODY_LENGTH),
  customerPublicId: optionalText(40),
  organizationPublicId: optionalText(40),
  projectPublicId: optionalText(40),
  orderPublicId: optionalText(40),
  invoicePublicId: optionalText(40),
  assignedEmployeePublicId: optionalText(40),
  customerVisible: z.boolean(),
});

export const communicationRecordSchema = z.object({
  channel: z.enum(COMMUNICATION_CHANNELS),
  title: z.string().trim().min(1, "Enter a title.").max(160),
  body: optionalText(MAX_BODY_LENGTH),
  occurredAt: z.string().trim().min(1, "Enter when this occurred."),
  entityKind: optionalText(40),
  entityPublicId: optionalText(40),
  customerPublicId: optionalText(40),
  organizationPublicId: optionalText(40),
  projectPublicId: optionalText(40),
});

export const internalNoteSchema = z.object({
  entityKind: z.enum(NOTE_ENTITY_KINDS),
  entityPublicId: z.string().trim().min(1),
  content: z.string().trim().min(1, "Enter a note.").max(MAX_BODY_LENGTH),
});

export const documentRegisterSchema = z.object({
  title: z.string().trim().min(1, "Enter a title.").max(160),
  documentType: z.enum(DOCUMENT_TYPES),
  entityKind: z.enum(NOTE_ENTITY_KINDS),
  entityPublicId: optionalText(40),
  internalNotes: optionalText(MAX_NOTES_LENGTH),
});
