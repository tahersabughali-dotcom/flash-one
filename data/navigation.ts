export const publicNav = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/services" },
  { label: "Solutions", href: "/solutions" },
  { label: "AI", href: "/ai" },
  { label: "Company", href: "/company" },
  { label: "Contact", href: "/contact" },
] as const;

export function isPublicNavActive(href: string, pathname: string) {
  if (href === "/") {
    return pathname === "/";
  }

  const [path] = href.split("#");
  if (!path || path === "/") {
    return false;
  }

  return pathname === path || pathname.startsWith(`${path}/`);
}
