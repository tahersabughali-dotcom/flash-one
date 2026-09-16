import { z } from "zod";

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((value) => (value && value.length > 0 ? value : ""));

export const companySettingsSchema = z.object({
  legalCompanyName: optionalText(160),
  tradingName: optionalText(160),
  companyNumber: optionalText(80),
  registeredAddress: optionalText(400),
  countryCode: optionalText(2),
  vatRegistered: z.enum(["true", "false", ""]).optional(),
  vatNumber: optionalText(40),
  publicEmail: optionalText(160),
  publicPhone: optionalText(40),
  website: optionalText(200),
  supportContact: optionalText(160),
});

export const brandSettingsSchema = z.object({
  brandName: z.string().trim().min(1).max(80),
  website: z.string().trim().min(1).max(200),
  invoiceBrandingName: z.string().trim().min(1).max(80),
});

export const featureFlagSchema = z.object({
  code: z.string().trim().min(1).max(80),
  enabled: z.enum(["true", "false"]),
});

export const currencyEnabledSchema = z.object({
  code: z.enum(["GBP", "USD", "EUR"]),
  enabled: z.enum(["true", "false"]),
});

export const countryEnabledSchema = z.object({
  code: z
    .string()
    .trim()
    .regex(/^[A-Za-z]{2}$/),
  enabled: z.enum(["true", "false"]),
});

export const languageEnabledSchema = z.object({
  code: z.enum(["en", "ar"]),
  enabled: z.enum(["true", "false"]),
});

export const integrationStateSchema = z.object({
  code: z.string().trim().min(1).max(40),
  state: z.enum([
    "enabled",
    "disabled",
    "configuration_required",
    "maintenance",
    "unavailable",
  ]),
});

export const automationRuleSchema = z.object({
  publicId: optionalText(40),
  name: z.string().trim().min(1).max(120),
  eventType: z.string().trim().min(1).max(80),
  actionType: z.enum([
    "create_notification",
    "create_admin_follow_up",
    "create_operational_task",
    "create_case",
    "record_activity",
    "development_fail",
  ]),
  title: optionalText(160),
  body: optionalText(1000),
  enabled: z.enum(["true", "false"]).optional(),
});

export const incidentSchema = z.object({
  publicId: optionalText(40),
  title: z.string().trim().min(1).max(160),
  severity: z.enum(["low", "medium", "high", "critical"]),
  status: z.enum(["open", "investigating", "resolved", "closed"]),
  affectedModule: z.string().trim().min(1).max(80),
  description: optionalText(4000),
});

export const releaseSchema = z.object({
  versionName: z.string().trim().min(1).max(80),
  environmentLabel: z.enum(["development", "production", "unknown"]),
  commitReference: optionalText(80),
  notes: optionalText(4000),
});

export const importBatchSchema = z.object({
  importType: z.enum([
    "csv_generic",
    "csv_contacts",
    "excel_placeholder",
    "bank_statement",
    "provider_transactions",
  ]),
  filename: optionalText(180),
  rowsJson: z.string().trim().min(2).max(200000),
});

export const importReviewSchema = z.object({
  publicId: z.string().trim().min(1).max(40),
  decision: z.enum(["approve", "reject", "apply"]),
});
