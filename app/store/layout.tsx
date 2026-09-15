import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Store | Flash One",
};

export default function StoreLayout({
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
