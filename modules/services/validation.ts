import { z } from "zod";
import { INVOICE_CURRENCIES, MAX_UNIT_MINOR } from "@/modules/invoices/constants";
import { parseMajorToMinor } from "@/modules/invoices/money";
import {
  CATALOG_CATEGORIES,
  CATALOG_MODES,
  CATALOG_STATUSES,
  MAX_SERVICE_DESCRIPTION_LENGTH,
  MAX_SERVICE_NAME_LENGTH,
  MAX_SERVICE_NOTES_LENGTH,
} from "./constants";

export const catalogServiceUpsertSchema = z
  .object({
    publicId: z.string().trim().optional(),
    name: z
      .string()
      .trim()
      .min(1, "Enter a service name.")
      .max(MAX_SERVICE_NAME_LENGTH, "Name is too long."),
    description: z
      .string()
      .trim()
      .min(1, "Enter a description.")
      .max(MAX_SERVICE_DESCRIPTION_LENGTH, "Description is too long."),
    category: z.enum(CATALOG_CATEGORIES),
    status: z.enum(CATALOG_STATUSES),
    customerVisible: z.boolean(),
    commercialMode: z.enum(CATALOG_MODES),
    defaultCurrency: z.enum(INVOICE_CURRENCIES).optional(),
    defaultPrice: z.string().trim().optional(),
    internalNotes: z
      .string()
      .trim()
      .max(MAX_SERVICE_NOTES_LENGTH, "Notes are too long.")
      .optional()
      .transform((value) => (value ? value : undefined)),
  })
  .superRefine((value, ctx) => {
    if (value.commercialMode === "fixed_price") {
      if (!value.defaultCurrency || !value.defaultPrice) {
        ctx.addIssue({
          code: "custom",
          message: "Fixed-price services need a currency and amount.",
        });
      }
    }
  })
  .transform((value, ctx) => {
    if (value.commercialMode !== "fixed_price") {
      return { ...value, defaultPriceMinor: undefined as number | undefined };
    }
    const minor = parseMajorToMinor(value.defaultPrice ?? "");
    if (minor === null || minor < 0 || minor > MAX_UNIT_MINOR) {
      ctx.addIssue({
        code: "custom",
        message: "Enter a valid amount with up to two decimal places.",
      });
      return z.NEVER;
    }
    return { ...value, defaultPriceMinor: minor };
  });
