const CUSTOMER_PREFIXES: Array<{ prefix: string; href: (id: string) => string }> = [
  { prefix: "WRQ-", href: (id) => `/app/requests/${id}` },
  { prefix: "QTE-", href: (id) => `/app/quotes/${id}` },
  { prefix: "PRJ-", href: (id) => `/app/projects/${id}` },
  { prefix: "ORD-", href: (id) => `/app/orders/${id}` },
  { prefix: "INV-", href: (id) => `/app/invoices/${id}` },
  { prefix: "RCP-", href: (id) => `/app/receipts/${id}` },
];

export function notificationDestination(
  sourceType: string | null,
  sourcePublicId: string | null,
): string | null {
  if (!sourcePublicId) {
    return null;
  }
  if (sourceType === "store_order") {
    return `/app/orders/${sourcePublicId}`;
  }
  if (sourceType === "work_request") {
    return `/app/requests/${sourcePublicId}`;
  }
  const match = CUSTOMER_PREFIXES.find((item) => sourcePublicId.startsWith(item.prefix));
  return match ? match.href(sourcePublicId) : null;
}
