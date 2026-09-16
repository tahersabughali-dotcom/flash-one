import type { PaymentProviderAdapter } from "@/modules/payment-providers";
import { envPresent } from "@/modules/payment-providers";

export const developmentTestAdapter: PaymentProviderAdapter = {
  code: "development_test",
  displayName: "Development test",
  capabilities: {
    checkout: true,
    webhook: false,
    refund: false,
    payout: false,
  },
  isConfigured() {
    return (
      process.env.NODE_ENV !== "production" &&
      envPresent("FLASH_ONE_ENABLE_DEV_PAYMENT_PROVIDER") &&
      process.env.FLASH_ONE_ENABLE_DEV_PAYMENT_PROVIDER === "true"
    );
  },
  isCheckoutReady() {
    return this.isConfigured();
  },
  async createCheckout() {
    if (!this.isCheckoutReady()) {
      return {
        kind: "unavailable",
        message: "Development test payments are not enabled.",
      };
    }
    return { kind: "internal_confirm" };
  },
  async createRefund() {
    return {
      kind: "unavailable",
      message: "Development test refunds are not enabled automatically.",
    };
  },
};
