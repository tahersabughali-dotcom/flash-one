import type { PaymentProviderAdapter } from "@/modules/payment-providers";
import { envPresent } from "@/modules/payment-providers";

function readSecret(name: string): string | null {
  const value = process.env[name]?.trim();
  return value ? value : null;
}

async function hmacSha256Hex(secret: string, payload: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signed = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return Array.from(new Uint8Array(signed))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export const stripeAdapter: PaymentProviderAdapter = {
  code: "stripe",
  displayName: "Stripe",
  isConfigured() {
    return envPresent("STRIPE_SECRET_KEY") && envPresent("STRIPE_WEBHOOK_SECRET");
  },
  isCheckoutReady() {
    return this.isConfigured();
  },
  async createCheckout() {
    return {
      kind: "unavailable",
      message: "Stripe is not configured for this environment.",
    };
  },
  async verifyWebhook(request, rawBody) {
    const secret = readSecret("STRIPE_WEBHOOK_SECRET");
    const header = request.headers.get("stripe-signature");
    if (!secret || !header) {
      return null;
    }
    const parts = Object.fromEntries(
      header.split(",").map((part) => {
        const [key, ...rest] = part.split("=");
        return [key, rest.join("=")];
      }),
    );
    const timestamp = parts.t;
    const expected = parts.v1;
    if (!timestamp || !expected) {
      return null;
    }
    const actual = await hmacSha256Hex(secret, `${timestamp}.${rawBody}`);
    if (actual.length !== expected.length) {
      return null;
    }
    let mismatch = 0;
    for (let index = 0; index < actual.length; index += 1) {
      mismatch |= actual.charCodeAt(index) ^ expected.charCodeAt(index);
    }
    if (mismatch !== 0) {
      return null;
    }
    return null;
  },
};
