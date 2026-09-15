import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { AUTH_PATHS } from "@/modules/auth";
import {
  PASSWORD_RECOVERY_COOKIE,
  getPasswordRecoveryCookieOptions,
} from "@/lib/server/auth/recovery";
import { getSupabaseAuthConfig } from "@/lib/supabase/env";
import type { SerializeOptions } from "cookie";

function toResponseCookieOptions(options?: Partial<SerializeOptions>) {
  if (!options) {
    return undefined;
  }

  const { sameSite, ...rest } = options;
  return {
    ...rest,
    ...(typeof sameSite === "string" ? { sameSite } : {}),
  };
}

/**
 * Exchanges a recovery authorization code or recovery token hash.
 * Always continues to /reset-password or /forgot-password on this origin.
 */
export async function GET(request: NextRequest) {
  const successUrl = request.nextUrl.clone();
  successUrl.pathname = AUTH_PATHS.resetPassword;
  successUrl.search = "";
  successUrl.hash = "";

  const failureUrl = request.nextUrl.clone();
  failureUrl.pathname = AUTH_PATHS.forgotPassword;
  failureUrl.search = "";
  failureUrl.hash = "";

  const code = request.nextUrl.searchParams.get("code");
  const tokenHash = request.nextUrl.searchParams.get("token_hash");
  const type = request.nextUrl.searchParams.get("type");

  const config = getSupabaseAuthConfig();
  if (!config) {
    return NextResponse.redirect(failureUrl);
  }

  const pendingCookies: Array<{
    name: string;
    value: string;
    options?: Partial<SerializeOptions>;
  }> = [];
  const pendingHeaders: Array<[string, string]> = [];

  const supabase = createServerClient(config.url, config.publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        cookiesToSet.forEach(({ name, value, options }) => {
          pendingCookies.push({ name, value, options });
        });
        Object.entries(headers).forEach((entry) => {
          pendingHeaders.push(entry);
        });
      },
    },
  });

  let recovered = false;

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    recovered = !error;
  } else if (tokenHash && type === "recovery") {
    const { error } = await supabase.auth.verifyOtp({
      type: "recovery",
      token_hash: tokenHash,
    });
    recovered = !error;
  }

  const response = NextResponse.redirect(recovered ? successUrl : failureUrl);

  pendingCookies.forEach(({ name, value, options }) => {
    response.cookies.set(name, value, toResponseCookieOptions(options));
  });
  pendingHeaders.forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  if (recovered) {
    response.cookies.set(
      PASSWORD_RECOVERY_COOKIE,
      "1",
      getPasswordRecoveryCookieOptions(),
    );
  }

  return response;
}
