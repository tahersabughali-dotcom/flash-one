import type { PaymentProviderAdapter } from "@/modules/payment-providers";
import { envPresent } from "@/modules/payment-providers";

export const paypalAdapter: PaymentProviderAdapter = {
  code: "paypal",
  displayName: "PayPal",
  isConfigured() {
    return envPresent("PAYPAL_CLIENT_ID") && envPresent("PAYPAL_CLIENT_SECRET");
  },
  isCheckoutReady() {
    return this.isConfigured();
  },
  async createCheckout() {
    return {
      kind: "unavailable",
      message: "PayPal is not configured for this environment.",
    };
  },
  async verifyWebhook() {
    if (!envPresent("PAYPAL_WEBHOOK_ID") || !this.isConfigured()) {
      return null;
    }
    return null;
  },
};
