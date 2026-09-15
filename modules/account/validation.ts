import { z } from "zod";
import {
  DEVELOPER_AVAILABILITY,
  MAX_BIO_LENGTH,
  MAX_DEVELOPER_NAME_LENGTH,
  MAX_HEADLINE_LENGTH,
  MAX_ORGANIZATION_NAME_LENGTH,
} from "./constants";

export const individualOnboardingSchema = z.object({
  confirm: z.literal("yes").optional(),
});

export const businessOnboardingSchema = z.object({
  organizationName: z
    .string()
    .trim()
    .min(1, "Enter your organization name.")
    .max(MAX_ORGANIZATION_NAME_LENGTH, "Name is too long."),
});

export const developerOnboardingSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(1, "Enter a display name.")
    .max(MAX_DEVELOPER_NAME_LENGTH, "Name is too long."),
  headline: z
    .string()
    .trim()
    .max(MAX_HEADLINE_LENGTH, "Headline is too long.")
    .optional()
    .transform((value) => (value ? value : undefined)),
  bio: z
    .string()
    .trim()
    .max(MAX_BIO_LENGTH, "Bio is too long.")
    .optional()
    .transform((value) => (value ? value : undefined)),
  availabilityStatus: z.enum(DEVELOPER_AVAILABILITY),
});

export type BusinessOnboardingInput = z.infer<typeof businessOnboardingSchema>;
export type DeveloperOnboardingInput = z.infer<typeof developerOnboardingSchema>;
