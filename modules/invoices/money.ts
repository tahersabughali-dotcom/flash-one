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

export function parseMinor(value: unknown): number | null {
  if (typeof value === "number") {
    if (!Number.isSafeInteger(value)) {
      return null;
    }
    return value;
  }
  if (typeof value !== "string") {
    return null;
  }
  const trimmed = value.trim();
  if (!/^-?\d+$/.test(trimmed)) {
    return null;
  }
  if (trimmed.replace("-", "").length > 16) {
    return null;
  }
  const minor = Number(trimmed);
  if (!Number.isSafeInteger(minor)) {
    return null;
  }
  return minor;
}

export function asMinor(value: number | string): number {
  const minor = parseMinor(value);
  if (minor === null) {
    throw new Error("unsafe or invalid money value");
  }
  return minor;
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

export function formatMinor(minor: number, currency: string): string {
  if (!Number.isSafeInteger(minor)) {
    throw new Error("unsafe or invalid money value");
  }
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
  }).format(minor / 100);
}
