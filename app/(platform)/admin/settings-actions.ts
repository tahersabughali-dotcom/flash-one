"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { firstZodError } from "@/modules/auth";
import { AUTH_PATHS } from "@/modules/auth/constants";
import { requirePlatformAdmin } from "@/lib/server/auth";
import { createSessionSupabaseClient } from "@/lib/supabase/server";
import {
  automationRuleSchema,
  brandSettingsSchema,
  companySettingsSchema,
  countryEnabledSchema,
  currencyEnabledSchema,
  featureFlagSchema,
  importBatchSchema,
  importReviewSchema,
  incidentSchema,
  integrationStateSchema,
  languageEnabledSchema,
  releaseSchema,
  SETTINGS_PATHS,
} from "@/modules/settings";
import { AUTOMATION_PATHS } from "@/modules/automations";
import { INTEGRATION_PATHS } from "@/modules/integrations";
import type { AdminFinanceFormState } from "./finance-errors";

export type SettingsFormState = AdminFinanceFormState;

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

function mapError(message: string | undefined) {
  const lower = (message ?? "").toLowerCase();
  if (lower.includes("not authorized") || lower.includes("platform admin")) {
    return "Admin access is required.";
  }
  if (lower.includes("secret")) {
    return "Secret keys cannot be stored in settings.";
  }
  if (lower.includes("bank") || lower.includes("provider files")) {
    return "Bank and provider files cannot become financial records from import.";
  }
  if (lower.includes("english")) {
    return "English remains the default language.";
  }
  if (lower.includes("not found")) {
    return "That record was not found.";
  }
  if (lower.includes("automatic deletion")) {
    return "Automatic deletion stays off until a verified retention policy exists.";
  }
  return "Unable to save this configuration.";
}

export async function updateCompanySettingsAction(
  _prev: SettingsFormState,
  formData: FormData,
): Promise<SettingsFormState> {
  const supabase = await requireAdmin(SETTINGS_PATHS.company);
  const parsed = companySettingsSchema.safeParse({
    legalCompanyName: String(formData.get("legalCompanyName") ?? ""),
    tradingName: String(formData.get("tradingName") ?? ""),
    companyNumber: String(formData.get("companyNumber") ?? ""),
    registeredAddress: String(formData.get("registeredAddress") ?? ""),
    countryCode: String(formData.get("countryCode") ?? ""),
    vatRegistered: String(formData.get("vatRegistered") ?? ""),
    vatNumber: String(formData.get("vatNumber") ?? ""),
    publicEmail: String(formData.get("publicEmail") ?? ""),
    publicPhone: String(formData.get("publicPhone") ?? ""),
    website: String(formData.get("website") ?? ""),
    supportContact: String(formData.get("supportContact") ?? ""),
  });
  if (!parsed.success) {
    return { error: firstZodError(parsed.error) ?? "Check the company fields." };
  }
  const vat =
    parsed.data.vatRegistered === "true"
      ? true
      : parsed.data.vatRegistered === "false"
        ? false
        : null;
  const { error } = await supabase.rpc("admin_update_company_settings", {
    p_legal_company_name: parsed.data.legalCompanyName,
    p_trading_name: parsed.data.tradingName,
    p_company_number: parsed.data.companyNumber,
    p_registered_address: parsed.data.registeredAddress,
    p_country_code: parsed.data.countryCode,
    p_vat_registered: vat as boolean,
    p_vat_number: parsed.data.vatNumber,
    p_public_email: parsed.data.publicEmail,
    p_public_phone: parsed.data.publicPhone,
    p_website: parsed.data.website,
    p_support_contact: parsed.data.supportContact,
  });
  if (error) {
    return { error: mapError(error.message) };
  }
  revalidatePath(SETTINGS_PATHS.company);
  redirect(SETTINGS_PATHS.company);
}

export async function updateBrandSettingsAction(
  _prev: SettingsFormState,
  formData: FormData,
): Promise<SettingsFormState> {
  const supabase = await requireAdmin(SETTINGS_PATHS.brand);
  const parsed = brandSettingsSchema.safeParse({
    brandName: String(formData.get("brandName") ?? ""),
    website: String(formData.get("website") ?? ""),
    invoiceBrandingName: String(formData.get("invoiceBrandingName") ?? ""),
  });
  if (!parsed.success) {
    return { error: firstZodError(parsed.error) ?? "Check the brand fields." };
  }
  const { error } = await supabase.rpc("admin_update_brand_settings", {
    p_brand_name: parsed.data.brandName,
    p_website: parsed.data.website,
    p_invoice_branding_name: parsed.data.invoiceBrandingName,
  });
  if (error) {
    return { error: mapError(error.message) };
  }
  revalidatePath(SETTINGS_PATHS.brand);
  redirect(SETTINGS_PATHS.brand);
}

