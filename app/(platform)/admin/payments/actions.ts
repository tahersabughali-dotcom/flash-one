"use server";

import { redirect } from "next/navigation";
import { firstZodError } from "@/modules/auth";
import { AUTH_PATHS } from "@/modules/auth/constants";
import { PAYMENT_PATHS, manualPaymentSchema } from "@/modules/payments";
import { requirePlatformAdmin } from "@/lib/server/auth";
import { createSessionSupabaseClient } from "@/lib/supabase/server";
import { mapFinanceError, type AdminFinanceFormState } from "../finance-errors";

async function requireAdmin(nextPath: string) {
  const access = await requirePlatformAdmin(nextPath);
  if (!access.authorized) {
    redirect(AUTH_PATHS.admin);
  }
}

export async function adminRecordManualPaymentAction(
  _previous: AdminFinanceFormState,
  formData: FormData,
): Promise<AdminFinanceFormState> {
  await requireAdmin(PAYMENT_PATHS.adminNew);
  const parsed = manualPaymentSchema.safeParse({
    individualPublicId: formData.get("individualPublicId") || undefined,
    organizationPublicId: formData.get("organizationPublicId") || undefined,
    currency: formData.get("currency"),
    amount: formData.get("amount"),
    notes: formData.get("notes") || undefined,
    manualReference: formData.get("manualReference") || undefined,
    receivedAt: formData.get("receivedAt") || undefined,
  });
  if (!parsed.success) {
    return { error: firstZodError(parsed.error) };
  }
  const supabase = await createSessionSupabaseClient();
  if (!supabase) {
    return { error: "Unable to record payment." };
  }
  const { data, error } = await supabase.rpc("admin_record_manual_payment_evidence", {
    p_individual_public_id: parsed.data.individualPublicId ?? "",
    p_organization_public_id: parsed.data.organizationPublicId ?? "",
    p_currency: parsed.data.currency,
    p_amount_minor: parsed.data.amount,
    p_notes: parsed.data.notes ?? "",
    p_manual_reference: parsed.data.manualReference ?? "",
    p_received_at: parsed.data.receivedAt ?? new Date().toISOString(),
  });
  if (error || !data) {
    return { error: mapFinanceError(error?.message ?? "") };
  }
  redirect(PAYMENT_PATHS.adminDetail(data.public_id));
}
