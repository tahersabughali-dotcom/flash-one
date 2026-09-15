import { z } from "zod";
import {
  MAX_TASK_DESCRIPTION_LENGTH,
  MAX_TASK_TITLE_LENGTH,
  TASK_PRIORITIES,
  TASK_STATUSES,
} from "./constants";

export const taskWriteSchema = z.object({
  projectPublicId: z.string().min(1),
  taskPublicId: z.string().optional(),
  title: z
    .string()
    .trim()
    .min(1, "Enter a task title.")
    .max(MAX_TASK_TITLE_LENGTH, "Title is too long."),
  description: z
    .string()
    .trim()
    .max(MAX_TASK_DESCRIPTION_LENGTH, "Description is too long.")
    .optional()
    .transform((value) => (value ? value : undefined)),
  status: z.enum(TASK_STATUSES),
  priority: z.enum(TASK_PRIORITIES),
  dueAt: z
    .string()
    .optional()
    .transform((value) => (value ? value : undefined)),
  customerVisible: z.enum(["true", "false"]).transform((value) => value === "true"),
});
