/**
 * Quote amounts are stored as integer minor units (pence/cents).
 * JavaScript number is only used after validation against a safe maximum.
 * Authoritative totals are computed in Postgres.
 */
export function parseMajorToMinor(value: string): number | null {
  const trimmed = value.trim();
  if (!/^\d+(\.\d{1,2})?$/.test(trimmed)) {
    return null;
  }
  const [whole, fraction = ""] = trimmed.split(".");
  const fractionPadded = `${fraction}00`.slice(0, 2);
  const minor = Number(whole) * 100 + Number(fractionPadded);
  if (!Number.isSafeInteger(minor)) {
    return null;
  }
  return minor;
}

export function formatMinor(minor: number, currency: string): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
  }).format(minor / 100);
}
