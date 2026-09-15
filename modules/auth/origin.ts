const DEV_HOSTS = new Set(["localhost", "127.0.0.1"]);

/**
 * Build the current app origin for development recovery emails.
 * Only localhost/127.0.0.1 are accepted so Host cannot become an open redirect.
 */
export function getSafeAppOrigin(input: {
  host: string | null;
  forwardedHost: string | null;
  forwardedProto: string | null;
}): string | null {
  const rawHost = (input.forwardedHost ?? input.host ?? "")
    .split(",")[0]
    .trim();
  if (!rawHost) {
    return null;
  }

  const hostname = rawHost.split(":")[0]?.toLowerCase();
  if (!hostname || !DEV_HOSTS.has(hostname)) {
    return null;
  }

  const proto = (input.forwardedProto ?? "http").split(",")[0].trim();
  if (proto !== "http" && proto !== "https") {
    return null;
  }

  return `${proto}://${rawHost}`;
}

export function getPasswordRecoveryRedirectTo(origin: string): string {
  return `${origin.replace(/\/$/, "")}/auth/callback`;
}
