import { getOperationalHealth } from "@/lib/server/platform/health";
import {
  getCompanySettings,
  getBrandSettings,
  listLegalDrafts,
} from "@/lib/server/platform/settings-queries";
import { envPresent } from "@/modules/payment-providers";

export type ReadinessStatus =
  | "ready"
  | "requires_configuration"
  | "requires_owner_data"
  | "deferred"
  | "not_verified";

export type ReadinessItem = {
  id: string;
  category: string;
  label: string;
  status: ReadinessStatus;
  detail: string;
};

export const READINESS_STATUS_LABELS: Record<ReadinessStatus, string> = {
  ready: "Ready",
  requires_configuration: "Requires configuration",
  requires_owner_data: "Requires owner data",
  deferred: "Deferred",
  not_verified: "Not verified",
};

function blank(value: string | null | undefined) {
  return !value || !String(value).trim();
}

export async function getLaunchReadiness(): Promise<ReadinessItem[]> {
  const [health, company, legalDrafts, brand] = await Promise.all([
    getOperationalHealth(),
    getCompanySettings(),
    listLegalDrafts(),
    getBrandSettings(),
  ]);
  const legalByKind = Object.fromEntries(
    (legalDrafts ?? []).map((draft) => [draft.document_kind, draft]),
  );

  const items: ReadinessItem[] = [
    {
      id: "application",
      category: "Application",
      label: "Application build",
      status: "ready",
      detail: "V1 application code is present in the repository.",
    },
    {
      id: "database",
      category: "Database",
      label: "Database connectivity",
      status: health.databaseConnected ? "ready" : "requires_configuration",
      detail: health.databaseConnected
        ? "Session can reach the database."
        : "Database connection is not available from this environment.",
    },
    {
      id: "migration-history",
      category: "Database",
      label: "Migration history (F-MIG-001)",
      status: "not_verified",
      detail:
        "OPEN PRODUCTION BLOCKER. Local canonical migrations and remote Development schema_migrations diverge (fragmented remote versions from MCP applies). Must resolve with a reproducible Production migration strategy before go-live. Do not edit historical migrations or destroy Development.",
    },
    {
      id: "payment-runtime-env",
      category: "Payments",
      label: "Payment runtime environment",
      status: "deferred",
      detail:
        "Development database payment_runtime_settings.environment is development and development_test may be enabled. Production project must start with environment=production and development_test disabled. Do not treat Development state as Production-ready.",
    },
    {
      id: "payment-adapters",
      category: "Payments",
      label: "PayPal / Stripe adapter wiring",
      status: "requires_configuration",
      detail:
        "Adapters fail closed. Checkout/webhook event parsing remain incomplete without verified official API wiring and credentials. Signature helpers alone do not make providers ready.",
    },
    {
      id: "authentication",
      category: "Authentication",
      label: "Authentication",
      status: "ready",
      detail: "Auth code paths (login, register, recovery) exist. Mailbox E2E is not claimed.",
    },
    {
      id: "leaked-password",
      category: "Authentication",
      label: "Leaked-password protection",
      status: "requires_configuration",
      detail: "Plan/dashboard configuration item. Not upgraded in this build phase.",
    },
    {
      id: "company-details",
      category: "Company Details",
      label: "Company legal details",
      status:
        blank(company?.legal_company_name) || blank(company?.company_number)
          ? "requires_owner_data"
          : "ready",
      detail: blank(company?.legal_company_name)
        ? "Legal name and registration fields remain blank until verified owner data is supplied."
        : "Company settings contain values. Verify before Production.",
    },
    {
      id: "brand",
      category: "Company Details",
      label: "Brand",
      status: "ready",
      detail: `Brand Flash One · ${brand?.website ?? company?.website ?? "www.flashone.uk"} · official logo in repository.`,
    },
    {
      id: "legal-privacy",
      category: "Legal",
      label: "Privacy Policy",
      status:
        legalByKind.privacy?.status === "published" ? "not_verified" : "requires_owner_data",
      detail:
        legalByKind.privacy?.status === "published"
          ? "Draft marked published internally — verify before public exposure."
          : "Not configured. Public legal links stay hidden.",
    },
    {
      id: "legal-terms",
      category: "Legal",
      label: "Terms of Service",
      status: legalByKind.terms?.status === "published" ? "not_verified" : "requires_owner_data",
      detail:
        legalByKind.terms?.status === "published"
          ? "Draft marked published internally — verify before public exposure."
          : "Not configured. Public legal links stay hidden.",
    },
    {
      id: "legal-cookies",
      category: "Legal",
      label: "Cookie Policy",
      status: legalByKind.cookies?.status === "published" ? "not_verified" : "requires_owner_data",
      detail:
        legalByKind.cookies?.status === "published"
          ? "Draft marked published internally — verify before public exposure."
          : "Not configured. Public legal links stay hidden.",
    },
    {
      id: "payments-paypal",
      category: "Payments",
      label: "PayPal",
      status:
        envPresent("PAYPAL_CLIENT_ID") && envPresent("PAYPAL_CLIENT_SECRET")
          ? "not_verified"
          : "requires_configuration",
      detail:
        envPresent("PAYPAL_CLIENT_ID") && envPresent("PAYPAL_CLIENT_SECRET")
          ? "Credentials present (values hidden). Live checkout not auto-verified."
          : "PayPal credentials missing.",
    },
    {
      id: "payments-stripe",
      category: "Payments",
      label: "Stripe",
      status:
        envPresent("STRIPE_SECRET_KEY") && envPresent("STRIPE_WEBHOOK_SECRET")
          ? "not_verified"
          : "requires_configuration",
      detail:
        envPresent("STRIPE_SECRET_KEY") && envPresent("STRIPE_WEBHOOK_SECRET")
          ? "Credentials present (values hidden). Live checkout not auto-verified."
          : "Stripe credentials missing.",
    },
    {
      id: "payments-wise",
      category: "Payments",
      label: "Wise",
      status: envPresent("WISE_API_TOKEN") ? "not_verified" : "requires_configuration",
      detail: "Not a generic checkout provider. Adapter remains capability-truthful.",
    },
    {
      id: "payments-worldfirst",
      category: "Payments",
      label: "WorldFirst",
      status: envPresent("WORLDFIRST_API_TOKEN") ? "not_verified" : "requires_configuration",
      detail: "Not a generic checkout provider. Adapter remains capability-truthful.",
    },
    {
      id: "payments-usdt",
      category: "Payments",
      label: "USDT",
      status: "deferred",
      detail:
        "Configuration/UI only. No wallet private keys, seed phrases, or automatic blockchain acceptance.",
    },
    {
      id: "ai",
      category: "AI",
      label: "AI provider",
      status: health.aiConfigured ? "not_verified" : "requires_configuration",
      detail: health.aiConfigured
        ? "An AI provider env is present. Live quality not auto-verified."
        : "OPENAI_API_KEY / ANTHROPIC_API_KEY not configured.",
    },
    {
      id: "email",
      category: "Email",
      label: "Transactional email",
      status: health.emailConfigured ? "not_verified" : "requires_configuration",
      detail: health.emailConfigured
        ? "Email env present. Live sending remains disabled until launch hardening."
        : "EMAIL_PROVIDER / EMAIL_API_KEY / EMAIL_FROM_ADDRESS missing.",
    },
    {
      id: "files-malware",
      category: "Files/Malware",
      label: "Malware scanning",
      status: "requires_configuration",
      detail:
        "Scanner foundation exists (not_scanned / pending / clean / rejected / unavailable). Without a scanner, status stays unavailable or not_scanned — never falsely clean.",
    },
    {
      id: "backups",
      category: "Backups",
      label: "Backups / PITR",
      status: "deferred",
      detail: `backup=${health.backupConfigured}; pitr=${health.pitrConfigured}; last verified restore=${health.lastVerifiedRestore}. Unknown until Production infrastructure exists.`,
    },
    {
      id: "production",
      category: "Production",
      label: "Production environment",
      status: "not_verified",
      detail: "Production remains false / not ready until explicit owner approval and go-live.",
    },
    {
      id: "domain",
      category: "Domain",
      label: "Domain / DNS",
      status: "requires_owner_data",
      detail: "Domain and DNS cutover are owner/Production tasks.",
    },
    {
      id: "testing",
      category: "Testing",
      label: "Final audit / testing",
      status: "deferred",
      detail: "Final forensic audit and E2E tests are after V1 build completion.",
    },
  ];

  return items;
}
