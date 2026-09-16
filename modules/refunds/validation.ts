import { z } from "zod";
import { MAX_UNIT_MINOR } from "@/modules/invoices/constants";
import { parseMajorToMinor } from "@/modules/invoices/money";
import { MAX_REFUND_REASON_LENGTH, REFUND_STATUSES } from "./constants";

export const refundCreateSchema = z.object({
  paymentPublicId: z.string().trim().min(1, "Enter a payment reference."),
  amount: z
    .string()
    .trim()
    .min(1, "Enter an amount.")
    .transform((value, ctx) => {
      const minor = parseMajorToMinor(value);
      if (minor === null || minor <= 0 || minor > MAX_UNIT_MINOR) {
        ctx.addIssue({
          code: "custom",
          message: "Enter a valid amount with up to two decimal places.",
        });
        return z.NEVER;
      }
      return minor;
    }),
  reason: z
    .string()
    .trim()
    .min(1, "Enter a reason.")
    .max(MAX_REFUND_REASON_LENGTH, "Reason is too long."),
  status: z.enum(REFUND_STATUSES),
});
