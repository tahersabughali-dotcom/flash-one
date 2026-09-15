"use server";

import { redirect } from "next/navigation";
import { firstZodError } from "@/modules/auth";
import { AUTH_PATHS } from "@/modules/auth/constants";
import {
  RECONCILIATION_PATHS,
  reconciliationCreateSchema,
  reconciliationMatchSchema,
} from "@/modules/reconciliation";
import { requirePlatformAdmin } from "@/lib/server/auth";
import { createSessionSupabaseClient } from "@/lib/supabase/server";
import { mapFinanceError, type AdminFinanceFormState } from "../finance-errors";

async function requireAdmin() {
  const access = await requirePlatformAdmin(RECONCILIATION_PATHS.adminList);
  if (!access.authorized) {
    redirect(AUTH_PATHS.admin);
  }
}

export async function adminCreateReconciliationAction(
  _previous: AdminFinanceFormState,
  formData: FormData,
): Promise<AdminFinanceFormState> {
  await requireAdmin();
  const parsed = reconciliationCreateSchema.safeParse({
    currency: formData.get("currency"),
    amount: formData.get("amount"),
    notes: formData.get("notes") || undefined,
  });
  if (!parsed.success) {
    return { error: firstZodError(parsed.error) };
  }
  const supabase = await createSessionSupabaseClient();
  if (!supabase) {
    return { error: "Unable to create reconciliation item." };
  }
  const { error } = await supabase.rpc("admin_create_reconciliation_item", {
    p_currency: parsed.data.currency,
    p_amount_minor: parsed.data.amount,
    p_notes: parsed.data.notes ?? "",
  });
  if (error) {
    return { error: mapFinanceError(error.message) };
  }
  redirect(RECONCILIATION_PATHS.adminList);
}

export async function adminMatchReconciliationAction(
  _previous: AdminFinanceFormState,
  formData: FormData,
): Promise<AdminFinanceFormState> {
  await requireAdmin();
  const parsed = reconciliationMatchSchema.safeParse({
    itemPublicId: formData.get("itemPublicId"),
    paymentPublicId: formData.get("paymentPublicId"),
  });
  if (!parsed.success) {
    return { error: firstZodError(parsed.error) };
  }
  const supabase = await createSessionSupabaseClient();
  if (!supabase) {
    return { error: "Unable to match item." };
  }
  const [{ data: item }, { data: payment }] = await Promise.all([
    supabase
      .from("reconciliation_items")
      .select("id")
      .eq("public_id", parsed.data.itemPublicId)
      .maybeSingle(),
    supabase
      .from("payments")
      .select("id")
      .eq("public_id", parsed.data.paymentPublicId)
      .maybeSingle(),
  ]);
  if (!item || !payment) {
    return { error: "Item or payment not found." };
  }
  const { error } = await supabase.rpc("admin_match_reconciliation_item", {
    p_item_id: item.id,
    p_payment_id: payment.id,
  });
  if (error) {
    return { error: mapFinanceError(error.message) };
  }
  redirect(RECONCILIATION_PATHS.adminList);
}

export async function adminConfirmReconciliationAction(formData: FormData) {
  await requireAdmin();
  const publicId = String(formData.get("itemPublicId") || "");
  const supabase = await createSessionSupabaseClient();
  if (!supabase) {
    return;
  }
  const { data: item } = await supabase
    .from("reconciliation_items")
    .select("id")
    .eq("public_id", publicId)
    .maybeSingle();
  if (!item) {
    return;
  }
  await supabase.rpc("admin_confirm_reconciliation_item", { p_item_id: item.id });
  redirect(RECONCILIATION_PATHS.adminList);
}
