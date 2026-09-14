"use server";

import { redirect } from "next/navigation";
import {
  AUTH_PATHS,
  firstZodError,
  loginSchema,
  registerSchema,
  safeInternalPath,
} from "@/modules/auth";
import { createSessionSupabaseClient } from "@/lib/supabase/server";

export type AuthFormState = {
  error: string | null;
  message: string | null;
};

function mapAuthMessage(message: string): string {
  const lower = message.toLowerCase();

  if (lower.includes("invalid login")) {
    return "Email or password is incorrect.";
  }
  if (lower.includes("already registered") || lower.includes("already been registered")) {
    return "An account with this email already exists.";
  }
  if (lower.includes("email not confirmed")) {
    return "Confirm your email address before signing in.";
  }
  if (lower.includes("email address") && lower.includes("invalid")) {
    return "Enter a valid email address.";
  }

  return "Unable to complete this request. Please try again.";
}

export async function loginAction(
  _previous: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    next: formData.get("next") || undefined,
  });

  if (!parsed.success) {
    return { error: firstZodError(parsed.error), message: null };
  }

  const supabase = await createSessionSupabaseClient();
  if (!supabase) {
    return {
      error: "Authentication is not configured.",
      message: null,
    };
  }

  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return { error: mapAuthMessage(error.message), message: null };
  }

  redirect(safeInternalPath(parsed.data.next, AUTH_PATHS.app));
}

export async function registerAction(
  _previous: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = registerSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { error: firstZodError(parsed.error), message: null };
  }

  const supabase = await createSessionSupabaseClient();
  if (!supabase) {
    return {
      error: "Authentication is not configured.",
      message: null,
    };
  }

  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        full_name: parsed.data.fullName,
      },
    },
  });

  if (error) {
    return { error: mapAuthMessage(error.message), message: null };
  }

  if (!data.session) {
    return {
      error: null,
      message:
        "Account created. Confirm your email address, then sign in.",
    };
  }

  redirect(AUTH_PATHS.app);
}

export async function logoutAction() {
  const supabase = await createSessionSupabaseClient();
  if (supabase) {
    await supabase.auth.signOut();
  }

  redirect(AUTH_PATHS.login);
}
