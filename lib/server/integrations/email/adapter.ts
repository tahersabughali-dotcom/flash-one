import { envPresent } from "@/modules/payment-providers";

export type EmailSendInput = {
  templateCode: string;
  toEmail: string;
  subject: string;
  relatedEntityKind?: string;
  relatedEntityPublicId?: string;
};

export type EmailSendResult =
  | { kind: "unavailable"; message: string }
  | { kind: "queued"; message: string };

export type EmailProviderAdapter = {
  code: string;
  displayName: string;
  isConfigured(): boolean;
  send(input: EmailSendInput): Promise<EmailSendResult>;
};

export const transactionalEmailAdapter: EmailProviderAdapter = {
  code: "email",
  displayName: "Transactional email",
  isConfigured() {
    return (
      envPresent("EMAIL_PROVIDER") &&
      envPresent("EMAIL_API_KEY") &&
      envPresent("EMAIL_FROM_ADDRESS")
    );
  },
  async send() {
    if (!this.isConfigured()) {
      return {
        kind: "unavailable",
        message: "Email provider is not configured. Message was not sent.",
      };
    }
    return {
      kind: "unavailable",
      message: "Email provider credentials are present but live sending is not enabled in this phase.",
    };
  },
};
