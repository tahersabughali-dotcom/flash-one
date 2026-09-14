/**
 * Validation boundary for future server input.
 *
 * Do not accept raw request bodies or form values in business modules.
 * Validate at the edge of each server action/route handler first.
 *
 * Zod (or equivalent) should be added only when the first real
 * mutation endpoint exists. This file defines the contract only.
 */
export type ValidationIssue = {
  path: string;
  message: string;
};

export type ValidationResult<T> =
  | { ok: true; value: T }
  | { ok: false; issues: ValidationIssue[] };
