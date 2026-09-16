import { createSessionSupabaseClient } from "@/lib/supabase/server";
import { countUnreadNotifications } from "@/lib/server/platform/queries";

export type CustomerWorkspaceStats = {
  activeRequests: number;
  activeProjects: number;
  orders: number;
  outstandingInvoices: number;
  receipts: number;
  unreadNotifications: number;
};

export async function getCustomerWorkspaceStats(): Promise<CustomerWorkspaceStats> {
  const supabase = await createSessionSupabaseClient();
  const empty: CustomerWorkspaceStats = {
    activeRequests: 0,
    activeProjects: 0,
    orders: 0,
    outstandingInvoices: 0,
    receipts: 0,
    unreadNotifications: 0,
  };
  if (!supabase) {
    return empty;
  }

  const [
    requests,
    projects,
    orders,
    invoices,
    receipts,
    unreadNotifications,
  ] = await Promise.all([
    supabase
      .from("work_requests")
      .select("*", { count: "exact", head: true })
      .in("status", ["submitted", "under_review", "needs_information", "qualified"]),
    supabase
      .from("projects")
      .select("*", { count: "exact", head: true })
      .in("status", ["planned", "active", "on_hold"]),
    supabase.from("store_orders").select("*", { count: "exact", head: true }),
    supabase
      .from("invoices")
      .select("*", { count: "exact", head: true })
      .in("status", ["issued", "partially_paid"]),
    supabase.from("receipts").select("*", { count: "exact", head: true }),
    countUnreadNotifications(),
  ]);

  return {
    activeRequests: requests.count ?? 0,
    activeProjects: projects.count ?? 0,
    orders: orders.count ?? 0,
    outstandingInvoices: invoices.count ?? 0,
    receipts: receipts.count ?? 0,
    unreadNotifications,
  };
}
