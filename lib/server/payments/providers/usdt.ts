import type { PaymentProviderAdapter } from "@/modules/payment-providers";
import { envPresent } from "@/modules/payment-providers";

/**
 * USDT amounts use integer token units at 6 decimal places (1 USDT = 1_000_000 units).
 * No private key, seed phrase, or live wallet. Automatic chain monitoring is not enabled.
 */
export const USDT_TOKEN_SCALE = BigInt("1000000");

export const USDT_NETWORKS = ["TRON", "ETHEREUM"] as const;
export type UsdtNetwork = (typeof USDT_NETWORKS)[number];

export function parseUsdtAmount(value: string): bigint | null {
  const trimmed = value.trim();
  if (!/^\d+(\.\d{1,6})?$/.test(trimmed)) {
    return null;
  }
  const [whole, fraction = ""] = trimmed.split(".");
  const fractionPadded = `${fraction}000000`.slice(0, 6);
  try {
    return BigInt(whole) * USDT_TOKEN_SCALE + BigInt(fractionPadded);
  } catch {
    return null;
  }
}

export function configuredUsdtNetworks(): UsdtNetwork[] {
  const networks: UsdtNetwork[] = [];
  if (envPresent("USDT_TRON_ADDRESS")) {
    networks.push("TRON");
  }
  if (envPresent("USDT_ETHEREUM_ADDRESS")) {
    networks.push("ETHEREUM");
  }
  return networks;
}

export const usdtAdapter: PaymentProviderAdapter = {
  code: "usdt",
  displayName: "USDT",
  capabilities: {
    checkout: false,
    webhook: false,
    refund: false,
    payout: false,
    crypto_reference: true,
  },
  isConfigured() {
    return configuredUsdtNetworks().length > 0;
  },
  isCheckoutReady() {
    return false;
  },
  async createCheckout() {
    return {
      kind: "unavailable",
      message: "USDT remains disabled. No wallet is enabled and no private key is stored.",
    };
  },
  async createRefund() {
    return {
      kind: "unavailable",
      message: "USDT refunds are not available.",
    };
  },
};
