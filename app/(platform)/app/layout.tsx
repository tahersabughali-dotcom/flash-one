import { PlatformNav } from "../platform-nav";
import { getVerifiedSession } from "@/lib/server/auth";
import { getAccountSummary } from "@/lib/server/account";

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

  return (
    <>
      <PlatformNav variant="app" hasDeveloper={hasDeveloper} />
      {children}
    </>
  );
}