export async function setFeatureFlagAction(formData: FormData) {
  const supabase = await requireAdmin(SETTINGS_PATHS.features);
  const parsed = featureFlagSchema.safeParse({
    code: String(formData.get("code") ?? ""),
    enabled: String(formData.get("enabled") ?? ""),
  });
  if (!parsed.success) {
    return;
  }
  await supabase.rpc("admin_set_feature_flag", {
    p_code: parsed.data.code,
    p_enabled: parsed.data.enabled === "true",
  });
  revalidatePath(SETTINGS_PATHS.features);
}

export async function setCurrencyEnabledAction(formData: FormData) {
  const supabase = await requireAdmin(SETTINGS_PATHS.currencies);
  const parsed = currencyEnabledSchema.safeParse({
    code: String(formData.get("code") ?? ""),
    enabled: String(formData.get("enabled") ?? ""),
  });
  if (!parsed.success) {
    return;
  }
  await supabase.rpc("admin_set_currency_enabled", {
    p_code: parsed.data.code,
    p_enabled: parsed.data.enabled === "true",
  });
  revalidatePath(SETTINGS_PATHS.currencies);
}

export async function setCountryEnabledAction(formData: FormData) {
  const supabase = await requireAdmin(SETTINGS_PATHS.localization);
  const parsed = countryEnabledSchema.safeParse({
    code: String(formData.get("code") ?? ""),
    enabled: String(formData.get("enabled") ?? ""),
  });
  if (!parsed.success) {
    return;
  }
  await supabase.rpc("admin_set_country_enabled", {
    p_code: parsed.data.code.toUpperCase(),
    p_enabled: parsed.data.enabled === "true",
  });
  revalidatePath(SETTINGS_PATHS.localization);
}

export async function setLanguageEnabledAction(formData: FormData) {
  const supabase = await requireAdmin(SETTINGS_PATHS.localization);
  const parsed = languageEnabledSchema.safeParse({
    code: String(formData.get("code") ?? ""),
    enabled: String(formData.get("enabled") ?? ""),
  });
  if (!parsed.success) {
    return;
  }
  await supabase.rpc("admin_set_language_enabled", {
    p_code: parsed.data.code,
    p_enabled: parsed.data.enabled === "true",
  });
  revalidatePath(SETTINGS_PATHS.localization);
}

export async function setIntegrationStateAction(formData: FormData) {
  const supabase = await requireAdmin(INTEGRATION_PATHS.admin);
  const parsed = integrationStateSchema.safeParse({
    code: String(formData.get("code") ?? ""),
    state: String(formData.get("state") ?? ""),
  });
  if (!parsed.success) {
    return;
  }
  await supabase.rpc("admin_set_integration_state", {
    p_code: parsed.data.code,
    p_state: parsed.data.state,
  });
  revalidatePath(INTEGRATION_PATHS.admin);
  revalidatePath(INTEGRATION_PATHS.detail(parsed.data.code));
}

export async function upsertAutomationRuleAction(
  _prev: SettingsFormState,
  formData: FormData,
): Promise<SettingsFormState> {
  const supabase = await requireAdmin(AUTOMATION_PATHS.admin);
  const parsed = automationRuleSchema.safeParse({
    publicId: String(formData.get("publicId") ?? ""),
    name: String(formData.get("name") ?? ""),
    eventType: String(formData.get("eventType") ?? ""),
    actionType: String(formData.get("actionType") ?? ""),
    title: String(formData.get("title") ?? ""),
    body: String(formData.get("body") ?? ""),
    enabled: String(formData.get("enabled") ?? "false"),
  });
  if (!parsed.success) {
    return { error: firstZodError(parsed.error) ?? "Invalid automation rule." };
  }
  const { data, error } = await supabase.rpc("admin_upsert_automation_rule", {
    p_public_id: parsed.data.publicId || "",
    p_name: parsed.data.name,
    p_event_type: parsed.data.eventType,
    p_action_type: parsed.data.actionType,
    p_title: parsed.data.title || parsed.data.name,
    p_body: parsed.data.body || "A platform event was recorded.",
    p_enabled: parsed.data.enabled === "true",
  });
  if (error || !data || typeof data !== "object" || !("public_id" in data)) {
    return { error: mapError(error?.message) };
  }
  revalidatePath(AUTOMATION_PATHS.admin);
  redirect(AUTOMATION_PATHS.adminDetail(String((data as { public_id: string }).public_id)));
}

