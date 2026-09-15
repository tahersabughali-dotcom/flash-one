import { z } from "zod";
import {
  INVOICE_CURRENCIES,
  MAX_INVOICE_NOTES_LENGTH,
  MAX_LINE_DESCRIPTION_LENGTH,
  MAX_LINE_QUANTITY,
  MAX_UNIT_MINOR,
  MAX_VOID_REASON_LENGTH,
} from "./constants";
import { parseMajorToMinor } from "./money";

const invoiceLineSchema = z.object({
  description: z
    .string()
    .trim()
    .min(1, "Enter a line description.")
    .max(MAX_LINE_DESCRIPTION_LENGTH, "Line description is too long."),
  quantity: z.coerce
    .number()
    .int("Quantity must be a whole number.")
    .min(1, "Quantity must be at least 1.")
    .max(MAX_LINE_QUANTITY, "Quantity is too large."),
  unitAmount: z
    .string()
    .trim()
    .min(1, "Enter a unit amount.")
    .transform((value, ctx) => {
      const minor = parseMajorToMinor(value);
      if (minor === null || minor > MAX_UNIT_MINOR) {
        ctx.addIssue({
          code: "custom",
          message: "Enter a valid amount with up to two decimal places.",
        });
        return z.NEVER;
      }
      return minor;
    }),
});

export const invoiceCreateSchema = z
  .object({
    individualPublicId: z.string().trim().optional(),
    organizationPublicId: z.string().trim().optional(),
    quotePublicId: z.string().trim().optional(),
    projectPublicId: z.string().trim().optional(),
    contractPublicId: z.string().trim().optional(),
    currency: z.enum(INVOICE_CURRENCIES),
    dueDate: z
      .string()
      .optional()
      .transform((value) => (value && value.trim() ? value : undefined)),
    notes: z
      .string()
      .trim()
      .max(MAX_INVOICE_NOTES_LENGTH, "Notes are too long.")
      .optional()
      .transform((value) => (value ? value : undefined)),
    lines: z.array(invoiceLineSchema),
  })
  .superRefine((value, ctx) => {
    const hasQuote = Boolean(value.quotePublicId);
    const hasIndividual = Boolean(value.individualPublicId);
    const hasOrganization = Boolean(value.organizationPublicId);
    if (hasIndividual && hasOrganization) {
      ctx.addIssue({
        code: "custom",
        message: "Choose either a customer or a business, not both.",
      });
    }
    if (!hasQuote && !hasIndividual && !hasOrganization) {
      ctx.addIssue({
        code: "custom",
        message: "Select a customer, a business, or an accepted quote.",
      });
    }
    if (!hasQuote && value.lines.length < 1) {
      ctx.addIssue({
        code: "custom",
        message: "Add at least one line item.",
      });
    }
  });

export const invoiceVoidSchema = z.object({
  publicId: z.string().min(1),
  reason: z
    .string()
    .trim()
    .max(MAX_VOID_REASON_LENGTH, "Reason is too long.")
    .optional()
    .transform((value) => (value ? value : undefined)),
});

export type InvoiceCreateInput = z.infer<typeof invoiceCreateSchema>;
