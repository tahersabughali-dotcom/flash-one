import { z } from "zod";
import {
  MAX_CHANGE_NOTE_LENGTH,
  MAX_DELIVERABLE_DESCRIPTION_LENGTH,
  MAX_DELIVERABLE_TITLE_LENGTH,
} from "./constants";

export const deliverableWriteSchema = z.object({
  projectPublicId: z.string().min(1),
  title: z
    .string()
    .trim()
    .min(1, "Enter a title.")
    .max(MAX_DELIVERABLE_TITLE_LENGTH, "Title is too long."),
  description: z
    .string()
    .trim()
    .max(MAX_DELIVERABLE_DESCRIPTION_LENGTH, "Description is too long.")
    .optional()
    .transform((value) => (value ? value : undefined)),
  filePublicIds: z.array(z.string()).optional(),
});

export const changeRequestSchema = z.object({
  deliverablePublicId: z.string().min(1),
  note: z
    .string()
    .trim()
    .min(1, "Explain the changes needed.")
    .max(MAX_CHANGE_NOTE_LENGTH, "Note is too long."),
});
