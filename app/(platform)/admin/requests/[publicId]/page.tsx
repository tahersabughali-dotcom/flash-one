import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePlatformAdmin } from "@/lib/server/auth";
import { logoutAction } from "@/app/(auth)/actions";
import { getWorkRequestByPublicId } from "@/lib/server/work-requests";
import { listQuotesForWorkRequest } from "@/lib/server/quotes";
import {
  SERVICE_CATEGORY_LABELS,
  WORK_REQUEST_PATHS,
  WORK_REQUEST_STATUS_LABELS,
} from "@/modules/work-requests";
import { formatMinor, QUOTE_PATHS, QUOTE_STATUS_LABELS } from "@/modules/quotes";
import { AdminRequestStatusForm } from "../status-form";
import { AdminQuoteForm } from "../quote-form";

export default async function AdminRequestDetailPage({
  params,
}: {
  params: Promise<{ publicId: string }>;
}) {
  const { publicId } = await params;
  const access = await requirePlatformAdmin(
    WORK_REQUEST_PATHS.adminDetail(publicId),
  );
  if (!access.authorized) {
    return (
      <main>
        <h1 className="text-3xl font-extrabold text-navy-deep">Not authorized</h1>
        <form action={logoutAction} className="mt-8">
          <button
            type="submit"
            className="rounded-(--radius-button) border border-line bg-white px-5 py-2.5 text-sm font-semibold"
          >
            Sign out
          </button>
        </form>
      </main>
    );
  }

  const request = await getWorkRequestByPublicId(publicId);
  if (!request) {
    notFound();
  }
  const quotes = await listQuotesForWorkRequest(request.id);
  const canQuote = ["under_review", "needs_information", "qualified"].includes(
    request.status,
  );

  return (
    <main>
      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-navy/50">
        {request.publicId}
      </p>
      <h1 className="mt-3 text-3xl font-extrabold tracking-[-0.04em] text-navy-deep">
        {request.title}
      </h1>
      <p className="mt-4 text-[15px] text-muted">
        {SERVICE_CATEGORY_LABELS[request.serviceCategory]} ·{" "}
        {WORK_REQUEST_STATUS_LABELS[request.status]}
        {request.catalogServiceName ? ` · Catalog ${request.catalogServiceName}` : ""}
      </p>
      <p className="mt-6 whitespace-pre-wrap text-[15px] leading-relaxed">
        {request.summary}
      </p>
      {request.details ? (
        <p className="mt-4 whitespace-pre-wrap text-[15px] leading-relaxed">
          {request.details}
        </p>
      ) : null}
      <AdminRequestStatusForm publicId={request.publicId} currentStatus={request.status} />
      {quotes.length > 0 ? (
        <section className="mt-10">
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-navy/50">
            Quotes
          </h2>
          <ul className="mt-4 space-y-3">
            {quotes.map((quote) => (
              <li key={quote.publicId} className="rounded-2xl border border-line bg-white px-5 py-4">
                <Link href={QUOTE_PATHS.detail(quote.publicId)} className="font-semibold text-blue">
                  {quote.publicId}
                </Link>
                <p className="mt-1 text-sm text-muted">
                  v{quote.version} · {QUOTE_STATUS_LABELS[quote.status]} ·{" "}
                  {formatMinor(quote.totalMinor, quote.currency)}
                </p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      {canQuote ? (
        <section className="mt-10">
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-navy/50">
            Issue quote
          </h2>
          <AdminQuoteForm workRequestPublicId={request.publicId} />
        </section>
      ) : null}
    </main>
  );
}
