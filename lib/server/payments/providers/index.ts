import type {
  PaymentProviderAdapter,
  PaymentProviderCode,
} from "@/modules/payment-providers";
import { developmentTestAdapter } from "./development-test";
import { paypalAdapter } from "./paypal";
import { stripeAdapter } from "./stripe";
import { usdtAdapter } from "./usdt";
import { wiseAdapter } from "./wise";
import { worldfirstAdapter } from "./worldfirst";

const adapters: Record<PaymentProviderCode, PaymentProviderAdapter> = {
  paypal: paypalAdapter,
  stripe: stripeAdapter,
  wise: wiseAdapter,
  worldfirst: worldfirstAdapter,
  usdt: usdtAdapter,
  development_test: developmentTestAdapter,
};

export function getProviderAdapter(code: string): PaymentProviderAdapter | null {
  if (code in adapters) {
    return adapters[code as PaymentProviderCode];
  }
  return null;
}

export function listProviderAdapters(): PaymentProviderAdapter[] {
  return Object.values(adapters);
}
