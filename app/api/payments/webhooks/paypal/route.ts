import { NextResponse } from "next/server";
import { paypalAdapter } from "@/lib/server/payments/providers/paypal";
import { ingestVerifiedEvent, webhookErrorResponse } from "@/lib/server/payments/webhooks";

export async function POST(request: Request) {
  const rawBody = await request.text();
  if (!paypalAdapter.isConfigured()) {
    return webhookErrorResponse(503);
  }
  const verified = await paypalAdapter.verifyWebhook?.(request, rawBody);
  if (!verified) {
    return webhookErrorResponse(400);
  }
  if (!verified.ingestKey) {
    return webhookErrorResponse(400);
  }
  return ingestVerifiedEvent({
    ingestKey: verified.ingestKey,
    provider: "paypal",
    externalEventId: verified.externalEventId,
    eventType: verified.eventType,
    outcome: verified.outcome,
    amountMinor: verified.amountMinor,
    currency: verified.currency,
    providerReference: verified.providerReference,
  });
}

export function GET() {
  return NextResponse.json({ ok: false }, { status: 405 });
}
