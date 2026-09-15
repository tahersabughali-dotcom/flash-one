export const LIST_PAGE_SIZE = 50;

export function parseListPage(raw: string | string[] | undefined): number {
  const value = Array.isArray(raw) ? raw[0] : raw;
  const page = Number.parseInt(value ?? "1", 10);
  if (!Number.isInteger(page) || page < 1) {
    return 1;
  }
  return Math.min(page, 1000);
}

export function listRange(page: number, pageSize = LIST_PAGE_SIZE) {
  const from = (page - 1) * pageSize;
  return { from, to: from + pageSize - 1, pageSize };
}
