export const INTEGRATION_PATHS = {
  admin: "/admin/integrations",
  detail: (code: string) => `/admin/integrations/${code}`,
  email: "/admin/email",
  imports: "/admin/imports",
  importNew: "/admin/imports/new",
  importDetail: (publicId: string) => `/admin/imports/${publicId}`,
  exports: "/admin/exports",
  incidents: "/admin/incidents",
  incidentNew: "/admin/incidents/new",
  incident: (publicId: string) => `/admin/incidents/${publicId}`,
  releases: "/admin/releases",
  releaseNew: "/admin/releases/new",
} as const;

export const INTEGRATION_STATES = [
  "supported",
  "configured",
  "enabled",
  "disabled",
  "configuration_required",
  "maintenance",
  "unavailable",
] as const;

export type IntegrationState = (typeof INTEGRATION_STATES)[number];

export const INTEGRATION_STATE_LABELS: Record<IntegrationState, string> = {
  supported: "Supported",
  configured: "Configured",
  enabled: "Enabled",
  disabled: "Disabled",
  configuration_required: "Requires setup",
  maintenance: "Maintenance",
  unavailable: "Unavailable",
};

export const INTEGRATION_CATEGORIES = [
  "payment",
  "ai",
  "email",
  "communication",
  "other",
] as const;

export type IntegrationCategory = (typeof INTEGRATION_CATEGORIES)[number];

export const CAPABILITY_LABELS: Record<string, string> = {
  checkout: "Checkout",
  webhook: "Webhook",
  refund: "Refund",
  payout: "Payout",
  balance: "Balance",
  transaction_import: "Transaction import",
  crypto_reference: "Crypto reference",
  business_only: "Business only",
  ai_chat: "AI chat",
  ai_structured_suggestion: "Structured suggestion",
  email_sending: "Email sending",
  email_receiving: "Email receiving",
  sms_sending: "SMS sending",
  whatsapp_sending: "WhatsApp sending",
};
