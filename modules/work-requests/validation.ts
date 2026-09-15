import { z } from "zod";
import {
  MAX_BUDGET_LENGTH,
  MAX_DETAILS_LENGTH,
  MAX_SUMMARY_LENGTH,
  MAX_TIMELINE_LENGTH,
  MAX_TITLE_LENGTH,
  SERVICE_CATEGORIES,
  WORK_REQUEST_STATUSES,
} from "./constants";

export const workRequestCreateSchema = z
  .object({
    owner: z.string().min(1, "Choose who this request is for."),
    serviceCategory: z.enum(SERVICE_CATEGORIES),
    title: z
      .string()
      .trim()
      .min(1, "Enter a title.")
      .max(MAX_TITLE_LENGTH, "Title is too long."),
    summary: z
      .string()
      .trim()
      .min(1, "Enter a short description.")
      .max(MAX_SUMMARY_LENGTH, "Description is too long."),
    details: z
      .string()
      .trim()
      .max(MAX_DETAILS_LENGTH, "Details are too long.")
      .optional()
      .transform((value) => (value ? value : undefined)),
    budgetIndication: z
      .string()
      .trim()
      .max(MAX_BUDGET_LENGTH, "Budget is too long.")
      .optional()
      .transform((value) => (value ? value : undefined)),
    desiredTimeline: z
      .string()
      .trim()
      .max(MAX_TIMELINE_LENGTH, "Timeline is too long.")
      .optional()
      .transform((value) => (value ? value : undefined)),
  });

export const workRequestStatusSchema = z.enum(WORK_REQUEST_STATUSES);

export type WorkRequestCreateInput = z.infer<typeof workRequestCreateSchema>;
