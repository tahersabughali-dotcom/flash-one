export const RECEIPT_PATHS = {
  list: "/app/receipts",
  detail: (publicId: string) => `/app/receipts/${publicId}`,
  adminList: "/admin/receipts",
  adminDetail: (publicId: string) => `/admin/receipts/${publicId}`,
} as const;
