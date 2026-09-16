import Link from "next/link";
import { notFound } from "next/navigation";
import { requireCompletedOnboarding } from "@/lib/server/account";
import { getQuoteByPublicId } from "@/lib/server/quotes";
import { formatMinor, QUOTE_PATHS, QUOTE_STATUS_LABELS } from "@/modules/quotes";
import { WORK_REQUEST_PATHS } from "@/modules/work-requests";
import { formatDisplayDate } from "@/lib/format/display";
import { PageHeader } from "@/components/platform/PageHeader";
import { SectionPanel } from "@/components/platform/SectionPanel";
import { StatusBadge } from "@/components/platform/StatusBadge";
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
      <PageHeader
        eyebrow={quote.publicId}
        title={`Quote v${quote.version}`}
        description={`${quote.currency}${quote.validUntil ? ` · Valid until ${formatDisplayDate(quote.validUntil)}` : ""}`}
        actions={<StatusBadge status={quote.status} label={QUOTE_STATUS_LABELS[quote.status]} />}
      />
      <p className="mt-4 text-sm">
        <Link
          href={WORK_REQUEST_PATHS.detail(quote.workRequestPublicId)}
          className="font-semibold text-blue"
        >
          Request {quote.workRequestPublicId}
        </Link>
      </p>
      <SectionPanel title="Line items">
        <ul className="space-y-3">
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
          Tax is not configured yet and is {formatMinor(quote.taxMinor, quote.currency)}.
        </p>
        <p className="mt-2 text-lg font-extrabold text-navy-deep">
          Total {formatMinor(quote.totalMinor, quote.currency)}
        </p>
      </SectionPanel>
      {quote.customerNotes ? (
        <SectionPanel title="Notes and terms">
          <p className="whitespace-pre-wrap text-[15px] text-navy">{quote.customerNotes}</p>
        </SectionPanel>
      ) : null}
      {quote.acceptedAt ? (
        <p className="mt-4 text-sm text-muted">Accepted {formatDisplayDate(quote.acceptedAt)}</p>
      ) : null}
      {quote.rejectedAt ? (
        <p className="mt-4 text-sm text-muted">Rejected {formatDisplayDate(quote.rejectedAt)}</p>
      ) : null}
      {canDecide ? <QuoteDecisionForms quotePublicId={quote.publicId} /> : null}
      {!canDecide ? (
        <p className="mt-6 text-sm text-muted">
          This quote can only be accepted while it is sent and still valid.
        </p>
      ) : null}
    </main>
  );
}
