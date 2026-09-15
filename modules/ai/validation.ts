import { z } from "zod";
import {
  MAX_DETAILS_LENGTH,
  MAX_SUMMARY_LENGTH,
  MAX_TITLE_LENGTH,
  SERVICE_CATEGORIES,
} from "@/modules/work-requests/constants";

export const aiMessageSchema = z.object({
  conversationPublicId: z.string().trim().regex(/^AIC-[A-F0-9]{12}$/).optional(),
  body: z.string().trim().min(1).max(8000),
  idea: z.string().trim().max(1000).optional(),
  goal: z.string().trim().max(1000).optional(),
  businessContext: z.string().trim().max(2000).optional(),
  desiredOutcome: z.string().trim().max(1000).optional(),
});

export const aiWorkRequestConfirmSchema = z.object({
  conversationPublicId: z.string().trim().regex(/^AIC-[A-F0-9]{12}$/),
  owner: z.string().min(1, "Choose who this request is for."),
});

export const projectIdeaWorksheetSchema = z.object({
  owner: z.string().min(1, "Choose who this request is for."),
  serviceCategory: z.enum(SERVICE_CATEGORIES),
  title: z.string().trim().min(1).max(MAX_TITLE_LENGTH),
  summary: z.string().trim().min(1).max(MAX_SUMMARY_LENGTH),
  details: z.string().trim().max(MAX_DETAILS_LENGTH).optional(),
});
