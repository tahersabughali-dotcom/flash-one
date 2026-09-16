import { createSessionSupabaseClient } from "@/lib/supabase/server";
import { listProviderAdminRows } from "@/lib/server/payments/admin-queries";
import {
  isAiProviderConfigured,
  isEmailProviderConfigured,
  listIntegrationViews,
} from "@/lib/server/integrations/registry";
import { getBackupReadiness } from "@/lib/server/platform/settings-queries";

export type OperationalHealth = {
  databaseConnected: boolean;
  failedAutomationCount: number;
  reviewRequiredPaymentCount: number;
  providers: Array<{
    code: string;
    configured: boolean;
    checkoutReady: boolean;
  }>;
  aiConfigured: boolean;
  emailConfigured: boolean;
  paymentProvidersConfiguredCount: number;
  integrations: Array<{ code: string; displayState: string; displayStateLabel: string }>;
  backupConfigured: string;
  pitrConfigured: string;
  lastVerifiedRestore: string;
  productionEnvironment: string;
  backupStatus: "deferred_production_launch_readiness";
};

export async function getOperationalHealth(): Promise<OperationalHealth> {
  const empty: OperationalHealth = {
    databaseConnected: false,
    failedAutomationCount: 0,
    reviewRequiredPaymentCount: 0,
    providers: [],
    aiConfigured: false,
    emailConfigured: false,
    paymentProvidersConfiguredCount: 0,
    integrations: [],
    backupConfigured: "unknown",
    pitrConfigured: "unknown",
    lastVerifiedRestore: "unknown",
    productionEnvironment: "false",
    backupStatus: "deferred_production_launch_readiness",
  };
  const supabase = await createSessionSupabaseClient();
  if (!supabase) {
    return empty;
  }

  const { error: dbError } = await supabase
    .from("payment_providers")
    .select("code", { count: "exact", head: true });
  if (dbError) {
    return empty;
  }

  const [
    { count: failedAutomationCount },
    { count: reviewRequiredPaymentCount },
    providers,
    integrations,
    backup,
  ] = await Promise.all([
    supabase
      .from("automation_runs")
      .select("*", { count: "exact", head: true })
      .eq("status", "failed"),
    supabase
      .from("payments")
      .select("*", { count: "exact", head: true })
      .eq("status", "review_required"),
    listProviderAdminRows(),
    listIntegrationViews(),
    getBackupReadiness(),
  ]);

  const paymentConfigured = providers.filter((provider) => provider.secretsConfigured).length;

  return {
    databaseConnected: true,
    failedAutomationCount: failedAutomationCount ?? 0,
    reviewRequiredPaymentCount: reviewRequiredPaymentCount ?? 0,
    providers: providers.map((provider) => ({
      code: provider.code,
      configured: provider.secretsConfigured,
      checkoutReady: provider.checkoutReady,
    })),
    aiConfigured: isAiProviderConfigured(),
    emailConfigured: isEmailProviderConfigured(),
    paymentProvidersConfiguredCount: paymentConfigured,
    integrations: integrations.map((row) => ({
      code: row.code,
      displayState: String(row.displayState),
      displayStateLabel: row.displayStateLabel,
    })),
    backupConfigured: backup?.backup_configured ? String(backup.backup_configured) : "unknown",
    pitrConfigured: backup?.pitr_configured ? String(backup.pitr_configured) : "unknown",
    lastVerifiedRestore: backup?.last_verified_restore
      ? String(backup.last_verified_restore)
      : "unknown",
    productionEnvironment: "false",
    backupStatus: "deferred_production_launch_readiness",
  };
}
