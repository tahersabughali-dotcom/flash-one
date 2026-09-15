import { NextResponse } from "next/server";
import { stripeAdapter } from "@/lib/server/payments/providers/stripe";
import { ingestVerifiedEvent, webhookErrorResponse } from "@/lib/server/payments/webhooks";

export async function POST(request: Request) {
  const rawBody = await request.text();
  if (!stripeAdapter.isConfigured()) {
    return webhookErrorResponse(503);
  }
  const verified = await stripeAdapter.verifyWebhook?.(request, rawBody);
  if (!verified) {
    return webhookErrorResponse(400);
  }
  if (!verified.attemptPublicId) {
    return webhookErrorResponse(400);
  }
  return ingestVerifiedEvent({
    attemptPublicId: verified.attemptPublicId,
    provider: "stripe",
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
