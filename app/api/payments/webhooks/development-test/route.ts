import { NextResponse } from "next/server";
import { webhookErrorResponse } from "@/lib/server/payments/webhooks";

/**
 * Public development-test webhook is not a payment-proof channel.
 * Synthetic confirmation runs only through the trusted server checkout path.
 */
export function POST() {
  return webhookErrorResponse(404);
}

export function GET() {
  return NextResponse.json({ ok: false }, { status: 405 });
}
