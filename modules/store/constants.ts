export const STORE_PATHS = {
  catalog: "/store",
  product: (slug: string) => `/store/${slug}`,
  checkout: "/store/checkout",
  orders: "/app/orders",
  order: (publicId: string) => `/app/orders/${publicId}`,
  admin: "/admin/store",
  adminProducts: "/admin/store/products",
  adminProductNew: "/admin/store/products/new",
  adminProduct: (publicId: string) => `/admin/store/products/${publicId}`,
  adminOrders: "/admin/store/orders",
  adminOrder: (publicId: string) => `/admin/store/orders/${publicId}`,
} as const;

export const PRODUCT_TYPES = [
  "software",
  "service",
  "template",
  "license",
  "support",
  "consulting",
  "custom",
] as const;

export type ProductType = (typeof PRODUCT_TYPES)[number];

export const PRODUCT_TYPE_LABELS: Record<ProductType, string> = {
  software: "Software",
  service: "Digital Services",
  template: "Templates",
  license: "Licenses",
  support: "Support",
  consulting: "Consulting",
  custom: "Custom Packages",
};

export const PRODUCT_STATUSES = ["draft", "active", "archived"] as const;
export type ProductStatus = (typeof PRODUCT_STATUSES)[number];

export const PRODUCT_STATUS_LABELS: Record<ProductStatus, string> = {
  draft: "Draft",
  active: "Active",
  archived: "Archived",
};

export const COMMERCIAL_MODES = ["fixed_price", "quote_required"] as const;
export type CommercialMode = (typeof COMMERCIAL_MODES)[number];

export const COMMERCIAL_MODE_LABELS: Record<CommercialMode, string> = {
  fixed_price: "Fixed price",
  quote_required: "Quote required",
};

export const QUANTITY_MODES = ["single", "multiple"] as const;
export type QuantityMode = (typeof QUANTITY_MODES)[number];

export const ORDER_STATUSES = [
  "draft",
  "pending_payment",
  "paid",
  "processing",
  "completed",
  "cancelled",
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  draft: "Draft",
  pending_payment: "Awaiting payment",
  paid: "Paid",
  processing: "Processing",
  completed: "Completed",
  cancelled: "Cancelled",
};
