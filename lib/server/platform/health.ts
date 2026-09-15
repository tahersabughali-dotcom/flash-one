import { createSessionSupabaseClient } from "@/lib/supabase/server";
import { listProviderAdminRows } from "@/lib/server/payments/admin-queries";

export type OperationalHealth = {
  databaseConnected: boolean;
  failedAutomationCount: number;
  reviewRequiredPaymentCount: number;
  providers: Array<{
    code: string;
    configured: boolean;
    checkoutReady: boolean;
  }>;
  backupStatus: "deferred_production_launch_readiness";
};

export async function getOperationalHealth(): Promise<OperationalHealth> {
  const empty: OperationalHealth = {
    databaseConnected: false,
    failedAutomationCount: 0,
    reviewRequiredPaymentCount: 0,
    providers: [],
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

  const [{ count: failedAutomationCount }, { count: reviewRequiredPaymentCount }, providers] =
    await Promise.all([
      supabase
        .from("automation_runs")
        .select("*", { count: "exact", head: true })
        .eq("status", "failed"),
      supabase
        .from("payments")
        .select("*", { count: "exact", head: true })
        .eq("status", "review_required"),
      listProviderAdminRows(),
    ]);

  return {
    databaseConnected: true,
    failedAutomationCount: failedAutomationCount ?? 0,
    reviewRequiredPaymentCount: reviewRequiredPaymentCount ?? 0,
    providers: providers.map((provider) => ({
      code: provider.code,
      configured: provider.secretsConfigured,
      checkoutReady: provider.checkoutReady,
    })),
    backupStatus: "deferred_production_launch_readiness",
  };
}
