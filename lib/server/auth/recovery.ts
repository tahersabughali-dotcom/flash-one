import { cookies } from "next/headers";
import { sensitiveCookieOptions } from "@/lib/server/http/cookies";
import { getVerifiedSession } from "./session";

export const PASSWORD_RECOVERY_COOKIE = "fo-pw-recovery";

const RECOVERY_COOKIE_OPTIONS = sensitiveCookieOptions({ maxAge: 15 * 60 });

export function getPasswordRecoveryCookieOptions() {
  return RECOVERY_COOKIE_OPTIONS;
}

export async function hasPasswordRecoveryContext(): Promise<boolean> {
  const session = await getVerifiedSession();
  if (!session) {
    return false;
  }

  const cookieStore = await cookies();
  return cookieStore.get(PASSWORD_RECOVERY_COOKIE)?.value === "1";
}

export async function clearPasswordRecoveryCookie() {
  const cookieStore = await cookies();
  cookieStore.set(PASSWORD_RECOVERY_COOKIE, "", {
    ...RECOVERY_COOKIE_OPTIONS,
    maxAge: 0,
  });
}
