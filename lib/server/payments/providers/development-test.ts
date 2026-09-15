import type { PaymentProviderAdapter } from "@/modules/payment-providers";
import { envPresent } from "@/modules/payment-providers";

export const developmentTestAdapter: PaymentProviderAdapter = {
  code: "development_test",
  displayName: "Development test",
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
};
