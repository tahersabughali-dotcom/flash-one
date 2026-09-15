"use server";

import { redirect } from "next/navigation";
import { firstZodError } from "@/modules/auth";
import { AUTH_PATHS } from "@/modules/auth/constants";
import {
  paymentRequestCreateSchema,
  PAYMENT_REQUEST_PATHS,
} from "@/modules/payment-requests";
import { PAYMENT_PATHS } from "@/modules/payments";
import { requirePlatformAdmin } from "@/lib/server/auth";
import { createSessionSupabaseClient } from "@/lib/supabase/server";
import { getProviderAdapter } from "@/lib/server/payments/providers";
import { mapFinanceError, type AdminFinanceFormState } from "../finance-errors";

async function requireAdmin(nextPath: string) {
  const access = await requirePlatformAdmin(nextPath);
  if (!access.authorized) {
    redirect(AUTH_PATHS.admin);
  }
}

export async function adminCreatePaymentRequestAction(
  _previous: AdminFinanceFormState,
  formData: FormData,
): Promise<AdminFinanceFormState> {
  await requireAdmin(PAYMENT_REQUEST_PATHS.adminNew);
  const parsed = paymentRequestCreateSchema.safeParse({
    individualPublicId: formData.get("individualPublicId") || undefined,
    organizationPublicId: formData.get("organizationPublicId") || undefined,
    guestEmail: formData.get("guestEmail") || undefined,
    guestName: formData.get("guestName") || undefined,
    invoicePublicId: formData.get("invoicePublicId") || undefined,
    currency: formData.get("currency"),
    amountMode: formData.get("amountMode"),
    amount: formData.get("amount") || undefined,
    minAmount: formData.get("minAmount") || undefined,
    maxAmount: formData.get("maxAmount") || undefined,
    serviceCode: formData.get("serviceCode") || undefined,
    description: formData.get("description") || undefined,
  });
  if (!parsed.success) {
    return { error: firstZodError(parsed.error) };
  }
  const supabase = await createSessionSupabaseClient();
  if (!supabase) {
    return { error: "Unable to create payment request." };
  }
  const { data, error } = await supabase.rpc("admin_create_payment_request", {
    p_individual_public_id: parsed.data.individualPublicId ?? "",
    p_organization_public_id: parsed.data.organizationPublicId ?? "",
    p_guest_email: parsed.data.guestEmail ?? "",
    p_guest_name: parsed.data.guestName ?? "",
    p_invoice_public_id: parsed.data.invoicePublicId ?? "",
    p_currency: parsed.data.currency,
    p_amount_mode: parsed.data.amountMode,
    p_requested_amount_minor: parsed.data.requestedAmountMinor ?? 0,
    p_min_amount_minor: parsed.data.minAmountMinor ?? 0,
    p_max_amount_minor: parsed.data.maxAmountMinor ?? 0,
    p_service_code: parsed.data.serviceCode ?? "",
    p_description: parsed.data.description ?? "",
    p_expires_at: null as unknown as string,
  });
  if (error || !data || typeof data !== "object" || !("public_id" in data)) {
    return { error: mapFinanceError(error?.message ?? "") };
  }
  redirect(PAYMENT_REQUEST_PATHS.adminDetail(String((data as { public_id: string }).public_id)));
}

export async function adminSetPaymentRequestStatusAction(formData: FormData) {
  const publicId = String(formData.get("publicId") || "");
  const status = String(formData.get("status") || "");
  await requireAdmin(PAYMENT_REQUEST_PATHS.adminDetail(publicId));
  const supabase = await createSessionSupabaseClient();
  if (!supabase) {
    return;
  }
  const { data } = await supabase
    .from("payment_requests")
    .select("id")
    .eq("public_id", publicId)
    .maybeSingle();
  if (!data) {
    return;
  }
  await supabase.rpc("admin_set_payment_request_status", {
    p_request_id: data.id,
    p_status: status,
  });
  redirect(PAYMENT_REQUEST_PATHS.adminDetail(publicId));
}

export async function adminSetProviderStateAction(formData: FormData) {
  const code = String(formData.get("code") || "");
  const state = String(formData.get("state") || "");
  await requireAdmin(PAYMENT_PATHS.adminProviders);
  if (state === "enabled") {
    const adapter = getProviderAdapter(code);
    if (!adapter?.isConfigured()) {
      redirect(PAYMENT_PATHS.adminProviders);
    }
  }
  const supabase = await createSessionSupabaseClient();
  if (!supabase) {
    return;
  }
  await supabase.rpc("admin_set_provider_state", {
    p_code: code,
    p_operational_state: state,
  });
  redirect(PAYMENT_PATHS.adminProviders);
}
