import { createSessionSupabaseClient } from "@/lib/supabase/server";
import type { OrderStatus, ProductStatus } from "@/modules/store";
import { asMinor } from "@/modules/invoices/money";
import { listRange } from "@/lib/server/pagination";

export async function listAdminStoreProducts(page = 1) {
  const supabase = await createSessionSupabaseClient();
  if (!supabase) {
    return [];
  }
  const { from, to } = listRange(page);
  const { data } = await supabase
    .from("store_products")
    .select("public_id, slug, name, status, commercial_mode, customer_visible, product_type")
    .order("created_at", { ascending: false })
    .range(from, to);
  return data ?? [];
}

export async function getAdminStoreProduct(publicId: string) {
  const supabase = await createSessionSupabaseClient();
  if (!supabase) {
    return null;
  }
  const { data } = await supabase
    .from("store_products")
    .select("*, store_product_prices(currency, amount_minor, active)")
    .eq("public_id", publicId)
    .maybeSingle();
  return data;
}

export async function listAdminStoreOrders(page = 1) {
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
  }));
}

export async function getAdminStoreOrder(publicId: string) {
  const supabase = await createSessionSupabaseClient();
  if (!supabase) {
    return null;
  }
  const { data } = await supabase
    .from("store_orders")
    .select(
      "public_id, status, currency, total_minor, created_at, paid_at, completed_at, guest_email, guest_name, store_order_items(product_public_id, product_name, product_type, unit_price_minor, quantity, line_total_minor)",
    )
    .eq("public_id", publicId)
    .maybeSingle();
  return data;
}

export async function listAdminAutomationRules(page = 1) {
  const supabase = await createSessionSupabaseClient();
  if (!supabase) {
    return [];
  }
  const { from, to } = listRange(page);
  const { data } = await supabase
    .from("automation_rules")
    .select("public_id, name, event_type, action_type, enabled, created_at")
    .order("created_at", { ascending: false })
    .range(from, to);
  return data ?? [];
}

export async function getAdminAutomationRule(publicId: string) {
  const supabase = await createSessionSupabaseClient();
  if (!supabase) {
    return null;
  }
  const { data: rule } = await supabase
    .from("automation_rules")
    .select("id, public_id, name, event_type, action_type, enabled, created_at")
    .eq("public_id", publicId)
    .maybeSingle();
  if (!rule) {
    return null;
  }
  const { data: runs } = await supabase
    .from("automation_runs")
    .select("public_id, status, error_summary, started_at, finished_at")
    .eq("rule_id", rule.id)
    .order("started_at", { ascending: false })
    .limit(20);
  return { ...rule, runs: runs ?? [] };
}

export async function countPendingStoreOrders() {
  const supabase = await createSessionSupabaseClient();
  if (!supabase) {
    return 0;
  }
  const { count } = await supabase
    .from("store_orders")
    .select("*", { count: "exact", head: true })
    .eq("status", "paid");
  return count ?? 0;
}

export async function countActiveStoreProducts() {
  const supabase = await createSessionSupabaseClient();
  if (!supabase) {
    return 0;
  }
  const { count } = await supabase
    .from("store_products")
    .select("*", { count: "exact", head: true })
    .eq("status", "active");
  return count ?? 0;
}

export async function countFailedAutomationRuns() {
  const supabase = await createSessionSupabaseClient();
  if (!supabase) {
    return 0;
  }
  const { count } = await supabase
    .from("automation_runs")
    .select("*", { count: "exact", head: true })
    .eq("status", "failed");
  return count ?? 0;
}

export async function countUnreadNotifications() {
  const supabase = await createSessionSupabaseClient();
  if (!supabase) {
    return 0;
  }
  const { count } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .is("read_at", null);
  return count ?? 0;
}

export type { ProductStatus };
