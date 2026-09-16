import type { Metadata } from "next";
import { platformConfig } from "@/modules/shared";

export const metadata: Metadata = {
  title: `${platformConfig.platformLabel} | ${platformConfig.name}`,
  robots: {
    index: false,
    follow: false,
  },
};

export default function PlatformLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-svh bg-page px-4 py-10 text-navy sm:px-6 sm:py-16">
      <div className="mx-auto w-full max-w-6xl">{children}</div>
    </div>
  );
}
