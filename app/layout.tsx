import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-flash",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Flash One",
  description:
    "Flash One designs, builds and delivers digital technology solutions.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={plusJakartaSans.variable}>
      <body className="min-h-svh bg-page font-sans text-navy antialiased">
        {children}
      </body>
    </html>
  );
}
