"use server";

import { redirect } from "next/navigation";
import { firstZodError } from "@/modules/auth";
import { AUTH_PATHS } from "@/modules/auth/constants";
import { catalogServiceUpsertSchema, SERVICE_PATHS } from "@/modules/services";
import { refundCreateSchema, REFUND_PATHS } from "@/modules/refunds";
import { creditNoteCreateSchema, CREDIT_NOTE_PATHS } from "@/modules/credit-notes";
import { adjustmentCreateSchema, ADJUSTMENT_PATHS } from "@/modules/adjustments";
import { requirePlatformAdmin } from "@/lib/server/auth";
import { createSessionSupabaseClient } from "@/lib/supabase/server";
import { mapFinanceError, type AdminFinanceFormState } from "./finance-errors";

async function requireAdmin(nextPath: string) {
  const access = await requirePlatformAdmin(nextPath);
  if (!access.authorized) {
    redirect(AUTH_PATHS.admin);
  }
}

export async function adminUpsertServiceAction(
  _previous: AdminFinanceFormState,
  formData: FormData,
): Promise<AdminFinanceFormState> {
  await requireAdmin(SERVICE_PATHS.adminList);
  const parsed = catalogServiceUpsertSchema.safeParse({
    publicId: formData.get("publicId") || undefined,
    name: formData.get("name"),
    description: formData.get("description"),
    category: formData.get("category"),
    status: formData.get("status"),
    customerVisible: formData.get("customerVisible") === "on",
    commercialMode: formData.get("commercialMode"),
    defaultCurrency: formData.get("defaultCurrency") || undefined,
    defaultPrice: formData.get("defaultPrice") || undefined,
    internalNotes: formData.get("internalNotes") || undefined,
  });
  if (!parsed.success) {
    return { error: firstZodError(parsed.error) };
  }
  const supabase = await createSessionSupabaseClient();
  if (!supabase) {
    return { error: "Unable to save service." };
  }
  const { data, error } = await supabase.rpc("admin_upsert_commercial_service", {
    p_public_id: parsed.data.publicId ?? "",
    p_name: parsed.data.name,
    p_description: parsed.data.description,
    p_category: parsed.data.category,
    p_status: parsed.data.status,
    p_customer_visible: parsed.data.customerVisible,
    p_commercial_mode: parsed.data.commercialMode,
    p_default_currency: parsed.data.defaultCurrency ?? "",
    p_default_price_minor: parsed.data.defaultPriceMinor ?? 0,
    p_internal_notes: parsed.data.internalNotes ?? "",
  });
  if (error || !data) {
    return { error: mapFinanceError(error?.message ?? "") };
  }
  redirect(SERVICE_PATHS.adminDetail(data.public_id));
}

export async function adminRecordRefundAction(
  _previous: AdminFinanceFormState,
  formData: FormData,
): Promise<AdminFinanceFormState> {
  await requireAdmin(REFUND_PATHS.adminNew);
  const parsed = refundCreateSchema.safeParse({
    paymentPublicId: formData.get("paymentPublicId"),
    amount: formData.get("amount"),
    reason: formData.get("reason"),
    status: formData.get("status"),
  });
  if (!parsed.success) {
    return { error: firstZodError(parsed.error) };
  }
  const supabase = await createSessionSupabaseClient();
  if (!supabase) {
    return { error: "Unable to record refund." };
  }
  const { data, error } = await supabase.rpc("admin_record_refund", {
    p_payment_public_id: parsed.data.paymentPublicId,
    p_amount_minor: parsed.data.amount,
    p_reason: parsed.data.reason,
    p_status: parsed.data.status,
  });
  if (error || !data) {
    return { error: mapFinanceError(error?.message ?? "") };
  }
  redirect(REFUND_PATHS.adminDetail(data.public_id));
}

