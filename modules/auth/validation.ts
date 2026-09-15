import { z } from "zod";
import {
  MAX_NAME_LENGTH,
  MAX_PASSWORD_LENGTH,
  MIN_PASSWORD_LENGTH,
} from "./constants";

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.email("Enter a valid email address.")),
  password: z
    .string()
    .min(1, "Enter your password.")
    .max(MAX_PASSWORD_LENGTH, "Password is too long."),
  next: z.string().optional(),
});

const passwordField = z
  .string()
  .min(
    MIN_PASSWORD_LENGTH,
    `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
  )
  .max(MAX_PASSWORD_LENGTH, "Password is too long.");

export const registerSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(1, "Enter your full name.")
      .max(MAX_NAME_LENGTH, "Name is too long."),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .pipe(z.email("Enter a valid email address.")),
    password: passwordField,
    confirmPassword: z.string().min(1, "Confirm your password."),
  })
  .refine((value) => value.password === value.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
  });

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.email("Enter a valid email address.")),
});

export const resetPasswordSchema = z
  .object({
    password: passwordField,
    confirmPassword: z.string().min(1, "Confirm your password."),
  })
  .refine((value) => value.password === value.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export function firstZodError(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Check the form and try again.";
}
