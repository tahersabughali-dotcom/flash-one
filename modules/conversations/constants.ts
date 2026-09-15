export const MAX_MESSAGE_LENGTH = 4000;

export const MESSAGE_SENDER_KINDS = ["customer", "staff", "developer"] as const;
export type MessageSenderKind = (typeof MESSAGE_SENDER_KINDS)[number];
