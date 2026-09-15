import { createSessionSupabaseClient } from "@/lib/supabase/server";
import { asMinor } from "@/modules/invoices/money";
import {
  ATTEMPT_STATUSES,
  PAYMENT_REQUEST_STATUSES,
  type AttemptStatus,
  type PaymentRequestStatus,
} from "@/modules/payment-requests";
import {
  PAYMENT_PROVIDER_CODES,
  PROVIDER_OPERATIONAL_STATES,
  type PaymentProviderCode,
  type ProviderOperationalState,
} from "@/modules/payment-providers";
import { getProviderAdapter } from "./providers";

export type PaymentRequestSummary = {
  id: string;
  publicId: string;
  status: PaymentRequestStatus;
  currency: string;
  amountMode: string;
  requestedAmountMinor: number | null;
  serviceCode: string | null;
  description: string | null;
  invoiceId: string | null;
  guestEmail: string | null;
  createdAt: string;
};

export type PaymentAttemptSummary = {
  id: string;
  publicId: string;
  provider: string;
  status: AttemptStatus;
  currency: string;
  amountMinor: number;
  reviewReason: string | null;
  createdAt: string;
};

export type ProviderAdminRow = {
  code: PaymentProviderCode;
  displayName: string;
  operationalState: ProviderOperationalState;
  eligibility: string;
  capabilities: Record<string, unknown>;
  supportedCurrencies: string[];
  notes: string | null;
  secretsConfigured: boolean;
  checkoutReady: boolean;
};

function isRequestStatus(value: string): value is PaymentRequestStatus {
  return (PAYMENT_REQUEST_STATUSES as readonly string[]).includes(value);
}

function isAttemptStatus(value: string): value is AttemptStatus {
  return (ATTEMPT_STATUSES as readonly string[]).includes(value);
}

function isProviderCode(value: string): value is PaymentProviderCode {
  return (PAYMENT_PROVIDER_CODES as readonly string[]).includes(value);
}

function isOperationalState(value: string): value is ProviderOperationalState {
  return (PROVIDER_OPERATIONAL_STATES as readonly string[]).includes(value);
}

export async function listPaymentRequests(): Promise<PaymentRequestSummary[]> {
  const supabase = await createSessionSupabaseClient();
  if (!supabase) {
    return [];
  }
  const { data } = await supabase
    .from("payment_requests")
    .select(
      "id, public_id, status, currency, amount_mode, requested_amount_minor, service_code, description, invoice_id, guest_email, created_at",
    )
    .order("created_at", { ascending: false });
  return (data ?? []).flatMap((row) => {
    if (!isRequestStatus(row.status)) {
      return [];
    }
    return [
      {
        id: row.id,
        publicId: row.public_id,
        status: row.status,
        currency: row.currency,
        amountMode: row.amount_mode,
        requestedAmountMinor:
          row.requested_amount_minor === null ? null : asMinor(row.requested_amount_minor),
        serviceCode: row.service_code,
        description: row.description,
        invoiceId: row.invoice_id,
        guestEmail: row.guest_email,
        createdAt: row.created_at,
      },
    ];
  });
}

export async function getPaymentRequestByPublicId(publicId: string) {
  const supabase = await createSessionSupabaseClient();
  if (!supabase) {
    return null;
  }
  const { data } = await supabase
    .from("payment_requests")
    .select(
      "id, public_id, status, currency, amount_mode, requested_amount_minor, min_amount_minor, max_amount_minor, service_code, service_snapshot, description, invoice_id, guest_email, guest_name, individual_user_id, organization_id, created_at, completed_at, expires_at",
    )
    .eq("public_id", publicId)
    .maybeSingle();
  if (!data || !isRequestStatus(data.status)) {
    return null;
  }
  return {
    id: data.id,
    publicId: data.public_id,
    status: data.status,
    currency: data.currency,
    amountMode: data.amount_mode,
    requestedAmountMinor:
      data.requested_amount_minor === null ? null : asMinor(data.requested_amount_minor),
    minAmountMinor: data.min_amount_minor === null ? null : asMinor(data.min_amount_minor),
    maxAmountMinor: data.max_amount_minor === null ? null : asMinor(data.max_amount_minor),
    serviceCode: data.service_code,
    serviceSnapshot: data.service_snapshot,
    description: data.description,
    invoiceId: data.invoice_id,
    guestEmail: data.guest_email,
    guestName: data.guest_name,
    individualUserId: data.individual_user_id,
    organizationId: data.organization_id,
    createdAt: data.created_at,
    completedAt: data.completed_at,
    expiresAt: data.expires_at,
  };
}

export async function listAttemptsForRequest(requestId: string): Promise<PaymentAttemptSummary[]> {
  const supabase = await createSessionSupabaseClient();
  if (!supabase) {
    return [];
  }
  const { data } = await supabase
    .from("payment_attempts")
    .select("id, public_id, provider, status, currency, amount_minor, review_reason, created_at")
    .eq("payment_request_id", requestId)
    .order("created_at", { ascending: false });
  return (data ?? []).flatMap((row) => {
    if (!isAttemptStatus(row.status)) {
      return [];
    }
    return [
      {
        id: row.id,
        publicId: row.public_id,
        provider: row.provider,
        status: row.status,
        currency: row.currency,
        amountMinor: asMinor(row.amount_minor),
        reviewReason: row.review_reason,
        createdAt: row.created_at,
      },
    ];
  });
}

export async function listProviderAdminRows(): Promise<ProviderAdminRow[]> {
  const supabase = await createSessionSupabaseClient();
  if (!supabase) {
    return [];
  }
  const { data } = await supabase
    .from("payment_providers")
    .select("code, display_name, operational_state, eligibility, capabilities, supported_currencies, notes")
    .order("display_name");
  return (data ?? []).flatMap((row) => {
    if (!isProviderCode(row.code) || !isOperationalState(row.operational_state)) {
      return [];
    }
    const adapter = getProviderAdapter(row.code);
    const secretsConfigured = adapter?.isConfigured() ?? false;
    return [
      {
        code: row.code,
        displayName: row.display_name,
        operationalState: row.operational_state,
        eligibility: row.eligibility,
        capabilities:
          row.capabilities && typeof row.capabilities === "object" && !Array.isArray(row.capabilities)
            ? (row.capabilities as Record<string, unknown>)
            : {},
        supportedCurrencies: row.supported_currencies ?? [],
        notes: row.notes,
        secretsConfigured,
        checkoutReady: adapter?.isCheckoutReady() ?? false,
      },
    ];
  });
}

export async function listRecentProviderEvents() {
  const supabase = await createSessionSupabaseClient();
  if (!supabase) {
    return [];
  }
  const { data } = await supabase
    .from("payment_provider_events")
    .select("provider, external_event_id, event_type, processing_status, received_at, error_state")
    .order("received_at", { ascending: false })
    .limit(20);
  return data ?? [];
}
