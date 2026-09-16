import { z } from "zod";
import { MAX_UNIT_MINOR } from "@/modules/invoices/constants";
import { parseMajorToMinor } from "@/modules/invoices/money";
import {
  MAX_CREDIT_NOTE_NOTES_LENGTH,
  MAX_CREDIT_NOTE_REASON_LENGTH,
} from "./constants";

export const creditNoteCreateSchema = z.object({
  invoicePublicId: z.string().trim().min(1, "Enter an invoice reference."),
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
    .max(MAX_CREDIT_NOTE_REASON_LENGTH, "Reason is too long."),
  notes: z
    .string()
    .trim()
    .max(MAX_CREDIT_NOTE_NOTES_LENGTH, "Notes are too long.")
    .optional()
    .transform((value) => (value ? value : undefined)),
});
