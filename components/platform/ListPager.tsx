import Link from "next/link";
import { LIST_PAGE_SIZE } from "@/lib/server/pagination";

export function ListPager({
  page,
  itemCount,
  pageSize = LIST_PAGE_SIZE,
}: {
  page: number;
  itemCount: number;
  pageSize?: number;
}) {
  const hasPrev = page > 1;
  const hasNext = itemCount >= pageSize;
  if (!hasPrev && !hasNext) {
    return null;
  }
  return (
    <nav className="mt-6 flex items-center gap-4 text-sm" aria-label="Pagination">
      {hasPrev ? (
        <Link href={`?page=${page - 1}`} className="font-semibold text-blue">
          Previous
        </Link>
      ) : (
        <span className="text-muted">Previous</span>
      )}
      <span className="text-muted">Page {page}</span>
      {hasNext ? (
        <Link href={`?page=${page + 1}`} className="font-semibold text-blue">
          Next
        </Link>
      ) : (
        <span className="text-muted">Next</span>
      )}
    </nav>
  );
}
