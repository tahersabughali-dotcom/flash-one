import { PlatformNav } from "../platform-nav";

export default function AdminSectionLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <PlatformNav variant="admin" />
      {children}
    </>
  );
}
