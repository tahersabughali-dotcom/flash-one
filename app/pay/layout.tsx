import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pay | Flash One",
  robots: { index: false, follow: false },
};

export default function PayLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-svh bg-page px-6 py-16 text-navy">
      <div className="mx-auto w-full max-w-xl">{children}</div>
    </div>
  );
}
