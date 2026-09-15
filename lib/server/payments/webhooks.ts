import { NextResponse } from "next/server";
import { createPrivilegedPaymentIngestClient } from "@/lib/server/payments/privileged-ingest";
import { getProviderAdapter } from "@/lib/server/payments/providers";

export function webhookErrorResponse(status: number) {
  return NextResponse.json({ ok: false }, { status });
}

/**
 * Ingest a provider event that has already been authenticated by a
 * server-side adapter (signature verification). Never call this with
 * browser-supplied proof.
 */
export async function ingestVerifiedEvent(input: {
  attemptPublicId: string;
  provider: string;
  externalEventId: string;
  eventType: string;
  outcome: "succeeded" | "failed" | "cancelled";
  amountMinor: number;
  currency: string;
  providerReference: string;
}) {
  const supabase = createPrivilegedPaymentIngestClient();
  if (!supabase) {
    return webhookErrorResponse(503);
  }
  const { error } = await supabase.rpc("ingest_verified_provider_event", {
    p_attempt_public_id: input.attemptPublicId,
    p_provider: input.provider,
    p_external_event_id: input.externalEventId,
    p_event_type: input.eventType,
    p_outcome: input.outcome,
    p_amount_minor: input.amountMinor,
    p_currency: input.currency,
    p_provider_reference: input.providerReference,
  });
  if (error) {
    return webhookErrorResponse(400);
  }
  return NextResponse.json({ ok: true });
}

export function providerWebhookUnavailable(code: string) {
  const adapter = getProviderAdapter(code);
  return !adapter || !adapter.isConfigured();
}
