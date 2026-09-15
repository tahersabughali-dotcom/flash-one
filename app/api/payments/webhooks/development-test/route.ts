import { NextResponse } from "next/server";
import { developmentTestAdapter } from "@/lib/server/payments/providers/development-test";
import { ingestVerifiedEvent, webhookErrorResponse } from "@/lib/server/payments/webhooks";

export async function POST(request: Request) {
  if (!developmentTestAdapter.isCheckoutReady()) {
    return webhookErrorResponse(404);
  }
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return webhookErrorResponse(400);
  }
  const ingestKey = String(body.ingest_key ?? "");
  const externalEventId = String(body.external_event_id ?? "");
  const outcome = String(body.outcome ?? "");
  const amountMinor = Number(body.amount_minor ?? 0);
  const currency = String(body.currency ?? "");
  if (!ingestKey || !externalEventId || !Number.isSafeInteger(amountMinor) || amountMinor <= 0) {
    return webhookErrorResponse(400);
  }
  if (outcome !== "succeeded" && outcome !== "failed" && outcome !== "cancelled") {
    return webhookErrorResponse(400);
  }
  return ingestVerifiedEvent({
    ingestKey,
    provider: "development_test",
    externalEventId,
    eventType: "development.synthetic",
    outcome,
    amountMinor,
    currency,
    providerReference: String(body.provider_reference ?? externalEventId),
  });
}

export function GET() {
  return NextResponse.json({ ok: false }, { status: 405 });
}
