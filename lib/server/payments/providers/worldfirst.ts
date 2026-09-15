import type { PaymentProviderAdapter } from "@/modules/payment-providers";
import { envPresent } from "@/modules/payment-providers";

export const worldfirstAdapter: PaymentProviderAdapter = {
  code: "worldfirst",
  displayName: "WorldFirst",
  isConfigured() {
    return envPresent("WORLDFIRST_API_TOKEN");
  },
  isCheckoutReady() {
    return false;
  },
  async createCheckout() {
    return {
      kind: "unavailable",
      message: "WorldFirst is not available for checkout.",
    };
  },
};
