import { PlatformNav } from "../platform-nav";

export default function AppSectionLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <PlatformNav variant="app" />
      {children}
    </>
  );
}
