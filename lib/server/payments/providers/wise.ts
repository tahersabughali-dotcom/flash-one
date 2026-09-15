import type { PaymentProviderAdapter } from "@/modules/payment-providers";
import { envPresent } from "@/modules/payment-providers";

export const wiseAdapter: PaymentProviderAdapter = {
  code: "wise",
  displayName: "Wise",
  isConfigured() {
    return envPresent("WISE_API_TOKEN");
  },
  isCheckoutReady() {
    return false;
  },
  async createCheckout() {
    return {
      kind: "unavailable",
      message: "Wise collection is not verified for this account.",
    };
  },
};
