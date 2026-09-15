import { z } from "zod";
import { MAX_MESSAGE_LENGTH } from "./constants";

export const messageWriteSchema = z.object({
  projectPublicId: z.string().min(1),
  body: z
    .string()
    .trim()
    .min(1, "Enter a message.")
    .max(MAX_MESSAGE_LENGTH, "Message is too long."),
});
