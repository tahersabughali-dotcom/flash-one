export type PayoutAdapterResult =
  | { kind: "unavailable"; message: string }
  | { kind: "requires_provider_confirmation"; message: string };

export type PayoutProviderAdapter = {
  code: string;
  displayName: string;
  isConfigured(): boolean;
  createPayout(input: {
    payoutPublicId: string;
    amountMinor: number;
    currency: string;
  }): Promise<PayoutAdapterResult>;
};

export const payoutAdapterUnavailable = (
  code: string,
  displayName: string,
): PayoutProviderAdapter => ({
  code,
  displayName,
  isConfigured() {
    return false;
  },
  async createPayout() {
    return {
      kind: "unavailable",
      message: `${displayName} payout is not configured. No provider transfer was started.`,
    };
  },
});
