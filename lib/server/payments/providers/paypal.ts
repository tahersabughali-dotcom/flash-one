import type { PaymentProviderAdapter } from "@/modules/payment-providers";
import { envPresent } from "@/modules/payment-providers";

export const paypalAdapter: PaymentProviderAdapter = {
  code: "paypal",
  displayName: "PayPal",
  capabilities: {
    checkout: true,
    webhook: true,
    refund: true,
    payout: false,
  },
  isConfigured() {
    return envPresent("PAYPAL_CLIENT_ID") && envPresent("PAYPAL_CLIENT_SECRET");
  },
  isCheckoutReady() {
    return this.isConfigured();
  },
  async createCheckout() {
    if (!this.isConfigured()) {
      return {
        kind: "unavailable",
        message: "PayPal requires setup. Credentials are not present.",
      };
    }
    return {
      kind: "unavailable",
      message: "PayPal checkout is not enabled without verified credentials and official API wiring.",
    };
  },
  async verifyWebhook() {
    if (!envPresent("PAYPAL_WEBHOOK_ID") || !this.isConfigured()) {
      return null;
    }
    return null;
  },
  async createRefund() {
    if (!this.isConfigured()) {
      return {
        kind: "unavailable",
        message: "PayPal refund requires setup. No provider refund was executed.",
      };
    }
    return {
      kind: "requires_provider_confirmation",
      message: "Provider refund confirmation is required before claiming a PayPal-executed refund.",
    };
  },
};
