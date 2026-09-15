/**
 * Authoritative money is integer minor units in Postgres bigint columns.
 * V1 currencies GBP, USD, and EUR use 100 minor units per major unit.
 * Do not assume every future currency has two decimals.
 * JavaScript number is used only after Number.isSafeInteger validation.
 * Do not use floating point as the financial source of truth.
 * FX conversion is not implemented.
 */

export const V1_MINOR_UNITS: Record<string, number> = {
  GBP: 100,
  USD: 100,
  EUR: 100,
};

export function minorUnitsFor(currency: string): number | null {
  return V1_MINOR_UNITS[currency] ?? null;
}

export function parseMajorToMinor(value: string, currency = "GBP"): number | null {
  const scale = minorUnitsFor(currency);
  if (scale === null || scale !== 100) {
    return null;
  }
  const trimmed = value.trim();
  if (!/^\d+(\.\d{1,2})?$/.test(trimmed)) {
    return null;
  }
  const [whole, fraction = ""] = trimmed.split(".");
  const fractionPadded = `${fraction}00`.slice(0, 2);
  const minor = Number(whole) * 100 + Number(fractionPadded);
  if (!Number.isSafeInteger(minor) || minor < 0) {
    return null;
  }
  return minor;
}

export function asMinor(value: number | string): number {
  const minor = typeof value === "string" ? Number(value) : value;
  if (!Number.isSafeInteger(minor)) {
    return 0;
  }
  return minor;
}

export function formatMinor(minor: number, currency: string): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
  }).format(minor / 100);
}
