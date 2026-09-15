"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavLink = { href: string; label: string };

const APP_LINKS: NavLink[] = [
  { href: "/app", label: "Home" },
  { href: "/app/relationships", label: "Relationships" },
  { href: "/app/requests", label: "Requests" },
  { href: "/app/projects", label: "Projects" },
  { href: "/app/orders", label: "Orders" },
  { href: "/app/invoices", label: "Invoices" },
  { href: "/app/receipts", label: "Receipts" },
  { href: "/app/ai", label: "AI" },
  { href: "/app/notifications", label: "Notifications" },
];

const DEVELOPER_LINKS: NavLink[] = [
  { href: "/app/developer", label: "Developer Profile" },
  { href: "/app/developer/projects", label: "Developer Projects" },
];

const ADMIN_LINKS: NavLink[] = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/customers", label: "Customers" },
  { href: "/admin/businesses", label: "Businesses" },
  { href: "/admin/developers", label: "Developers" },
  { href: "/admin/requests", label: "Requests" },
  { href: "/admin/projects", label: "Projects" },
  { href: "/admin/store", label: "Store" },
  { href: "/admin/invoices", label: "Invoices" },
  { href: "/admin/payment-requests", label: "Payment requests" },
  { href: "/admin/payments", label: "Financial records" },
  { href: "/admin/reconciliation", label: "Reconciliation" },
  { href: "/admin/automations", label: "Automations" },
];

export function PlatformNav({
  variant,
  hasDeveloper = false,
  unreadNotifications = 0,
}: {
  variant: "app" | "admin";
  hasDeveloper?: boolean;
  unreadNotifications?: number;
}) {
  const pathname = usePathname();
  const links =
    variant === "admin"
      ? ADMIN_LINKS
      : hasDeveloper
        ? [...APP_LINKS, ...DEVELOPER_LINKS]
        : APP_LINKS;

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
              {link.href === "/app/notifications" && unreadNotifications > 0
                ? ` (${unreadNotifications})`
                : ""}
          </Link>
        );
      })}
    </nav>
  );
}
