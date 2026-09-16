import { createSessionSupabaseClient } from "@/lib/supabase/server";
import { asMinor } from "@/modules/invoices/money";
import { INVOICE_CURRENCIES, type InvoiceCurrency } from "@/modules/invoices";
import { listRange } from "@/lib/server/pagination";
import {
  CATALOG_CATEGORIES,
  CATALOG_MODES,
  CATALOG_STATUSES,
  type CatalogCategory,
  type CatalogMode,
  type CatalogStatus,
} from "@/modules/services";

export type CatalogService = {
  id: string;
  publicId: string;
  name: string;
  description: string;
  category: CatalogCategory;
  status: CatalogStatus;
  customerVisible: boolean;
  commercialMode: CatalogMode;
  defaultCurrency: InvoiceCurrency | null;
  defaultPriceMinor: number | null;
  internalNotes: string | null;
};

function isCategory(value: string): value is CatalogCategory {
  return (CATALOG_CATEGORIES as readonly string[]).includes(value);
}

function isStatus(value: string): value is CatalogStatus {
  return (CATALOG_STATUSES as readonly string[]).includes(value);
}

function isMode(value: string): value is CatalogMode {
  return (CATALOG_MODES as readonly string[]).includes(value);
}

function isCurrency(value: string | null): value is InvoiceCurrency {
  return value !== null && INVOICE_CURRENCIES.includes(value as InvoiceCurrency);
}

function mapService(row: {
  id: string;
  public_id: string;
  name: string;
  description: string;
  category: string;
  status: string;
  customer_visible: boolean;
  commercial_mode: string;
  default_currency: string | null;
  default_price_minor: number | string | null;
  internal_notes: string | null;
}): CatalogService | null {
  if (!isCategory(row.category) || !isStatus(row.status) || !isMode(row.commercial_mode)) {
    return null;
  }
  return {
    id: row.id,
    publicId: row.public_id,
    name: row.name,
    description: row.description,
    category: row.category,
    status: row.status,
    customerVisible: row.customer_visible,
    commercialMode: row.commercial_mode,
    defaultCurrency: isCurrency(row.default_currency) ? row.default_currency : null,
    defaultPriceMinor:
      row.default_price_minor === null ? null : asMinor(row.default_price_minor),
    internalNotes: row.internal_notes,
  };
}

const COLUMNS =
  "id, public_id, name, description, category, status, customer_visible, commercial_mode, default_currency, default_price_minor, internal_notes";

export async function listCatalogServices(page = 1): Promise<CatalogService[]> {
  const supabase = await createSessionSupabaseClient();
  if (!supabase) {
    return [];
  }
  const { from, to } = listRange(page);
  const { data } = await supabase
    .from("commercial_services")
    .select(COLUMNS)
    .order("name")
    .range(from, to);
  return (data ?? []).flatMap((row) => {
    const mapped = mapService(row);
    return mapped ? [mapped] : [];
  });
}

export async function listVisibleCatalogServices(): Promise<CatalogService[]> {
  const supabase = await createSessionSupabaseClient();
  if (!supabase) {
    return [];
  }
  const { data } = await supabase
    .from("commercial_services")
    .select(COLUMNS)
    .eq("status", "active")
    .eq("customer_visible", true)
    .order("name");
  return (data ?? []).flatMap((row) => {
    const mapped = mapService(row);
    return mapped ? [mapped] : [];
  });
}

export async function getCatalogServiceByPublicId(
  publicId: string,
): Promise<CatalogService | null> {
  const supabase = await createSessionSupabaseClient();
  if (!supabase) {
    return null;
  }
  const { data } = await supabase
    .from("commercial_services")
    .select(COLUMNS)
    .eq("public_id", publicId)
    .maybeSingle();
  return data ? mapService(data) : null;
}
