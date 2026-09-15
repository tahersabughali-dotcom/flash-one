import { headers } from "next/headers";
import { getSafeAppOrigin } from "@/modules/auth";

/**
 * Fail-closed same-origin check for browser payment/store mutations.
 * Provider webhooks must not use this; they have their own verification.
 */
export function isTrustedBrowserOrigin(input: {
  originHeader: string | null;
  host: string | null;
  forwardedHost: string | null;
  forwardedProto: string | null;
}): boolean {
  const originHeader = input.originHeader?.trim() ?? "";
  if (!originHeader) {
    return false;
  }

  let parsed: URL;
  try {
    parsed = new URL(originHeader);
  } catch {
    return false;
  }

  if (parsed.username || parsed.password) {
    return false;
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return false;
  }
  if (parsed.search || parsed.hash || (parsed.pathname !== "/" && parsed.pathname !== "")) {
    return false;
  }

  const expected = getSafeAppOrigin({
    host: input.host,
    forwardedHost: input.forwardedHost,
    forwardedProto: input.forwardedProto,
  });
  if (!expected) {
    return false;
  }

  return originHeader.replace(/\/$/, "") === expected;
}

export async function requireSameOriginForPay(): Promise<boolean> {
  const headerStore = await headers();
  return isTrustedBrowserOrigin({
    originHeader: headerStore.get("origin"),
    host: headerStore.get("host"),
    forwardedHost: headerStore.get("x-forwarded-host"),
    forwardedProto: headerStore.get("x-forwarded-proto"),
  });
}
