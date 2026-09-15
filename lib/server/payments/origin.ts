import { headers } from "next/headers";
import { getSafeAppOrigin } from "@/modules/auth";

export async function requireSameOriginForPay(): Promise<boolean> {
  const headerStore = await headers();
  const originHeader = headerStore.get("origin");
  const host = headerStore.get("host");
  const forwardedHost = headerStore.get("x-forwarded-host");
  const forwardedProto = headerStore.get("x-forwarded-proto");
  const expected = getSafeAppOrigin({ host, forwardedHost, forwardedProto });
  if (!expected) {
    return false;
  }
  if (!originHeader) {
    return true;
  }
  return originHeader.replace(/\/$/, "") === expected;
}
