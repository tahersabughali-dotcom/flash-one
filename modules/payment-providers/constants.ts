export const PAYMENT_PROVIDER_CODES = [
  "paypal",
  "stripe",
  "wise",
  "worldfirst",
  "usdt",
  "development_test",
] as const;

export type PaymentProviderCode = (typeof PAYMENT_PROVIDER_CODES)[number];

export const PAYMENT_PROVIDER_LABELS: Record<PaymentProviderCode, string> = {
  paypal: "PayPal",
  stripe: "Stripe",
  wise: "Wise",
  worldfirst: "WorldFirst",
  usdt: "USDT",
  development_test: "Development test",
};

export const PROVIDER_OPERATIONAL_STATES = [
  "enabled",
  "maintenance",
  "disabled",
  "configuration_required",
] as const;

export type ProviderOperationalState = (typeof PROVIDER_OPERATIONAL_STATES)[number];

export const PROVIDER_ENV_NAMES: Record<PaymentProviderCode, readonly string[]> = {
  paypal: ["PAYPAL_CLIENT_ID", "PAYPAL_CLIENT_SECRET", "PAYPAL_WEBHOOK_ID", "PAYPAL_MODE"],
  stripe: ["STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET"],
  wise: ["WISE_API_TOKEN"],
  worldfirst: ["WORLDFIRST_API_TOKEN"],
  usdt: ["USDT_TRON_ADDRESS", "USDT_ETHEREUM_ADDRESS"],
  development_test: ["FLASH_ONE_ENABLE_DEV_PAYMENT_PROVIDER"],
};

export function envPresent(name: string): boolean {
  return Boolean(process.env[name]?.trim());
}
