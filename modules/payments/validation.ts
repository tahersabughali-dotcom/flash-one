import { z } from "zod";
import { INVOICE_CURRENCIES, MAX_UNIT_MINOR } from "@/modules/invoices/constants";
import { parseMajorToMinor } from "@/modules/invoices/money";

export const manualPaymentSchema = z
  .object({
    individualPublicId: z.string().trim().optional(),
    organizationPublicId: z.string().trim().optional(),
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
  })
  .superRefine((value, ctx) => {
    const hasIndividual = Boolean(value.individualPublicId);
    const hasOrganization = Boolean(value.organizationPublicId);
    if (hasIndividual === hasOrganization) {
      ctx.addIssue({
        code: "custom",
        message: "Choose either a customer or a business.",
      });
    }
  });

export const allocatePaymentSchema = z.object({
  invoicePublicId: z.string().min(1),
  paymentPublicId: z.string().trim().min(1, "Enter a payment reference."),
  amount: z
    .string()
    .trim()
    .min(1, "Enter an allocation amount.")
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
});
