import { z } from "zod";
import { INVOICE_CURRENCIES, MAX_UNIT_MINOR } from "@/modules/invoices/constants";
import { parseMajorToMinor } from "@/modules/invoices/money";
import { ADJUSTMENT_KINDS, MAX_ADJUSTMENT_REASON_LENGTH } from "./constants";

export const adjustmentCreateSchema = z.object({
  kind: z.enum(ADJUSTMENT_KINDS),
  currency: z.enum(INVOICE_CURRENCIES),
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
    .max(MAX_ADJUSTMENT_REASON_LENGTH, "Reason is too long."),
  paymentPublicId: z.string().trim().optional(),
  invoicePublicId: z.string().trim().optional(),
});