export async function adminCreateCreditNoteAction(
  _previous: AdminFinanceFormState,
  formData: FormData,
): Promise<AdminFinanceFormState> {
  await requireAdmin(CREDIT_NOTE_PATHS.adminNew);
  const parsed = creditNoteCreateSchema.safeParse({
    invoicePublicId: formData.get("invoicePublicId"),
    amount: formData.get("amount"),
    reason: formData.get("reason"),
    notes: formData.get("notes") || undefined,
  });
  if (!parsed.success) {
    return { error: firstZodError(parsed.error) };
  }
  const supabase = await createSessionSupabaseClient();
  if (!supabase) {
    return { error: "Unable to create credit note." };
  }
  const { data, error } = await supabase.rpc("admin_create_credit_note", {
    p_invoice_public_id: parsed.data.invoicePublicId,
    p_amount_minor: parsed.data.amount,
    p_reason: parsed.data.reason,
    p_notes: parsed.data.notes ?? "",
  });
  if (error || !data) {
    return { error: mapFinanceError(error?.message ?? "") };
  }
  redirect(CREDIT_NOTE_PATHS.adminDetail(data.public_id));
}

export async function adminIssueCreditNoteAction(formData: FormData) {
  const publicId = String(formData.get("publicId") || "");
  await requireAdmin(CREDIT_NOTE_PATHS.adminDetail(publicId));
  const supabase = await createSessionSupabaseClient();
  if (!supabase) {
    return;
  }
  const { data } = await supabase.from("credit_notes").select("id").eq("public_id", publicId).maybeSingle();
  if (!data) {
    return;
  }
  await supabase.rpc("admin_issue_credit_note", { p_credit_note_id: data.id });
  redirect(CREDIT_NOTE_PATHS.adminDetail(publicId));
}

export async function adminVoidCreditNoteAction(formData: FormData) {
  const publicId = String(formData.get("publicId") || "");
  await requireAdmin(CREDIT_NOTE_PATHS.adminDetail(publicId));
  const supabase = await createSessionSupabaseClient();
  if (!supabase) {
    return;
  }
  const { data } = await supabase.from("credit_notes").select("id").eq("public_id", publicId).maybeSingle();
  if (!data) {
    return;
  }
  await supabase.rpc("admin_void_credit_note", { p_credit_note_id: data.id });
  redirect(CREDIT_NOTE_PATHS.adminDetail(publicId));
}

export async function adminRecordAdjustmentAction(
  _previous: AdminFinanceFormState,
  formData: FormData,
): Promise<AdminFinanceFormState> {
  await requireAdmin(ADJUSTMENT_PATHS.adminNew);
  const parsed = adjustmentCreateSchema.safeParse({
    kind: formData.get("kind"),
    currency: formData.get("currency"),
    amount: formData.get("amount"),
    reason: formData.get("reason"),
    paymentPublicId: formData.get("paymentPublicId") || undefined,
    invoicePublicId: formData.get("invoicePublicId") || undefined,
  });
  if (!parsed.success) {
    return { error: firstZodError(parsed.error) };
  }
  const supabase = await createSessionSupabaseClient();
  if (!supabase) {
    return { error: "Unable to record adjustment." };
  }
  const { data, error } = await supabase.rpc("admin_record_adjustment", {
    p_kind: parsed.data.kind,
    p_amount_minor: parsed.data.amount,
    p_currency: parsed.data.currency,
    p_reason: parsed.data.reason,
    p_payment_public_id: parsed.data.paymentPublicId ?? "",
    p_invoice_public_id: parsed.data.invoicePublicId ?? "",
  });
  if (error || !data) {
    return { error: mapFinanceError(error?.message ?? "") };
  }
  redirect(ADJUSTMENT_PATHS.adminDetail(data.public_id));
}

export async function adminCreateInvoiceFromStoreOrderAction(formData: FormData) {
  const publicId = String(formData.get("publicId") || "");
  await requireAdmin(`/admin/store/orders/${publicId}`);
  const supabase = await createSessionSupabaseClient();
  if (!supabase) {
    return;
  }
  const { data, error } = await supabase.rpc("admin_create_invoice_from_store_order", {
    p_store_order_public_id: publicId,
  });
  if (error || !data) {
    redirect(`/admin/store/orders/${publicId}`);
    return;
  }
  redirect(`/admin/invoices/${data.public_id}`);
}
