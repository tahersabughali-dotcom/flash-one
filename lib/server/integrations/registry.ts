import { createSessionSupabaseClient } from "@/lib/supabase/server";
import { envPresent } from "@/modules/payment-providers";
import { INTEGRATION_STATE_LABELS, type IntegrationState } from "@/modules/integrations";
import { getProviderAdapter } from "@/lib/server/payments/providers";

export type IntegrationView = {
  code: string;
  displayName: string;
  category: string;
  supported: boolean;
  catalogState: string;
  runtimeConfigured: boolean;
  displayState: IntegrationState | string;
  displayStateLabel: string;
  environmentLabel: string;
  capabilities: Record<string, boolean>;
  configurationRequirements: string;
  notes: string | null;
};

const ENV_BY_CODE: Record<string, readonly string[]> = {
  paypal: ["PAYPAL_CLIENT_ID", "PAYPAL_CLIENT_SECRET"],
  stripe: ["STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET"],
  wise: ["WISE_API_TOKEN"],
  worldfirst: ["WORLDFIRST_API_TOKEN"],
  usdt: ["USDT_TRON_ADDRESS", "USDT_ETHEREUM_ADDRESS"],
  openai: ["OPENAI_API_KEY"],
  anthropic: ["ANTHROPIC_API_KEY"],
  email: ["EMAIL_PROVIDER", "EMAIL_API_KEY", "EMAIL_FROM_ADDRESS"],
};

function runtimeConfigured(code: string): boolean {
  if (code === "openai" || code === "anthropic") {
    return (ENV_BY_CODE[code] ?? []).every((name) => envPresent(name));
  }
  if (code === "email") {
    return (ENV_BY_CODE.email ?? []).every((name) => envPresent(name));
  }
  const adapter = getProviderAdapter(code);
  if (adapter) {
    return adapter.isConfigured();
  }
  const names = ENV_BY_CODE[code];
  if (!names) {
    return false;
  }
  return names.every((name) => envPresent(name));
}

function displayState(
  catalogState: string,
  configured: boolean,
  code: string,
): string {
  if (code === "sms" || code === "whatsapp") {
    return "unavailable";
  }
  if (catalogState === "disabled" || catalogState === "maintenance") {
    return catalogState;
  }
  if (!configured) {
    return "configuration_required";
  }
  if (catalogState === "enabled") {
    return "enabled";
  }
  return "configured";
}

export async function listIntegrationViews(): Promise<IntegrationView[]> {
  const supabase = await createSessionSupabaseClient();
  if (!supabase) {
    return [];
  }
  const { data } = await supabase
    .from("integrations")
    .select(
      "code, display_name, category, supported, operational_state, environment_label, capabilities, configuration_requirements, notes",
    )
    .order("display_name");
  return (data ?? []).map((row) => {
    const configured = runtimeConfigured(String(row.code));
    const state = displayState(String(row.operational_state), configured, String(row.code));
    const caps =
      row.capabilities && typeof row.capabilities === "object" && !Array.isArray(row.capabilities)
        ? (row.capabilities as Record<string, boolean>)
        : {};
    return {
      code: String(row.code),
      displayName: String(row.display_name),
      category: String(row.category),
      supported: Boolean(row.supported),
      catalogState: String(row.operational_state),
      runtimeConfigured: configured,
      displayState: state,
      displayStateLabel:
        INTEGRATION_STATE_LABELS[state as IntegrationState] ??
        (state === "configured" ? "Configured" : state),
      environmentLabel: String(row.environment_label),
      capabilities: caps,
      configurationRequirements: String(row.configuration_requirements),
      notes: row.notes ? String(row.notes) : null,
    };
  });
}

export async function getIntegrationView(code: string): Promise<IntegrationView | null> {
  const rows = await listIntegrationViews();
  return rows.find((row) => row.code === code) ?? null;
}

export function isEmailProviderConfigured() {
  return (ENV_BY_CODE.email ?? []).every((name) => envPresent(name));
}

export function isAiProviderConfigured() {
  const developmentEnabled =
    process.env.NODE_ENV !== "production" &&
    process.env.FLASH_ONE_ENABLE_DEV_AI_PROVIDER === "true";
  if (developmentEnabled) {
    return true;
  }
  return envPresent("OPENAI_API_KEY") || envPresent("ANTHROPIC_API_KEY");
}
