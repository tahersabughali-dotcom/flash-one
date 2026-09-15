/**
 * Environment-aware flags for application-controlled sensitive cookies.
 * Production HTTPS cookies must be Secure. Local HTTP development may not.
 */

export function cookieSecureFlag(nodeEnv: string | undefined = process.env.NODE_ENV) {
  return nodeEnv === "production";
}

export function sensitiveCookieOptions(input: {
  maxAge: number;
  path?: string;
  nodeEnv?: string;
}) {
  return {
    httpOnly: true as const,
    sameSite: "lax" as const,
    path: input.path ?? "/",
    maxAge: input.maxAge,
    secure: cookieSecureFlag(input.nodeEnv),
  };
}

export function supabaseAuthCookieOptions(nodeEnv: string | undefined = process.env.NODE_ENV) {
  return {
    path: "/",
    sameSite: "lax" as const,
    secure: cookieSecureFlag(nodeEnv),
  };
}
