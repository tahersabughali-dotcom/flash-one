import { redirect } from "next/navigation";
import { AUTH_PATHS } from "@/modules/auth";
import { isPlatformAdmin } from "./authorization";
import { getVerifiedSession } from "./session";

export async function requireAuthenticatedUser(nextPath: string) {
  const session = await getVerifiedSession();
  if (!session) {
    const search = new URLSearchParams({ next: nextPath });
    redirect(`${AUTH_PATHS.login}?${search.toString()}`);
  }

  return session;
}

export async function requirePlatformAdmin(nextPath: string) {
  const session = await requireAuthenticatedUser(nextPath);
  const admin = await isPlatformAdmin(session.userId);
  if (!admin) {
    return { ...session, authorized: false as const };
  }

  return { ...session, authorized: true as const };
}
