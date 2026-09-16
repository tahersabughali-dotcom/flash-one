import { requirePlatformAdmin } from "@/lib/server/auth";
import { listQuotes } from "@/lib/server/quotes";
import { parseListPage } from "@/lib/server/pagination";
import { ListPager } from "@/components/platform/ListPager";
import { PageHeader } from "@/components/platform/PageHeader";
import { EmptyState } from "@/components/platform/EmptyState";
import { RecordCard } from "@/components/platform/RecordCard";
import { formatMinor, QUOTE_PATHS, QUOTE_STATUS_LABELS } from "@/modules/quotes";
import { WORK_REQUEST_PATHS } from "@/modules/work-requests";
import { formatDisplayDate } from "@/lib/format/display";

export default async function AdminQuotesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  await requirePlatformAdmin(QUOTE_PATHS.adminList);
  const page = parseListPage((await searchParams).page);
  const quotes = await listQuotes(page);

  return (
    <main>
      <PageHeader
        eyebrow="Commercial"
        title="Quotes"
        description="Issued quotes snapshot line items and totals. Later catalog changes do not rewrite accepted commercial meaning."
      />
      {quotes.length === 0 ? (
        <EmptyState
          title="No quotes yet"
          description="Issue a quote from a reviewed work request."
          actionHref={WORK_REQUEST_PATHS.adminList}
          actionLabel="Open requests"
        />
      ) : (
        <ul className="mt-8 space-y-3">
          {quotes.map((quote) => (
            <li key={quote.publicId}>
              <RecordCard
                href={QUOTE_PATHS.adminDetail(quote.publicId)}
                reference={quote.publicId}
                title={formatMinor(quote.totalMinor, quote.currency)}
                status={quote.status}
                statusLabel={QUOTE_STATUS_LABELS[quote.status]}
                meta={`v${quote.version}${quote.validUntil ? ` · valid until ${formatDisplayDate(quote.validUntil)}` : ""} · ${quote.workRequestPublicId}`}
              />
            </li>
          ))}
        </ul>
      )}
      <ListPager page={page} itemCount={quotes.length} />
    </main>
  );
}
