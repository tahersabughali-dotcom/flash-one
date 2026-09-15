import { z } from "zod";
import { INVOICE_CURRENCIES } from "@/modules/invoices";
import {
  COMMERCIAL_MODES,
  PRODUCT_TYPES,
  QUANTITY_MODES,
} from "./constants";

export const storeSlugSchema = z
  .string()
  .trim()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use a lowercase slug with hyphens only.")
  .min(3, "Slug is too short.")
  .max(80, "Slug is too long.");

export const storeCheckoutSchema = z.object({
  productPublicId: z
    .string()
    .trim()
    .regex(/^PRD-[A-F0-9]{12}$/, "Product is not available."),
  quantity: z.coerce.number().int().min(1).max(20),
  currency: z.enum(INVOICE_CURRENCIES),
  guestName: z.string().trim().max(120).optional(),
  guestEmail: z.string().trim().email().max(254).optional(),
  organizationPublicId: z.string().trim().max(40).optional(),
});

export const storeProductUpsertSchema = z.object({
  publicId: z.string().trim().optional(),
  slug: storeSlugSchema,
  name: z.string().trim().min(1).max(160),
  shortDescription: z.string().trim().min(1).max(280),
  description: z.string().trim().max(4000).optional(),
  productType: z.enum(PRODUCT_TYPES),
  commercialMode: z.enum(COMMERCIAL_MODES),
  quantityMode: z.enum(QUANTITY_MODES),
  customerVisible: z.boolean(),
});

export const storePriceSchema = z.object({
  productPublicId: z.string().trim().regex(/^PRD-[A-F0-9]{12}$/),
  currency: z.enum(INVOICE_CURRENCIES),
  amount: z.string().trim().min(1),
  active: z.boolean(),
});
