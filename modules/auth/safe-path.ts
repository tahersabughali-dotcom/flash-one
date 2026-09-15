const INTERNAL_PATH = /^\/[a-zA-Z0-9/_-]*$/;

/**
 * Allow only same-origin relative paths. Reject protocol-relative and
 * external URLs to prevent open redirects.
 */
export function safeInternalPath(
  value: string | null | undefined,
  fallback: string,
): string {
  if (!value) {
    return fallback;
  }

  const trimmed = value.trim();
  if (
    !trimmed.startsWith("/") ||
    trimmed.startsWith("//") ||
    trimmed.includes("://") ||
    trimmed.includes("\\") ||
    !INTERNAL_PATH.test(trimmed)
  ) {
    return fallback;
  }

  if (
    trimmed === "/login" ||
    trimmed === "/register" ||
    trimmed === "/forgot-password" ||
    trimmed === "/reset-password" ||
    trimmed.startsWith("/auth/")
  ) {
    return fallback;
  }

  return trimmed;
}
