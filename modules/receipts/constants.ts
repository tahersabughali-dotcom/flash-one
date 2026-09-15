export const RECEIPT_PATHS = {
  list: "/app/receipts",
  detail: (publicId: string) => `/app/receipts/${publicId}`,
} as const;
