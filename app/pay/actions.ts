"use server";

import { redirect } from "next/navigation";
import { firstZodError } from "@/modules/auth";
import { checkoutSchema, guestPaySchema, PAYMENT_REQUEST_PATHS } from "@/modules/payment-requests";
import { requireSameOriginForPay } from "@/lib/server/payments/origin";
import {
  getCheckoutClient,
  startCheckout,
} from "@/lib/server/payments/core";

export type PayFormState = {
  error: string | null;
};

export async function createGuestPaymentAction(
  _previous: PayFormState,
  formData: FormData,
): Promise<PayFormState> {
  if (!(await requireSameOriginForPay())) {
    return { error: "Payment could not be started." };
  }
  const parsed = guestPaySchema.safeParse({
    guestName: formData.get("guestName"),
    guestEmail: formData.get("guestEmail"),
    currency: formData.get("currency"),
    amount: formData.get("amount"),
    serviceCode: formData.get("serviceCode"),
  });
  if (!parsed.success) {
    return { error: firstZodError(parsed.error) };
  }
  const supabase = await getCheckoutClient();
  if (!supabase) {
    return { error: "Payment could not be started." };
  }
  const { data, error } = await supabase.rpc("public_create_guest_payment_request", {
    p_guest_name: parsed.data.guestName,
    p_guest_email: parsed.data.guestEmail,
    p_currency: parsed.data.currency,
    p_amount_minor: parsed.data.amount,
    p_service_code: parsed.data.serviceCode,
    p_description: "",
  });
  if (error || !data || typeof data !== "object" || !("public_id" in data)) {
    return { error: "Payment could not be started." };
  }
  redirect(PAYMENT_REQUEST_PATHS.payRequest(String((data as { public_id: string }).public_id)));
}

export async function startCheckoutAction(
  _previous: PayFormState,
  formData: FormData,
): Promise<PayFormState> {
  if (!(await requireSameOriginForPay())) {
    return { error: "Payment could not be started." };
  }
  const parsed = checkoutSchema.safeParse({
    requestPublicId: formData.get("requestPublicId"),
    provider: formData.get("provider"),
    amount: formData.get("amount") || undefined,
    guestName: formData.get("guestName") || undefined,
    guestEmail: formData.get("guestEmail") || undefined,
  });
  if (!parsed.success) {
    return { error: firstZodError(parsed.error) };
  }
  const result = await startCheckout({
    requestPublicId: parsed.data.requestPublicId,
    provider: parsed.data.provider,
    amountRaw: parsed.data.amount,
    guestName: parsed.data.guestName,
    guestEmail: parsed.data.guestEmail,
  });
  if ("error" in result && result.error) {
    return { error: result.error };
  }
  if ("redirectTo" in result && result.redirectTo) {
    redirect(result.redirectTo);
  }
  return { error: "Payment could not be started." };
}
