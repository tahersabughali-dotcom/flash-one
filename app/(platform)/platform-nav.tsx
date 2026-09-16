"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

type NavLink = { href: string; label: string; badge?: number };

const APP_LINKS: NavLink[] = [
  { href: "/app", label: "Home" },
  { href: "/app/relationships", label: "Relationships" },
  { href: "/app/requests", label: "Requests" },
  { href: "/app/projects", label: "Projects" },
  { href: "/app/orders", label: "Orders" },
  { href: "/app/invoices", label: "Invoices" },
  { href: "/app/payments", label: "Payments" },
  { href: "/app/receipts", label: "Receipts" },
  { href: "/app/cases", label: "Cases" },
  { href: "/app/ai", label: "AI" },
  { href: "/app/help", label: "Help" },
  { href: "/app/notifications", label: "Notifications" },
  { href: "/app/account", label: "Account" },
];

const DEVELOPER_LINKS: NavLink[] = [
  { href: "/app/developer", label: "Developer" },
  { href: "/app/developer/projects", label: "Assignments" },
];

const ADMIN_GROUPS: Array<{ label: string; links: NavLink[] }> = [
  {
    label: "Operations",
    links: [
      { href: "/admin", label: "Dashboard" },
      { href: "/admin/customers", label: "Customers" },
      { href: "/admin/businesses", label: "Organizations" },
      { href: "/admin/projects", label: "Projects" },
      { href: "/admin/tasks", label: "Tasks" },
      { href: "/admin/cases", label: "Cases" },
    ],
  },
  {
    label: "People & network",
    links: [
      { href: "/admin/developers", label: "Developers" },
      { href: "/admin/employees", label: "Employees" },
      { href: "/admin/freelancers", label: "Freelancers" },
      { href: "/admin/partners", label: "Partners" },
      { href: "/admin/suppliers", label: "Suppliers" },
      { href: "/admin/contacts", label: "Contacts" },
    ],
  },
  {
    label: "Commercial",
    links: [
      { href: "/admin/services", label: "Services" },
      { href: "/admin/requests", label: "Requests" },
      { href: "/admin/quotes", label: "Quotes" },
      { href: "/admin/store", label: "Store" },
      { href: "/admin/store/orders", label: "Orders" },
    ],
  },
  {
    label: "Finance",
    links: [
      { href: "/admin/invoices", label: "Invoices" },
      { href: "/admin/payment-requests", label: "Payment requests" },
      { href: "/admin/payments", label: "Payments" },
      { href: "/admin/receipts", label: "Receipts" },
      { href: "/admin/refunds", label: "Refunds" },
      { href: "/admin/credit-notes", label: "Credit notes" },
      { href: "/admin/adjustments", label: "Adjustments" },
      { href: "/admin/reconciliation", label: "Reconciliation" },
      { href: "/admin/ledger", label: "Ledger" },
      { href: "/admin/expenses", label: "Expenses" },
      { href: "/admin/payouts", label: "Payouts" },
      { href: "/admin/procurement", label: "Procurement" },
      { href: "/admin/referrals", label: "Referrals" },
      { href: "/admin/commissions", label: "Commissions" },
      { href: "/admin/reports", label: "Reports" },
    ],
  },
  {
    label: "System",
    links: [
      { href: "/admin/settings", label: "Settings" },
      { href: "/admin/integrations", label: "Integrations" },
      { href: "/admin/automations", label: "Automations" },
      { href: "/admin/email", label: "Email" },
      { href: "/admin/imports", label: "Imports" },
      { href: "/admin/exports", label: "Exports" },
      { href: "/admin/incidents", label: "Incidents" },
      { href: "/admin/releases", label: "Releases" },
      { href: "/admin/communications", label: "Communications" },
      { href: "/admin/documents", label: "Documents" },
      { href: "/admin/health", label: "Health" },
      { href: "/admin/payments/providers", label: "Providers" },
    ],
  },
];

function isActive(pathname: string, href: string) {
  if (href === "/app" || href === "/admin") {
    return pathname === href;
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavPills({
  links,
  pathname,
}: {
  links: NavLink[];
  pathname: string;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {links.map((link) => {
        const active = isActive(pathname, link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`rounded-full px-3 py-1.5 text-sm font-semibold sm:px-4 sm:py-2 ${
              active
                ? "bg-blue text-white shadow-(--shadow-button)"
                : "border border-line bg-white text-navy"
            }`}
          >
            {link.label}
            {link.badge ? ` (${link.badge})` : ""}
          </Link>
        );
      })}
    </div>
  );
}

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
  const [open, setOpen] = useState(false);

  const appLinks = APP_LINKS.map((link) =>
    link.href === "/app/notifications" && unreadNotifications > 0
      ? { ...link, badge: unreadNotifications }
      : link,
  );
  const links = hasDeveloper ? [...appLinks, ...DEVELOPER_LINKS] : appLinks;

  return (
    <nav className="mb-10" aria-label={variant === "admin" ? "Admin" : "Workspace"}>
      <div className="mb-3 flex items-center justify-between gap-3 lg:hidden">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-navy/50">
          {variant === "admin" ? "Operations" : "Workspace"}
        </p>
        <button
          type="button"
          className="inline-flex size-10 items-center justify-center rounded-full border border-line bg-white text-navy"
          aria-expanded={open}
          aria-controls="platform-navigation"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((value) => !value)}
        >
          <span className="text-lg leading-none">{open ? "×" : "☰"}</span>
        </button>
      </div>
      <div id="platform-navigation" className={open ? "block" : "hidden lg:block"}>
        {variant === "admin" ? (
          <div className="space-y-4">
            {ADMIN_GROUPS.map((group) => (
              <div key={group.label}>
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-navy/40">
                  {group.label}
                </p>
                <NavPills links={group.links} pathname={pathname} />
              </div>
            ))}
          </div>
        ) : (
          <NavPills links={links} pathname={pathname} />
        )}
      </div>
    </nav>
  );
}
