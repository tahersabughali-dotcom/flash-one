"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  AUTH_PATHS,
  firstZodError,
  forgotPasswordSchema,
  getPasswordRecoveryRedirectTo,
  getSafeAppOrigin,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  safeInternalPath,
} from "@/modules/auth";
import {
  clearPasswordRecoveryCookie,
  hasPasswordRecoveryContext,
} from "@/lib/server/auth/recovery";
import { createSessionSupabaseClient } from "@/lib/supabase/server";

const RECOVERY_REQUEST_MESSAGE =
  "If an account exists for this email address, a password reset link has been sent.";
const RESET_SUCCESS_MESSAGE =
  "Your password has been updated. Sign in with your new password.";
const RESET_CONTEXT_MESSAGE =
  "This reset link is invalid or has expired. Request a new password reset.";
const RATE_LIMIT_MESSAGE = "Please wait a moment and try again.";
const GENERIC_AUTH_MESSAGE = "Unable to complete this request. Please try again.";
const REGISTER_NEUTRAL_MESSAGE =
  "If this email can be registered, confirm the message we sent, then sign in.";
const CONFIG_MESSAGE = "Authentication is not configured.";
const ORIGIN_MESSAGE =
  "Password reset is only available from the local development site.";
const PASSWORD_REUSED_MESSAGE =
  "Choose a password that is different from your current password.";

export type AuthFormState = {
  error: string | null;
  message: string | null;
};

function mapAuthMessage(message: string): string {
  const lower = message.toLowerCase();

  if (lower.includes("invalid login")) {
    return "Email or password is incorrect.";
  }
  if (lower.includes("email not confirmed")) {
    return "Confirm your email address before signing in.";
  }
  if (lower.includes("email address") && lower.includes("invalid")) {
    return "Enter a valid email address.";
  }
  if (lower.includes("rate limit") || lower.includes("over_email_send_rate_limit")) {
    return RATE_LIMIT_MESSAGE;
  }
  if (lower.includes("different from the old") || lower.includes("same as the old")) {
    return PASSWORD_REUSED_MESSAGE;
  }

  return GENERIC_AUTH_MESSAGE;
}

function isRateLimited(message: string): boolean {
  const lower = message.toLowerCase();
  return lower.includes("rate limit") || lower.includes("over_email_send_rate_limit");
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
    const lower = error.message.toLowerCase();
    if (lower.includes("already registered") || lower.includes("already been registered")) {
      return { error: null, message: REGISTER_NEUTRAL_MESSAGE };
    }
    return { error: mapAuthMessage(error.message), message: null };
  }

  if (!data.session) {
    return {
      error: null,
      message: REGISTER_NEUTRAL_MESSAGE,
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

export async function forgotPasswordAction(
  _previous: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = forgotPasswordSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return { error: firstZodError(parsed.error), message: null };
  }

  const supabase = await createSessionSupabaseClient();
  if (!supabase) {
    return { error: CONFIG_MESSAGE, message: null };
  }

  const headerList = await headers();
  const origin = getSafeAppOrigin({
    host: headerList.get("host"),
    forwardedHost: headerList.get("x-forwarded-host"),
    forwardedProto: headerList.get("x-forwarded-proto"),
  });

  if (!origin) {
    return { error: ORIGIN_MESSAGE, message: null };
  }

  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: getPasswordRecoveryRedirectTo(origin),
  });

  if (error && isRateLimited(error.message)) {
    return { error: RATE_LIMIT_MESSAGE, message: null };
  }

  return { error: null, message: RECOVERY_REQUEST_MESSAGE };
}

export async function resetPasswordAction(
  _previous: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const allowed = await hasPasswordRecoveryContext();
  if (!allowed) {
    return { error: RESET_CONTEXT_MESSAGE, message: null };
  }

  const parsed = resetPasswordSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { error: firstZodError(parsed.error), message: null };
  }

  const supabase = await createSessionSupabaseClient();
  if (!supabase) {
    return { error: CONFIG_MESSAGE, message: null };
  }

  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (error) {
    return { error: mapAuthMessage(error.message), message: null };
  }

  await supabase.auth.signOut();
  await clearPasswordRecoveryCookie();

  return { error: null, message: RESET_SUCCESS_MESSAGE };
}
