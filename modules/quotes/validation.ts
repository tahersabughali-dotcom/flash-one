import { z } from "zod";
import {
  MAX_CUSTOMER_NOTES_LENGTH,
  MAX_LINE_DESCRIPTION_LENGTH,
  MAX_LINE_QUANTITY,
  MAX_UNIT_MINOR,
  QUOTE_CURRENCIES,
} from "./constants";
import { parseMajorToMinor } from "./money";

const quoteLineSchema = z.object({
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

export const quoteIssueSchema = z.object({
  workRequestPublicId: z.string().min(1),
  currency: z.enum(QUOTE_CURRENCIES),
  validUntil: z
    .string()
    .min(1, "Enter a valid-until date.")
    .refine((value) => !Number.isNaN(Date.parse(value)), "Enter a valid date."),
  customerNotes: z
    .string()
    .trim()
    .max(MAX_CUSTOMER_NOTES_LENGTH, "Notes are too long.")
    .optional()
    .transform((value) => (value ? value : undefined)),
  lines: z.array(quoteLineSchema).min(1, "Add at least one line item."),
});

export type QuoteIssueInput = z.infer<typeof quoteIssueSchema>;
