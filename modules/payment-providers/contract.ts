export type CheckoutInput = {
  attemptPublicId: string;
  amountMinor: number;
  currency: string;
  description: string;
  returnPath: string;
  cancelPath: string;
};

export type CheckoutResult =
  | { kind: "redirect"; url: string }
  | { kind: "internal_confirm" }
  | { kind: "unavailable"; message: string };

export type VerifiedProviderEvent = {
  provider: string;
  externalEventId: string;
  eventType: string;
  outcome: "succeeded" | "failed" | "cancelled";
  amountMinor: number;
  currency: string;
  providerReference: string;
  attemptPublicId?: string;
  sessionReference?: string;
};

export type PaymentProviderAdapter = {
  code: string;
  displayName: string;
  isConfigured(): boolean;
  isCheckoutReady(): boolean;
  createCheckout(input: CheckoutInput): Promise<CheckoutResult>;
  verifyWebhook?(request: Request, rawBody: string): Promise<VerifiedProviderEvent | null>;
};
