export type VerifiedWebhookReceipt = {
  provider: string;
  externalEventId: string;
  receivedAt: string;
  verification: "verified" | "rejected" | "unconfigured";
  processingState: "received" | "processing" | "processed" | "failed" | "ignored";
};

export function unverifiedWebhookResult(provider: string): VerifiedWebhookReceipt {
  return {
    provider,
    externalEventId: "",
    receivedAt: new Date().toISOString(),
    verification: "rejected",
    processingState: "ignored",
  };
}

export function unconfiguredWebhookResult(provider: string): VerifiedWebhookReceipt {
  return {
    provider,
    externalEventId: "",
    receivedAt: new Date().toISOString(),
    verification: "unconfigured",
    processingState: "ignored",
  };
}

/** Never trust a webhook payload without provider-specific verification. */
export function requireVerifiedWebhook(
  verified: boolean,
  provider: string,
  externalEventId: string,
): VerifiedWebhookReceipt | null {
  if (!verified || !externalEventId) {
    return null;
  }
  return {
    provider,
    externalEventId,
    receivedAt: new Date().toISOString(),
    verification: "verified",
    processingState: "received",
  };
}
