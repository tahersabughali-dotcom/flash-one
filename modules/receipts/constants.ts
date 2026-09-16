export const RECEIPT_PATHS = {
  list: "/app/receipts",
  detail: (publicId: string) => `/app/receipts/${publicId}`,
  pdf: (publicId: string) => `/app/receipts/${publicId}/pdf`,
  adminList: "/admin/receipts",
  adminDetail: (publicId: string) => `/admin/receipts/${publicId}`,
  adminPdf: (publicId: string) => `/admin/receipts/${publicId}/pdf`,
} as const;
