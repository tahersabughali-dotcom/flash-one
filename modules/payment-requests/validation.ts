import { z } from "zod";
import { INVOICE_CURRENCIES, MAX_UNIT_MINOR } from "@/modules/invoices/constants";
import { parseMajorToMinor } from "@/modules/invoices/money";
import { PAYMENT_SERVICES } from "./constants";

export const paymentRequestCreateSchema = z
  .object({
    individualPublicId: z.string().trim().optional(),
    organizationPublicId: z.string().trim().optional(),
    guestEmail: z.string().trim().email("Enter a valid email.").optional().or(z.literal("")),
    guestName: z.string().trim().max(120).optional(),
    invoicePublicId: z.string().trim().optional(),
    currency: z.enum(INVOICE_CURRENCIES),
    amountMode: z.enum(["fixed", "customer_entered"]),
    amount: z.string().trim().optional(),
    minAmount: z.string().trim().optional(),
    maxAmount: z.string().trim().optional(),
    serviceCode: z.enum(PAYMENT_SERVICES).optional(),
    description: z.string().trim().max(400).optional(),
  })
  .superRefine((value, ctx) => {
    const hasInvoice = Boolean(value.invoicePublicId);
    const hasIndividual = Boolean(value.individualPublicId);
    const hasOrganization = Boolean(value.organizationPublicId);
    const hasGuest = Boolean(value.guestEmail);
    if (!hasInvoice && !hasIndividual && !hasOrganization && !hasGuest) {
      ctx.addIssue({
        code: "custom",
        message: "Select a customer, business, invoice, or guest email.",
      });
    }
    if (value.amountMode === "fixed" && !hasInvoice && !value.amount) {
      ctx.addIssue({ code: "custom", message: "Enter an amount." });
    }
  })
  .transform((value, ctx) => {
    const toMinor = (raw: string | undefined) => {
      if (!raw) {
        return undefined;
      }
      const minor = parseMajorToMinor(raw);
      if (minor === null || minor <= 0 || minor > MAX_UNIT_MINOR) {
        ctx.addIssue({
          code: "custom",
          message: "Enter a valid amount with up to two decimal places.",
        });
        return z.NEVER;
      }
      return minor;
    };
    return {
      ...value,
      guestEmail: value.guestEmail || undefined,
      requestedAmountMinor: toMinor(value.amount),
      minAmountMinor: toMinor(value.minAmount),
      maxAmountMinor: toMinor(value.maxAmount),
    };
  });

export const guestPaySchema = z.object({
  guestName: z.string().trim().min(1, "Enter your name.").max(120),
  guestEmail: z.string().trim().email("Enter a valid email."),
  currency: z.enum(INVOICE_CURRENCIES),
  amount: z
    .string()
    .trim()
    .min(1, "Enter an amount.")
    .transform((value, ctx) => {
      const minor = parseMajorToMinor(value);
      if (minor === null || minor < 100 || minor > MAX_UNIT_MINOR) {
        ctx.addIssue({
          code: "custom",
          message: "Enter a valid amount with up to two decimal places.",
        });
        return z.NEVER;
      }
      return minor;
    }),
  serviceCode: z.enum(PAYMENT_SERVICES),
});

export const checkoutSchema = z.object({
  requestPublicId: z.string().min(1),
  provider: z.string().min(1),
  amount: z.string().optional(),
  guestName: z.string().trim().optional(),
  guestEmail: z.string().trim().optional(),
});
