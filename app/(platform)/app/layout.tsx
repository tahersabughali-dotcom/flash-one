import { PlatformNav } from "../platform-nav";
import { getVerifiedSession } from "@/lib/server/auth";
import { getAccountSummary } from "@/lib/server/account";
import { countUnreadNotifications } from "@/lib/server/platform/queries";

export default async function AppSectionLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getVerifiedSession();
  let hasDeveloper = false;
  if (session) {
    const summary = await getAccountSummary(session.userId);
    hasDeveloper = Boolean(summary?.developer);
  }

  const unreadNotifications = session ? await countUnreadNotifications() : 0;

  return (
    <>
      <PlatformNav
        variant="app"
        hasDeveloper={hasDeveloper}
        unreadNotifications={unreadNotifications}
      />
      {children}
    </>
  );
}
