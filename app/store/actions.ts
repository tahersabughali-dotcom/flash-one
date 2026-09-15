"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { firstZodError } from "@/modules/auth";
import { PAYMENT_REQUEST_PATHS } from "@/modules/payment-requests";
import { storeCheckoutSchema } from "@/modules/store";
import { requireSameOriginForPay } from "@/lib/server/payments/origin";
import { createStoreOrder } from "@/lib/server/store/core";
import { sensitiveCookieOptions } from "@/lib/server/http/cookies";

export type StoreFormState = { error: string | null };

export async function checkoutStoreProductAction(
  _previous: StoreFormState,
  formData: FormData,
): Promise<StoreFormState> {
  if (!(await requireSameOriginForPay())) {
    return { error: "Order could not be created." };
  }
  const parsed = storeCheckoutSchema.safeParse({
    productPublicId: formData.get("productPublicId"),
    quantity: formData.get("quantity") || "1",
    currency: formData.get("currency"),
    guestName: formData.get("guestName") || undefined,
    guestEmail: formData.get("guestEmail") || undefined,
    organizationPublicId: formData.get("organizationPublicId") || undefined,
  });
  if (!parsed.success) {
    return { error: firstZodError(parsed.error) };
  }
  const created = await createStoreOrder(parsed.data);
  if ("error" in created) {
    return { error: created.error ?? "Order could not be created." };
  }
  const store = await cookies();
  store.set(
    `fo_store_order_${created.orderPublicId}`,
    created.accessKey,
    sensitiveCookieOptions({ maxAge: 60 * 60 }),
  );
  redirect(PAYMENT_REQUEST_PATHS.payRequest(created.paymentRequestPublicId));
}
