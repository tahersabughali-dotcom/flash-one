import Link from "next/link";
import { notFound } from "next/navigation";
import { requireCompletedOnboarding } from "@/lib/server/account";
import { getQuoteByPublicId } from "@/lib/server/quotes";
import { formatMinor, QUOTE_PATHS, QUOTE_STATUS_LABELS } from "@/modules/quotes";
import { WORK_REQUEST_PATHS } from "@/modules/work-requests";
import { QuoteDecisionForms } from "../quote-decision-forms";

export default async function QuoteDetailPage({
  params,
}: {
  params: Promise<{ publicId: string }>;
}) {
  const { publicId } = await params;
  await requireCompletedOnboarding(QUOTE_PATHS.detail(publicId));
  const quote = await getQuoteByPublicId(publicId);
  if (!quote) {
    notFound();
  }

  const canDecide = quote.status === "sent";

  return (
    <main>
      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-navy/50">
        {quote.publicId}
      </p>
      <h1 className="mt-3 text-3xl font-extrabold tracking-[-0.04em] text-navy-deep">
        Quote v{quote.version}
      </h1>
      <p className="mt-4 text-[15px] text-muted">
        {QUOTE_STATUS_LABELS[quote.status]}
        {quote.validUntil ? ` · Valid until ${quote.validUntil}` : ""}
      </p>
      <p className="mt-2 text-sm">
        <Link
          href={WORK_REQUEST_PATHS.detail(quote.workRequestPublicId)}
          className="font-semibold text-blue"
        >
          Request {quote.workRequestPublicId}
        </Link>
      </p>
      <ul className="mt-8 space-y-3">
        {quote.lines.map((line) => (
          <li
            key={`${line.position}-${line.description}`}
            className="rounded-2xl border border-line bg-white px-5 py-4"
          >
            <p className="font-semibold text-navy-deep">{line.description}</p>
            <p className="mt-1 text-sm text-muted">
              {line.quantity} × {formatMinor(line.unitAmountMinor, quote.currency)} ={" "}
              {formatMinor(line.lineTotalMinor, quote.currency)}
            </p>
          </li>
        ))}
      </ul>
      <p className="mt-6 text-[15px] font-semibold text-navy-deep">
        Subtotal {formatMinor(quote.subtotalMinor, quote.currency)}
      </p>
      <p className="text-sm text-muted">
        Tax is not configured yet and is {formatMinor(0, quote.currency)}.
      </p>
      <p className="mt-2 text-lg font-extrabold text-navy-deep">
        Total {formatMinor(quote.totalMinor, quote.currency)}
      </p>
      {quote.customerNotes ? (
        <p className="mt-6 whitespace-pre-wrap text-[15px] text-navy">{quote.customerNotes}</p>
      ) : null}
      {quote.acceptedAt ? (
        <p className="mt-4 text-sm text-muted">Accepted {quote.acceptedAt}</p>
      ) : null}
      {quote.rejectedAt ? (
        <p className="mt-4 text-sm text-muted">Rejected {quote.rejectedAt}</p>
      ) : null}
      {canDecide ? <QuoteDecisionForms quotePublicId={quote.publicId} /> : null}
    </main>
  );
}
