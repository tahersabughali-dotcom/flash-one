export const SETTINGS_PATHS = {
  hub: "/admin/settings",
  general: "/admin/settings",
  company: "/admin/settings/company",
  brand: "/admin/settings/brand",
  localization: "/admin/settings/localization",
  currencies: "/admin/settings/currencies",
  features: "/admin/settings/features",
  notifications: "/admin/settings/notifications",
  security: "/admin/settings/security",
  backup: "/admin/settings/backup",
  legal: "/admin/settings/legal",
  ai: "/admin/settings/ai",
  help: "/app/help",
} as const;

export const SETTINGS_SECTIONS = [
  { href: SETTINGS_PATHS.company, label: "Company", description: "Verified company fields only. Unknown values stay blank." },
  { href: SETTINGS_PATHS.brand, label: "Brand", description: "Official Flash One identity and invoice branding." },
  { href: SETTINGS_PATHS.localization, label: "Localization", description: "Languages and countries. English remains default." },
  { href: SETTINGS_PATHS.currencies, label: "Currencies", description: "Enabled currencies. No FX rates." },
  { href: SETTINGS_PATHS.features, label: "Features", description: "UI availability flags. Not a security boundary." },
  { href: SETTINGS_PATHS.notifications, label: "Notifications", description: "Channel readiness. Only in-app is operational today." },
  { href: SETTINGS_PATHS.ai, label: "AI", description: "Provider readiness and assistive boundaries." },
  { href: SETTINGS_PATHS.security, label: "Security readiness", description: "Truthful readiness metadata. Unknown stays unknown." },
  { href: SETTINGS_PATHS.backup, label: "Backup readiness", description: "Launch representation only. No fake success." },
  { href: SETTINGS_PATHS.legal, label: "Legal drafts", description: "Internal placeholders. Not published." },
] as const;
