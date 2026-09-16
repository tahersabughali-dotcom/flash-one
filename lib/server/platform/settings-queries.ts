import { createSessionSupabaseClient } from "@/lib/supabase/server";
import { listRange } from "@/lib/server/pagination";

export async function getCompanySettings() {
  const supabase = await createSessionSupabaseClient();
  if (!supabase) return null;
  const { data } = await supabase.from("company_settings").select("*").eq("singleton", true).maybeSingle();
  return data;
}

export async function getBrandSettings() {
  const supabase = await createSessionSupabaseClient();
  if (!supabase) return null;
  const { data } = await supabase.from("brand_settings").select("*").eq("singleton", true).maybeSingle();
  return data;
}

export async function listPlatformCurrencies() {
  const supabase = await createSessionSupabaseClient();
  if (!supabase) return [];
  const { data } = await supabase.from("platform_currencies").select("*").order("display_order");
  return data ?? [];
}

export async function listPlatformCountries() {
  const supabase = await createSessionSupabaseClient();
  if (!supabase) return [];
  const { data } = await supabase.from("platform_countries").select("*").order("display_name");
  return data ?? [];
}

export async function listPlatformLanguages() {
  const supabase = await createSessionSupabaseClient();
  if (!supabase) return [];
  const { data } = await supabase.from("platform_languages").select("*").order("code");
  return data ?? [];
}

export async function listFeatureFlags() {
  const supabase = await createSessionSupabaseClient();
  if (!supabase) return [];
  const { data } = await supabase.from("feature_flags").select("*").order("code");
  return data ?? [];
}

export async function listPlatformSettings() {
  const supabase = await createSessionSupabaseClient();
  if (!supabase) return [];
  const { data } = await supabase.from("platform_setting_values").select("*").order("key");
  return data ?? [];
}

export async function getBackupReadiness() {
  const supabase = await createSessionSupabaseClient();
  if (!supabase) return null;
  const { data } = await supabase.from("backup_readiness").select("*").eq("singleton", true).maybeSingle();
  return data;
}

export async function listLegalDrafts() {
  const supabase = await createSessionSupabaseClient();
  if (!supabase) return [];
  const { data } = await supabase.from("legal_document_drafts").select("*").order("document_kind");
  return data ?? [];
}

export async function listNotificationChannels() {
  const supabase = await createSessionSupabaseClient();
  if (!supabase) return [];
  const { data } = await supabase.from("notification_channels").select("*").order("code");
  return data ?? [];
}

export async function listEmailMessages(page: number) {
  const supabase = await createSessionSupabaseClient();
  if (!supabase) return [];
  const { from, to } = listRange(page);
  const { data } = await supabase
    .from("email_messages")
    .select("public_id, template_code, subject, status, error_summary, created_at, recipient_email")
    .order("created_at", { ascending: false })
    .range(from, to);
  return data ?? [];
}

export async function listImportBatches(page: number) {
  const supabase = await createSessionSupabaseClient();
  if (!supabase) return [];
  const { from, to } = listRange(page);
  const { data } = await supabase
    .from("import_batches")
    .select("public_id, import_type, filename, status, review_state, row_count, error_count, created_at")
    .order("created_at", { ascending: false })
    .range(from, to);
  return data ?? [];
}

export async function getImportBatch(publicId: string) {
  const supabase = await createSessionSupabaseClient();
  if (!supabase) return null;
  const { data } = await supabase
    .from("import_batches")
    .select("*")
    .eq("public_id", publicId)
    .maybeSingle();
  if (!data) return null;
  const { data: rows } = await supabase
    .from("import_batch_rows")
    .select("row_number, validation_status, validation_error, raw_values")
    .eq("batch_id", data.id)
    .order("row_number")
    .limit(50);
  return { ...data, rows: rows ?? [] };
}

export async function listIncidents(page: number) {
  const supabase = await createSessionSupabaseClient();
  if (!supabase) return [];
  const { from, to } = listRange(page);
  const { data } = await supabase
    .from("incidents")
    .select("public_id, title, severity, status, affected_module, started_at, resolved_at")
    .order("started_at", { ascending: false })
    .range(from, to);
  return data ?? [];
}

export async function getIncident(publicId: string) {
  const supabase = await createSessionSupabaseClient();
  if (!supabase) return null;
  const { data } = await supabase.from("incidents").select("*").eq("public_id", publicId).maybeSingle();
  return data;
}

export async function listReleaseRecords(page: number) {
  const supabase = await createSessionSupabaseClient();
  if (!supabase) return [];
  const { from, to } = listRange(page);
  const { data } = await supabase
    .from("release_records")
    .select("public_id, version_name, environment_label, status, commit_reference, created_at, released_at")
    .order("created_at", { ascending: false })
    .range(from, to);
  return data ?? [];
}

export async function listUsdtNetworkSettings() {
  const supabase = await createSessionSupabaseClient();
  if (!supabase) return [];
  const { data } = await supabase.from("usdt_network_settings").select("*").order("network");
  return data ?? [];
}
