import { z } from "zod";
import {
  DEVELOPER_AVAILABILITY,
  MAX_BIO_LENGTH,
  MAX_COUNTRY_LENGTH,
  MAX_DEVELOPER_NAME_LENGTH,
  MAX_HEADLINE_LENGTH,
  MAX_ORGANIZATION_DESCRIPTION_LENGTH,
  MAX_ORGANIZATION_NAME_LENGTH,
  MAX_PORTFOLIO_LINKS,
  MAX_SKILL_LENGTH,
  MAX_SKILLS,
  MAX_TIMEZONE_LENGTH,
} from "./constants";

export const profileNameSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, "Enter your name.")
    .max(MAX_DEVELOPER_NAME_LENGTH, "Name is too long."),
});

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

export const organizationProfileSchema = z.object({
  organizationPublicId: z.string().min(1),
  name: z
    .string()
    .trim()
    .min(1, "Enter the organization name.")
    .max(MAX_ORGANIZATION_NAME_LENGTH, "Name is too long."),
  website: z
    .string()
    .trim()
    .max(300)
    .optional()
    .transform((value) => (value ? value : undefined))
    .refine(
      (value) => !value || /^https:\/\/[^\s]+$/i.test(value),
      "Use a https:// website address.",
    ),
  country: z
    .string()
    .trim()
    .max(MAX_COUNTRY_LENGTH)
    .optional()
    .transform((value) => (value ? value : undefined)),
  description: z
    .string()
    .trim()
    .max(MAX_ORGANIZATION_DESCRIPTION_LENGTH)
    .optional()
    .transform((value) => (value ? value : undefined)),
});

export const invitationEmailSchema = z.object({
  organizationPublicId: z.string().min(1),
  email: z.string().trim().email("Enter a valid email address.").toLowerCase(),
});

export const invitationAcceptSchema = z.object({
  token: z.string().trim().min(32, "That invitation is not valid."),
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

export const developerProfileSchema = z
  .object({
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
    country: z
      .string()
      .trim()
      .max(MAX_COUNTRY_LENGTH)
      .optional()
      .transform((value) => (value ? value : undefined)),
    timezone: z
      .string()
      .trim()
      .max(MAX_TIMEZONE_LENGTH)
      .optional()
      .transform((value) => (value ? value : undefined)),
    skills: z.string().optional(),
    linkLabels: z.array(z.string()).optional(),
    linkUrls: z.array(z.string()).optional(),
  })
  .superRefine((value, ctx) => {
    for (const url of value.linkUrls ?? []) {
      const trimmed = url.trim();
      if (trimmed && !/^https:\/\/[^\s]+$/i.test(trimmed)) {
        ctx.addIssue({
          code: "custom",
          path: ["linkUrls"],
          message: "Portfolio links must start with https://",
        });
      }
    }
  })
  .transform((value) => ({
    displayName: value.displayName,
    headline: value.headline,
    bio: value.bio,
    availabilityStatus: value.availabilityStatus,
    country: value.country,
    timezone: value.timezone,
    skills: (value.skills ?? "")
      .split(/[\n,]/)
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, MAX_SKILLS)
      .map((item) => item.slice(0, MAX_SKILL_LENGTH)),
    links: (value.linkUrls ?? [])
      .map((url, index) => ({
        label: (value.linkLabels?.[index] ?? "Link").trim() || "Link",
        url: url.trim(),
      }))
      .filter((link) => link.url)
      .slice(0, MAX_PORTFOLIO_LINKS),
  }));

export const assignmentSchema = z.object({
  projectPublicId: z.string().min(1),
  developerPublicId: z.string().min(1),
});

export const adminSearchSchema = z.object({
  q: z
    .string()
    .trim()
    .max(80)
    .transform((value) => value.replace(/[^a-zA-Z0-9 _.-]/g, "")),
});

export type BusinessOnboardingInput = z.infer<typeof businessOnboardingSchema>;
export type DeveloperOnboardingInput = z.infer<typeof developerOnboardingSchema>;
