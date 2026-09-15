import { z } from "zod";
import { INVOICE_CURRENCIES, MAX_UNIT_MINOR } from "@/modules/invoices/constants";
import { parseMajorToMinor } from "@/modules/invoices/money";

export const reconciliationCreateSchema = z.object({
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
  notes: z.string().trim().max(400).optional(),
});

export const reconciliationMatchSchema = z.object({
  itemPublicId: z.string().min(1),
  paymentPublicId: z.string().trim().min(1, "Enter a payment reference."),
});
