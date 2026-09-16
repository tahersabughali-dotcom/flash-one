import { createSessionSupabaseClient } from "@/lib/supabase/server";
import { createServerDatabaseClient } from "@/lib/server/database/client";
import type { CommercialMode, OrderStatus, ProductType } from "@/modules/store";
import { asMinor, parseMinor } from "@/modules/invoices/money";
import { listRange } from "@/lib/server/pagination";

type JsonMap = Record<string, unknown>;

function asClient() {
  return createServerDatabaseClient();
}

export type StorePrice = { currency: string; amountMinor: number };

export type StoreCatalogProduct = {
  publicId: string;
  slug: string;
  name: string;
  shortDescription: string;
  productType: ProductType;
  commercialMode: CommercialMode;
  prices: StorePrice[];
};

export type StoreProductDetail = StoreCatalogProduct & {
  description: string | null;
  quantityMode: "single" | "multiple";
};

function parsePrices(value: unknown): StorePrice[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.flatMap((item) => {
    if (!item || typeof item !== "object") {
      return [];
    }
    const row = item as JsonMap;
    const amountMinor = parseMinor(row.amount_minor);
    if (amountMinor === null) {
      return [];
    }
    return [
      {
        currency: String(row.currency ?? ""),
        amountMinor,
      },
    ];
  });
}

export async function listPublicStoreProducts(): Promise<StoreCatalogProduct[]> {
  const supabase = (await createSessionSupabaseClient()) ?? asClient();
  if (!supabase) {
    return [];
  }
  const { data } = await supabase.rpc("public_list_store_products");
  const rows = Array.isArray(data) ? data : [];
  return rows.flatMap((item) => {
    if (!item || typeof item !== "object") {
      return [];
    }
    const row = item as JsonMap;
    return [
      {
        publicId: String(row.public_id ?? ""),
        slug: String(row.slug ?? ""),
        name: String(row.name ?? ""),
        shortDescription: String(row.short_description ?? ""),
        productType: String(row.product_type ?? "service") as ProductType,
        commercialMode: String(row.commercial_mode ?? "fixed_price") as CommercialMode,
        prices: parsePrices(row.prices),
      },
    ];
  });
}

export async function getPublicStoreProduct(slug: string): Promise<StoreProductDetail | null> {
  const supabase = (await createSessionSupabaseClient()) ?? asClient();
  if (!supabase) {
    return null;
  }
  const { data } = await supabase.rpc("public_get_store_product", { p_slug: slug });
  if (!data || typeof data !== "object") {
    return null;
  }
  const row = data as JsonMap;
  if (String(row.status ?? "") !== "ok") {
    return null;
  }
  return {
    publicId: String(row.public_id ?? ""),
    slug: String(row.slug ?? ""),
    name: String(row.name ?? ""),
    shortDescription: String(row.short_description ?? ""),
    description: row.description ? String(row.description) : null,
    productType: String(row.product_type ?? "service") as ProductType,
    commercialMode: String(row.commercial_mode ?? "fixed_price") as CommercialMode,
    quantityMode: String(row.quantity_mode ?? "single") === "multiple" ? "multiple" : "single",
    prices: parsePrices(row.prices),
  };
}

export async function createStoreOrder(input: {
  productPublicId: string;
  quantity: number;
  currency: string;
  guestName?: string;
  guestEmail?: string;
  organizationPublicId?: string;
}) {
  const supabase = (await createSessionSupabaseClient()) ?? asClient();
  if (!supabase) {
    return { error: "Order could not be created." };
  }
  const { data, error } = await supabase.rpc("create_store_order", {
    p_product_public_id: input.productPublicId,
    p_quantity: input.quantity,
    p_currency: input.currency,
    p_guest_name: input.guestName ?? "",
    p_guest_email: input.guestEmail ?? "",
    p_organization_public_id: input.organizationPublicId ?? "",
  });
  if (error || !data || typeof data !== "object") {
    return { error: mapStoreError(error?.message ?? "") };
  }
  const row = data as JsonMap;
  return {
    orderPublicId: String(row.order_public_id ?? ""),
    paymentRequestPublicId: String(row.payment_request_public_id ?? ""),
    accessKey: String(row.access_key ?? ""),
    currency: String(row.currency ?? ""),
    totalMinor: asMinor(String(row.total_minor ?? "0")),
  };
}

export function mapStoreError(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("quote required")) {
    return "This offering needs a quote. Submit a work request instead of paying a store price.";
  }
  if (lower.includes("no price")) {
    return "This product is not available in the selected currency.";
  }
  if (lower.includes("not available")) {
    return "This product is not available.";
  }
  if (lower.includes("guest")) {
    return "Enter your name and email to continue.";
  }
  if (lower.includes("individual relationship")) {
    return "Add an individual relationship before ordering for yourself.";
  }
  if (lower.includes("not authorized")) {
    return "You can only order for a business you belong to.";
  }
  return "Order could not be created.";
}

export type StoreOrderRow = {
  publicId: string;
  status: OrderStatus;
  currency: string;
  totalMinor: number;
  createdAt: string;
  paidAt: string | null;
  paymentRequestPublicId: string | null;
};

export async function listCustomerOrders(page = 1): Promise<StoreOrderRow[]> {
  const supabase = await createSessionSupabaseClient();
  if (!supabase) {
    return [];
  }
  const { from, to } = listRange(page);
  const { data } = await supabase
    .from("store_orders")
    .select("public_id, status, currency, total_minor, created_at, paid_at")
    .order("created_at", { ascending: false })
    .range(from, to);
  return (data ?? []).map((row) => ({
    publicId: row.public_id,
    status: row.status as OrderStatus,
    currency: row.currency,
    totalMinor: asMinor(row.total_minor),
    createdAt: row.created_at,
    paidAt: row.paid_at,
    paymentRequestPublicId: null,
  }));
}

export async function getCustomerOrder(publicId: string) {
  const supabase = await createSessionSupabaseClient();
  if (!supabase) {
    return null;
  }
  const { data: order } = await supabase
    .from("store_orders")
    .select(
      "id, public_id, status, currency, subtotal_minor, tax_minor, total_minor, created_at, paid_at, completed_at, guest_email, payment_request_id, invoice_id",
    )
    .eq("public_id", publicId)
    .maybeSingle();
  if (!order) {
    return null;
  }
  const { data: items } = await supabase
    .from("store_order_items")
    .select("product_public_id, product_name, product_type, unit_price_minor, quantity, line_total_minor")
    .eq("order_id", order.id);
  let paymentRequestPublicId: string | null = null;
  if (order.payment_request_id) {
    const { data: request } = await supabase
      .from("payment_requests")
      .select("public_id")
      .eq("id", order.payment_request_id)
      .maybeSingle();
    paymentRequestPublicId = request?.public_id ?? null;
  }
  let invoicePublicId: string | null = null;
  if (order.invoice_id) {
    const { data: invoice } = await supabase
      .from("invoices")
      .select("public_id")
      .eq("id", order.invoice_id)
      .maybeSingle();
    invoicePublicId = invoice?.public_id ?? null;
  }
  return {
    ...order,
    payment_requests: paymentRequestPublicId ? { public_id: paymentRequestPublicId } : null,
    store_order_items: items ?? [],
    invoicePublicId,
  };
}