export async function upsertIncidentAction(
  _prev: SettingsFormState,
  formData: FormData,
): Promise<SettingsFormState> {
  const supabase = await requireAdmin(INTEGRATION_PATHS.incidents);
  const parsed = incidentSchema.safeParse({
    publicId: String(formData.get("publicId") ?? ""),
    title: String(formData.get("title") ?? ""),
    severity: String(formData.get("severity") ?? ""),
    status: String(formData.get("status") ?? ""),
    affectedModule: String(formData.get("affectedModule") ?? ""),
    description: String(formData.get("description") ?? ""),
  });
  if (!parsed.success) {
    return { error: firstZodError(parsed.error) ?? "Invalid incident." };
  }
  const { data, error } = await supabase.rpc("admin_upsert_incident", {
    p_public_id: parsed.data.publicId || "",
    p_title: parsed.data.title,
    p_severity: parsed.data.severity,
    p_status: parsed.data.status,
    p_affected_module: parsed.data.affectedModule,
    p_description: parsed.data.description || "",
    p_resolved_at: undefined as unknown as string,
  });
  if (error || !data || typeof data !== "object" || !("public_id" in data)) {
    return { error: mapError(error?.message) };
  }
  revalidatePath(INTEGRATION_PATHS.incidents);
  redirect(INTEGRATION_PATHS.incident(String((data as { public_id: string }).public_id)));
}

export async function createReleaseAction(
  _prev: SettingsFormState,
  formData: FormData,
): Promise<SettingsFormState> {
  const supabase = await requireAdmin(INTEGRATION_PATHS.releases);
  const parsed = releaseSchema.safeParse({
    versionName: String(formData.get("versionName") ?? ""),
    environmentLabel: String(formData.get("environmentLabel") ?? ""),
    commitReference: String(formData.get("commitReference") ?? ""),
    notes: String(formData.get("notes") ?? ""),
  });
  if (!parsed.success) {
    return { error: firstZodError(parsed.error) ?? "Invalid release record." };
  }
  const { error } = await supabase.rpc("admin_create_release_record", {
    p_version_name: parsed.data.versionName,
    p_environment_label: parsed.data.environmentLabel,
    p_commit_reference: parsed.data.commitReference || "",
    p_notes: parsed.data.notes || "",
    p_released_at: undefined as unknown as string,
  });
  if (error) {
    return { error: mapError(error.message) };
  }
  revalidatePath(INTEGRATION_PATHS.releases);
  redirect(INTEGRATION_PATHS.releases);
}

export async function createImportBatchAction(
  _prev: SettingsFormState,
  formData: FormData,
): Promise<SettingsFormState> {
  const supabase = await requireAdmin(INTEGRATION_PATHS.imports);
  const parsed = importBatchSchema.safeParse({
    importType: String(formData.get("importType") ?? ""),
    filename: String(formData.get("filename") ?? ""),
    rowsJson: String(formData.get("rowsJson") ?? "[]"),
  });
  if (!parsed.success) {
    return { error: firstZodError(parsed.error) ?? "Invalid import." };
  }
  let rows: unknown;
  try {
    rows = JSON.parse(parsed.data.rowsJson);
  } catch {
    return { error: "Rows must be valid JSON." };
  }
  if (!Array.isArray(rows)) {
    return { error: "Rows must be a JSON array." };
  }
  const { data, error } = await supabase.rpc("admin_create_import_batch", {
    p_import_type: parsed.data.importType,
    p_filename: parsed.data.filename || "",
    p_rows: rows as never,
  });
  if (error || !data || typeof data !== "object" || !("public_id" in data)) {
    return { error: mapError(error?.message) };
  }
  revalidatePath(INTEGRATION_PATHS.imports);
  redirect(INTEGRATION_PATHS.importDetail(String((data as { public_id: string }).public_id)));
}

export async function reviewImportBatchAction(formData: FormData) {
  const supabase = await requireAdmin(INTEGRATION_PATHS.imports);
  const parsed = importReviewSchema.safeParse({
    publicId: String(formData.get("publicId") ?? ""),
    decision: String(formData.get("decision") ?? ""),
  });
  if (!parsed.success) {
    return;
  }
  await supabase.rpc("admin_review_import_batch", {
    p_public_id: parsed.data.publicId,
    p_decision: parsed.data.decision,
  });
  revalidatePath(INTEGRATION_PATHS.importDetail(parsed.data.publicId));
}
