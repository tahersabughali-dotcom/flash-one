import { z } from "zod";
import { PROJECT_STATUSES } from "./constants";

export const projectStatusSchema = z.enum(PROJECT_STATUSES);
