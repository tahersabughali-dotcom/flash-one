import { cookies } from "next/headers";
import { createSessionSupabaseClient } from "@/lib/supabase/server";
import { createServerDatabaseClient } from "@/lib/server/database/client";
import { getProviderAdapter } from "./providers";
import { parseMajorToMinor } from "@/modules/invoices/money";
import { PAYMENT_REQUEST_PATHS } from "@/modules/payment-requests";

type JsonMap = Record<string, unknown>;

function asClient() {
  return createServerDatabaseClient();
}

export async function getCheckoutClient() {
  return (await createSessionSupabaseClient()) ?? asClient();
}

export function ingestCookieName(attemptPublicId: string) {
  return `fo_pay_ingest_${attemptPublicId}`;
}

export async function storeIngestKey(attemptPublicId: string, ingestKey: string) {
  const store = await cookies();
  store.set(ingestCookieName(attemptPublicId), ingestKey, {
    httpOnly: true,
    sameSite: "lax",
    path: "/pay",
    maxAge: 60 * 60,
    secure: false,
  });
}

export async function readIngestKey(attemptPublicId: string) {
  const store = await cookies();
  return store.get(ingestCookieName(attemptPublicId))?.value ?? null;
}

export async function listCheckoutProviders() {
  const supabase = await getCheckoutClient();
  if (!supabase) {
    return [];
  }
  const { data } = await supabase.rpc("public_list_checkout_providers");
  const rows = Array.isArray(data) ? data : [];
  return rows.flatMap((row) => {
    if (!row || typeof row !== "object") {
      return [];
    }
    const item = row as JsonMap;
    const code = String(item.code ?? "");
    const adapter = getProviderAdapter(code);
    if (!adapter?.isCheckoutReady()) {
      if (code === "development_test") {
        return [];
      }
      return [];
    }
    return [
      {
        code,
        displayName: String(item.display_name ?? adapter.displayName),
        businessOnly: Boolean(item.business_only),
      },
    ];
  });
}

export async function getPublicPaymentRequest(publicId: string) {
  const supabase = await getCheckoutClient();
  if (!supabase) {
    return null;
  }
  const { data } = await supabase.rpc("public_get_payment_request", {
    p_public_id: publicId,
  });
  if (!data || typeof data !== "object") {
    return null;
  }
  return data as JsonMap;
}

export async function getPublicAttemptStatus(publicId: string) {
  const supabase = await getCheckoutClient();
  if (!supabase) {
    return null;
  }
  const { data } = await supabase.rpc("public_get_attempt_status", {
    p_public_id: publicId,
  });
  if (!data || typeof data !== "object") {
    return null;
  }
  return data as JsonMap;
}

export async function getPublicGuestReceipt(attemptPublicId: string, ingestKey: string) {
  const supabase = await getCheckoutClient();
  if (!supabase) {
    return null;
  }
  const { data } = await supabase.rpc("public_get_guest_receipt", {
    p_attempt_public_id: attemptPublicId,
    p_ingest_key: ingestKey,
  });
  if (!data || typeof data !== "object") {
    return null;
  }
  return data as JsonMap;
}

export async function startCheckout(input: {
  requestPublicId: string;
  provider: string;
  amountRaw?: string;
  guestName?: string;
  guestEmail?: string;
}) {
  const adapter = getProviderAdapter(input.provider);
  if (!adapter || !adapter.isCheckoutReady()) {
    return { error: "Payment method unavailable." };
  }
  let amountMinor: number | null = null;
  if (input.amountRaw?.trim()) {
    amountMinor = parseMajorToMinor(input.amountRaw);
    if (amountMinor === null) {
      return { error: "Enter a valid amount." };
    }
  }
  const supabase = await getCheckoutClient();
  if (!supabase) {
    return { error: "Payment could not be started." };
  }
  const { data, error } = await supabase.rpc("create_payment_attempt", {
    p_request_public_id: input.requestPublicId,
    p_provider: input.provider,
    p_amount_minor: amountMinor ?? 0,
    p_guest_name: input.guestName ?? "",
    p_guest_email: input.guestEmail ?? "",
  });
  if (error || !data || typeof data !== "object") {
    return { error: mapPayError(error?.message ?? "") };
  }
  const created = data as JsonMap;
  const attemptPublicId = String(created.public_id ?? "");
  const ingestKey = String(created.ingest_key ?? "");
  if (!attemptPublicId || !ingestKey) {
    return { error: "Payment could not be started." };
  }
  await storeIngestKey(attemptPublicId, ingestKey);
  const checkout = await adapter.createCheckout({
    attemptPublicId,
    amountMinor: Number(created.amount_minor ?? 0),
    currency: String(created.currency ?? "GBP"),
    description: "Flash One payment",
    returnPath: PAYMENT_REQUEST_PATHS.payResult(attemptPublicId),
    cancelPath: PAYMENT_REQUEST_PATHS.payResult(attemptPublicId),
    ingestKey,
  });
  if (checkout.kind === "unavailable") {
    return { error: checkout.message };
  }
  if (checkout.kind === "internal_confirm") {
    const eventId = `dev-${attemptPublicId}-${Date.now()}`;
    const { data: ingested, error: ingestError } = await supabase.rpc(
      "ingest_provider_event",
      {
        p_ingest_key: ingestKey,
        p_provider: "development_test",
        p_external_event_id: eventId,
        p_event_type: "development.confirmed",
        p_outcome: "succeeded",
        p_amount_minor: Number(created.amount_minor ?? 0),
        p_currency: String(created.currency ?? "GBP"),
        p_provider_reference: eventId,
      },
    );
    if (ingestError) {
      return { error: mapPayError(ingestError.message) };
    }
    void ingested;
    return { redirectTo: PAYMENT_REQUEST_PATHS.payResult(attemptPublicId) };
  }
  return { redirectTo: checkout.url };
}

export function mapPayError(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("unavailable") || lower.includes("not active") || lower.includes("expired")) {
    return "Payment method unavailable.";
  }
  if (lower.includes("could not be started") || lower.includes("not found")) {
    return "Payment could not be started.";
  }
  if (lower.includes("invalid payment amount") || lower.includes("invoice")) {
    return "Payment could not be started.";
  }
  return "Payment could not be started.";
}
