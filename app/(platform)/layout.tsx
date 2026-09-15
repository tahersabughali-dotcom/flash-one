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
    <div className="min-h-svh bg-page px-6 py-16 text-navy">
      <div className="mx-auto w-full max-w-3xl">{children}</div>
    </div>
  );
}
