const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

function utcParts(value: string): { day: number; month: number; year: number; hours: number; minutes: number } | null {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split("-").map(Number);
    return { day, month, year, hours: 0, minutes: 0 };
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return {
    day: date.getUTCDate(),
    month: date.getUTCMonth() + 1,
    year: date.getUTCFullYear(),
    hours: date.getUTCHours(),
    minutes: date.getUTCMinutes(),
  };
}

export function formatDisplayDate(value: string | null | undefined): string {
  if (!value) {
    return "";
  }
  const parts = utcParts(value);
  if (!parts) {
    return value.slice(0, 10);
  }
  return `${parts.day} ${MONTHS[parts.month - 1]} ${parts.year}`;
}

export function formatDisplayDateTime(value: string | null | undefined): string {
  if (!value) {
    return "";
  }
  const parts = utcParts(value);
  if (!parts) {
    return formatDisplayDate(value);
  }
  const hours = String(parts.hours).padStart(2, "0");
  const minutes = String(parts.minutes).padStart(2, "0");
  return `${parts.day} ${MONTHS[parts.month - 1]} ${parts.year} ${hours}:${minutes} UTC`;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${Math.round((bytes / 1024) * 10) / 10} KB`;
  }
  return `${Math.round((bytes / (1024 * 1024)) * 10) / 10} MB`;
}
