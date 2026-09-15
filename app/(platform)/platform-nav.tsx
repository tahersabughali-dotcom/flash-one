"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const APP_LINKS = [
  { href: "/app", label: "Home" },
  { href: "/app/requests", label: "Requests" },
  { href: "/app/projects", label: "Projects" },
] as const;

const ADMIN_LINKS = [
  { href: "/admin", label: "Home" },
  { href: "/admin/requests", label: "Requests" },
  { href: "/admin/projects", label: "Projects" },
] as const;

export function PlatformNav({ variant }: { variant: "app" | "admin" }) {
  const pathname = usePathname();
  const links = variant === "admin" ? ADMIN_LINKS : APP_LINKS;

  return (
    <nav className="mb-10 flex flex-wrap gap-2">
      {links.map((link) => {
        const active =
          link.href === "/app" || link.href === "/admin"
            ? pathname === link.href
            : pathname === link.href || pathname.startsWith(`${link.href}/`);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${
              active
                ? "bg-blue text-white shadow-(--shadow-button)"
                : "border border-line bg-white text-navy"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
