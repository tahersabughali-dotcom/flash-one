/**
 * Shared public runtime configuration for Supabase Auth.
 *
 * The publishable key is safe for the browser only because RLS denies
 * unauthorized access. It is not a service-role secret.
 */

export type SupabaseAuthConfig = {
  url: string;
  publishableKey: string;
};

function readNonEmpty(name: string): string | null {
  const value = process.env[name]?.trim();
  return value ? value : null;
}

export function getSupabaseAuthCookieOptions() {
  return {
    path: "/",
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
  };
}

export function getSupabaseAuthConfig(): SupabaseAuthConfig | null {
  const url =
    readNonEmpty("NEXT_PUBLIC_SUPABASE_URL") ?? readNonEmpty("SUPABASE_URL");
  const publishableKey =
    readNonEmpty("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY") ??
    readNonEmpty("SUPABASE_PUBLISHABLE_KEY");

  if (!url || !publishableKey) {
    return null;
  }

  return { url, publishableKey };
}
