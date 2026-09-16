export const LOCALES = ["en", "ar"] as const;
export type LocaleCode = (typeof LOCALES)[number];

export const LOCALE_META: Record<
  LocaleCode,
  { displayName: string; direction: "ltr" | "rtl"; isDefault: boolean }
> = {
  en: { displayName: "English", direction: "ltr", isDefault: true },
  ar: { displayName: "Arabic", direction: "rtl", isDefault: false },
};

export const DEFAULT_LOCALE: LocaleCode = "en";

export function isLocaleCode(value: string): value is LocaleCode {
  return (LOCALES as readonly string[]).includes(value);
}

export function directionForLocale(locale: LocaleCode) {
  return LOCALE_META[locale].direction;
}

/**
 * Future UI strings can resolve through this contract.
 * English remains the default V1 platform language.
 */
export function resolveLocale(preferred?: string | null): LocaleCode {
  if (preferred && isLocaleCode(preferred)) {
    return preferred;
  }
  return DEFAULT_LOCALE;
}
