"use server";

import { redirect } from "next/navigation";
import { firstZodError } from "@/modules/auth";
import { AUTH_PATHS } from "@/modules/auth/constants";
import { INVOICE_PATHS, invoiceCreateSchema, invoiceVoidSchema } from "@/modules/invoices";
import { allocatePaymentSchema } from "@/modules/payments";
import { requirePlatformAdmin } from "@/lib/server/auth";
import { createSessionSupabaseClient } from "@/lib/supabase/server";
import { mapFinanceError, type AdminFinanceFormState } from "../finance-errors";

async function requireAdmin(nextPath: string) {
  const access = await requirePlatformAdmin(nextPath);
  if (!access.authorized) {
    redirect(AUTH_PATHS.admin);
  }
  return access;
}

export async function adminCreateInvoiceAction(
  _previous: AdminFinanceFormState,
  formData: FormData,
): Promise<AdminFinanceFormState> {
  await requireAdmin(INVOICE_PATHS.adminNew);
  const descriptions = formData.getAll("lineDescription").map(String);
  const quantities = formData.getAll("lineQuantity").map(String);
  const amounts = formData.getAll("lineAmount").map(String);
  const lines = descriptions
    .map((description, index) => ({
      description,
      quantity: quantities[index],
      unitAmount: amounts[index],
    }))
    .filter((line) => line.description.trim() || line.unitAmount.trim());

  const parsed = invoiceCreateSchema.safeParse({
    individualPublicId: formData.get("individualPublicId") || undefined,
    organizationPublicId: formData.get("organizationPublicId") || undefined,
    quotePublicId: formData.get("quotePublicId") || undefined,
    projectPublicId: formData.get("projectPublicId") || undefined,
    contractPublicId: formData.get("contractPublicId") || undefined,
    storeOrderPublicId: formData.get("storeOrderPublicId") || undefined,
    currency: formData.get("currency"),
    dueDate: formData.get("dueDate") || undefined,
    notes: formData.get("notes") || undefined,
    lines,
  });
  if (!parsed.success) {
    return { error: firstZodError(parsed.error) };
  }

  const supabase = await createSessionSupabaseClient();
  if (!supabase) {
    return { error: "Unable to create invoice." };
  }

  if (parsed.data.storeOrderPublicId) {
    const { data, error } = await supabase.rpc("admin_create_invoice_from_store_order", {
      p_store_order_public_id: parsed.data.storeOrderPublicId,
    });
    if (error || !data) {
      return { error: mapFinanceError(error?.message ?? "") };
    }
    redirect(INVOICE_PATHS.adminDetail(data.public_id));
  }

  const { data, error } = await supabase.rpc("admin_create_invoice", {
    p_individual_public_id: parsed.data.individualPublicId ?? "",
    p_organization_public_id: parsed.data.organizationPublicId ?? "",
    p_quote_public_id: parsed.data.quotePublicId ?? "",
    p_project_public_id: parsed.data.projectPublicId ?? "",
    p_contract_public_id: parsed.data.contractPublicId ?? "",
    p_currency: parsed.data.currency,
    p_due_date: parsed.data.dueDate ?? (null as unknown as string),
    p_notes: parsed.data.notes ?? "",
    p_lines: parsed.data.lines.map((line) => ({
      description: line.description,
      quantity: line.quantity,
      unit_amount_minor: line.unitAmount,
    })),
  });

  if (error || !data) {
    return { error: mapFinanceError(error?.message ?? "") };
  }

  redirect(INVOICE_PATHS.adminDetail(data.public_id));
}

export async function adminIssueInvoiceAction(formData: FormData) {
  const publicId = String(formData.get("publicId") || "");
  await requireAdmin(INVOICE_PATHS.adminDetail(publicId));
  const supabase = await createSessionSupabaseClient();
  if (!supabase) {
    return;
  }
  const { data: invoice } = await supabase
    .from("invoices")
    .select("id")
    .eq("public_id", publicId)
    .maybeSingle();
  if (!invoice) {
    return;
  }
  await supabase.rpc("admin_issue_invoice", { p_invoice_id: invoice.id });
  redirect(INVOICE_PATHS.adminDetail(publicId));
}

export async function adminVoidInvoiceAction(
  _previous: AdminFinanceFormState,
  formData: FormData,
): Promise<AdminFinanceFormState> {
  const parsed = invoiceVoidSchema.safeParse({
    publicId: formData.get("publicId"),
    reason: formData.get("reason") || undefined,
  });
  if (!parsed.success) {
    return { error: firstZodError(parsed.error) };
  }
  await requireAdmin(INVOICE_PATHS.adminDetail(parsed.data.publicId));
  const supabase = await createSessionSupabaseClient();
  if (!supabase) {
    return { error: "Unable to void invoice." };
  }
  const { data: invoice } = await supabase
    .from("invoices")
    .select("id")
    .eq("public_id", parsed.data.publicId)
    .maybeSingle();
  if (!invoice) {
    return { error: "Invoice not found." };
  }
  const { error } = await supabase.rpc("admin_void_invoice", {
    p_invoice_id: invoice.id,
    p_reason: parsed.data.reason ?? "",
  });
  if (error) {
    return { error: mapFinanceError(error.message) };
  }
  redirect(INVOICE_PATHS.adminDetail(parsed.data.publicId));
}

export async function adminAllocatePaymentAction(
  _previous: AdminFinanceFormState,
  formData: FormData,
): Promise<AdminFinanceFormState> {
  const parsed = allocatePaymentSchema.safeParse({
    invoicePublicId: formData.get("invoicePublicId"),
    paymentPublicId: formData.get("paymentPublicId"),
    amount: formData.get("amount"),
  });
  if (!parsed.success) {
    return { error: firstZodError(parsed.error) };
  }
  await requireAdmin(INVOICE_PATHS.adminDetail(parsed.data.invoicePublicId));
  const supabase = await createSessionSupabaseClient();
  if (!supabase) {
    return { error: "Unable to allocate payment." };
  }
  const [{ data: invoice }, { data: payment }] = await Promise.all([
    supabase
      .from("invoices")
      .select("id")
      .eq("public_id", parsed.data.invoicePublicId)
      .maybeSingle(),
    supabase
      .from("payments")
      .select("id")
      .eq("public_id", parsed.data.paymentPublicId)
      .maybeSingle(),
  ]);
  if (!invoice || !payment) {
    return { error: "Invoice or payment not found." };
  }
  const { error } = await supabase.rpc("admin_allocate_payment", {
    p_payment_id: payment.id,
    p_invoice_id: invoice.id,
    p_amount_minor: parsed.data.amount,
  });
  if (error) {
    return { error: mapFinanceError(error.message) };
  }
  redirect(INVOICE_PATHS.adminDetail(parsed.data.invoicePublicId));
}

