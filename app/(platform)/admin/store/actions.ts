"use server";

import { redirect } from "next/navigation";
import { firstZodError } from "@/modules/auth";
import { AUTH_PATHS } from "@/modules/auth/constants";
import { parseMajorToMinor } from "@/modules/invoices";
import {
  STORE_PATHS,
  storePriceSchema,
  storeProductUpsertSchema,
} from "@/modules/store";
import { AUTOMATION_PATHS } from "@/modules/automations";
import { requirePlatformAdmin } from "@/lib/server/auth";
import { createSessionSupabaseClient } from "@/lib/supabase/server";

export type AdminStoreFormState = { error: string | null };

async function requireAdmin(path: string) {
  const access = await requirePlatformAdmin(path);
  if (!access.authorized) {
    redirect(AUTH_PATHS.admin);
  }
}

export async function adminUpsertProductAction(
  _previous: AdminStoreFormState,
  formData: FormData,
): Promise<AdminStoreFormState> {
  await requireAdmin(STORE_PATHS.adminProductNew);
  const parsed = storeProductUpsertSchema.safeParse({
    publicId: formData.get("publicId") || undefined,
    slug: formData.get("slug"),
    name: formData.get("name"),
    shortDescription: formData.get("shortDescription"),
    description: formData.get("description") || undefined,
    productType: formData.get("productType"),
    commercialMode: formData.get("commercialMode"),
    quantityMode: formData.get("quantityMode"),
    customerVisible: formData.get("customerVisible") === "on",
  });
  if (!parsed.success) {
    return { error: firstZodError(parsed.error) };
  }
  const supabase = await createSessionSupabaseClient();
  if (!supabase) {
    return { error: "Unable to save product." };
  }
  const { data, error } = await supabase.rpc("admin_upsert_store_product", {
    p_public_id: parsed.data.publicId ?? "",
    p_slug: parsed.data.slug,
    p_name: parsed.data.name,
    p_short_description: parsed.data.shortDescription,
    p_description: parsed.data.description ?? "",
    p_product_type: parsed.data.productType,
    p_commercial_mode: parsed.data.commercialMode,
    p_quantity_mode: parsed.data.quantityMode,
    p_customer_visible: parsed.data.customerVisible,
  });
  if (error || !data || typeof data !== "object" || !("public_id" in data)) {
    return { error: "Unable to save product." };
  }
  redirect(STORE_PATHS.adminProduct(String((data as { public_id: string }).public_id)));
}

export async function adminSetProductStatusAction(formData: FormData) {
  const publicId = String(formData.get("publicId") || "");
  await requireAdmin(STORE_PATHS.adminProduct(publicId));
  const supabase = await createSessionSupabaseClient();
  if (!supabase) {
    return;
  }
  await supabase.rpc("admin_set_store_product_status", {
    p_public_id: publicId,
    p_status: String(formData.get("status") || ""),
  });
  redirect(STORE_PATHS.adminProduct(publicId));
}

export async function adminSetProductPriceAction(
  _previous: AdminStoreFormState,
  formData: FormData,
): Promise<AdminStoreFormState> {
  const parsed = storePriceSchema.safeParse({
    productPublicId: formData.get("productPublicId"),
    currency: formData.get("currency"),
    amount: formData.get("amount"),
    active: formData.get("active") === "on",
  });
  if (!parsed.success) {
    return { error: firstZodError(parsed.error) };
  }
  await requireAdmin(STORE_PATHS.adminProduct(parsed.data.productPublicId));
  const amountMinor = parseMajorToMinor(parsed.data.amount, parsed.data.currency);
  if (amountMinor === null || amountMinor <= 0) {
    return { error: "Enter a valid price." };
  }
  const supabase = await createSessionSupabaseClient();
  if (!supabase) {
    return { error: "Unable to save price." };
  }
  const { error } = await supabase.rpc("admin_set_store_product_price", {
    p_product_public_id: parsed.data.productPublicId,
    p_currency: parsed.data.currency,
    p_amount_minor: amountMinor,
    p_active: parsed.data.active,
  });
  if (error) {
    return { error: "Unable to save price." };
  }
  redirect(STORE_PATHS.adminProduct(parsed.data.productPublicId));
}

export async function adminSetOrderStatusAction(formData: FormData) {
  const publicId = String(formData.get("publicId") || "");
  await requireAdmin(STORE_PATHS.adminOrder(publicId));
  const supabase = await createSessionSupabaseClient();
  if (!supabase) {
    return;
  }
  await supabase.rpc("admin_set_store_order_status", {
    p_public_id: publicId,
    p_status: String(formData.get("status") || ""),
  });
  redirect(STORE_PATHS.adminOrder(publicId));
}

export async function adminSetAutomationEnabledAction(formData: FormData) {
  const publicId = String(formData.get("publicId") || "");
  await requireAdmin(AUTOMATION_PATHS.adminDetail(publicId));
  const supabase = await createSessionSupabaseClient();
  if (!supabase) {
    return;
  }
  await supabase.rpc("admin_set_automation_rule_enabled", {
    p_public_id: publicId,
    p_enabled: formData.get("enabled") === "true",
  });
  redirect(AUTOMATION_PATHS.adminDetail(publicId));
}
