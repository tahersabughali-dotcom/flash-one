import { NextResponse } from "next/server";
import { createServerDatabaseClient } from "@/lib/server/database/client";
import { getProviderAdapter } from "@/lib/server/payments/providers";

export function webhookErrorResponse(status: number) {
  return NextResponse.json({ ok: false }, { status });
}

export async function ingestVerifiedEvent(input: {
  ingestKey: string;
  provider: string;
  externalEventId: string;
  eventType: string;
  outcome: "succeeded" | "failed" | "cancelled";
  amountMinor: number;
  currency: string;
  providerReference: string;
}) {
  const supabase = createServerDatabaseClient();
  if (!supabase) {
    return webhookErrorResponse(503);
  }
  const { error } = await supabase.rpc("ingest_provider_event", {
    p_ingest_key: input.ingestKey,
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
