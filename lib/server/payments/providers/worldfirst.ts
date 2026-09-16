import type { PaymentProviderAdapter } from "@/modules/payment-providers";
import { envPresent } from "@/modules/payment-providers";

export const worldfirstAdapter: PaymentProviderAdapter = {
  code: "worldfirst",
  displayName: "WorldFirst",
  capabilities: {
    checkout: false,
    webhook: false,
    refund: false,
    payout: false,
    business_only: true,
  },
  isConfigured() {
    return envPresent("WORLDFIRST_API_TOKEN");
  },
  isCheckoutReady() {
    return false;
  },
  async createCheckout() {
    return {
      kind: "unavailable",
      message: "WorldFirst remains business-eligibility dependent. API features are not assumed.",
    };
  },
  async createRefund() {
    return {
      kind: "unavailable",
      message: "WorldFirst refund capability is not verified.",
    };
  },
};
