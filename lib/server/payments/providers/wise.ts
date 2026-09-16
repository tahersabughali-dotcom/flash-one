import type { PaymentProviderAdapter } from "@/modules/payment-providers";
import { envPresent, payoutAdapterUnavailable } from "@/modules/payment-providers";

export const wiseAdapter: PaymentProviderAdapter = {
  code: "wise",
  displayName: "Wise",
  capabilities: {
    checkout: false,
    webhook: false,
    refund: false,
    payout: true,
    balance: true,
    transaction_import: true,
  },
  isConfigured() {
    return envPresent("WISE_API_TOKEN");
  },
  isCheckoutReady() {
    return false;
  },
  async createCheckout() {
    return {
      kind: "unavailable",
      message: "Wise is not a Stripe-style checkout provider. No checkout URL is fabricated.",
    };
  },
  async createRefund() {
    return {
      kind: "unavailable",
      message: "Wise refund capability is not claimed for this integration.",
    };
  },
};

export const wisePayoutAdapter = {
  ...payoutAdapterUnavailable("wise", "Wise"),
  isConfigured() {
    return envPresent("WISE_API_TOKEN");
  },
  async createPayout() {
    if (!envPresent("WISE_API_TOKEN")) {
      return {
        kind: "unavailable" as const,
        message: "Wise payout requires setup. No transfer was started.",
      };
    }
    return {
      kind: "requires_provider_confirmation" as const,
      message: "Wise must confirm execution before a provider-paid status can exist.",
    };
  },
};
