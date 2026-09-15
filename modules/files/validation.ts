import { z } from "zod";
import { FILE_MAX_BYTES, FILE_VISIBILITIES } from "./constants";
import { canonicalMimeForFilename } from "./filename";

export const fileUploadMetaSchema = z.object({
  projectPublicId: z.string().min(1),
  visibility: z.enum(FILE_VISIBILITIES).optional(),
  filename: z
    .string()
    .trim()
    .min(1)
    .max(180)
    .refine((value) => canonicalMimeForFilename(value) !== null, "That file type is not accepted."),
  size: z.number().int().min(1, "Empty files are not accepted.").max(FILE_MAX_BYTES),
});
