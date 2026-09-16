import { PlatformNav } from "../platform-nav";
import { requirePlatformAdmin } from "@/lib/server/auth";
import { NotAuthorized } from "@/components/platform/NotAuthorized";

export default async function AdminSectionLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const access = await requirePlatformAdmin("/admin");
  if (!access.authorized) {
    return <NotAuthorized />;
  }

  return (
    <>
      <PlatformNav variant="admin" />
      {children}
    </>
  );
}
