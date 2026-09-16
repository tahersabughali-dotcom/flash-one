import Link from "next/link";
import { notFound } from "next/navigation";
import { requireCompletedOnboarding } from "@/lib/server/account";
import { getContractByPublicId } from "@/lib/server/contracts";
import {
  CONTRACT_DOCUMENT_TYPE_LABELS,
  CONTRACT_PATHS,
  CONTRACT_STATUS_LABELS,
} from "@/modules/contracts";
import { PROJECT_PATHS } from "@/modules/projects";
import { QUOTE_PATHS, formatMinor } from "@/modules/quotes";
import { formatDisplayDate } from "@/lib/format/display";
import { ContractAcceptForm } from "../contract-accept-form";

export default async function ContractDetailPage({
  params,
}: {
  params: Promise<{ publicId: string }>;
}) {
  const { publicId } = await params;
  await requireCompletedOnboarding(CONTRACT_PATHS.detail(publicId));
  const contract = await getContractByPublicId(publicId);
  if (!contract) {
    notFound();
  }

  return (
    <main>
      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-navy/50">
        {contract.publicId}
      </p>
      <h1 className="mt-3 text-3xl font-extrabold tracking-[-0.04em] text-navy-deep">
        {contract.title}
      </h1>
      <p className="mt-4 text-[15px] text-muted">
        {CONTRACT_DOCUMENT_TYPE_LABELS[contract.documentType]} ·{" "}
        {CONTRACT_STATUS_LABELS[contract.status]} · v{contract.version}
      </p>
      <p className="mt-6 whitespace-pre-wrap text-[15px] leading-relaxed text-navy">
        {contract.acknowledgmentText}
      </p>
      <p className="mt-6 text-sm text-muted">
        This is a platform acknowledgment, not a qualified electronic signature.
      </p>
      <ul className="mt-6 space-y-2 text-sm">
        <li>
          Project:{" "}
          <Link href={PROJECT_PATHS.detail(contract.projectPublicId)} className="font-semibold text-blue">
            {contract.projectPublicId}
          </Link>
        </li>
        <li>
          Quote:{" "}
          <Link href={QUOTE_PATHS.detail(contract.quotePublicId)} className="font-semibold text-blue">
            {contract.quotePublicId}
          </Link>
        </li>
        {contract.acceptedAt ? <li>Acknowledged: {formatDisplayDate(contract.acceptedAt)}</li> : null}
        {contract.effectiveDate ? <li>Effective: {formatDisplayDate(contract.effectiveDate)}</li> : null}
      </ul>
      <ContractSnapshot snapshot={contract.commercialSnapshot} />
      {contract.status === "issued" ? (
        <ContractAcceptForm contractPublicId={contract.publicId} />
      ) : null}
    </main>
  );
}

function ContractSnapshot({ snapshot }: { snapshot: unknown }) {
  if (!snapshot || typeof snapshot !== "object") {
    return (
      <p className="mt-6 text-sm text-muted">
        Commercial scope is recorded on the related quote. This document does not replace that snapshot.
      </p>
    );
  }
  const value = snapshot as {
    currency?: string;
    total_minor?: number;
    subtotal_minor?: number;
    lines?: Array<{
      position?: number;
      description?: string;
      quantity?: number;
      unit_amount_minor?: number;
      line_total_minor?: number;
    }>;
  };
  const currency = value.currency ?? "GBP";
  const lines = Array.isArray(value.lines) ? value.lines : [];
  if (!value.total_minor && lines.length === 0) {
    return (
      <p className="mt-6 text-sm text-muted">
        Commercial scope is recorded on the related quote. This document does not replace that snapshot.
      </p>
    );
  }
  return (
    <section className="mt-8">
      <h2 className="text-lg font-extrabold text-navy-deep">Commercial scope</h2>
      <p className="mt-2 text-sm text-muted">
        Snapshot from the accepted quote. Later catalog changes do not rewrite it.
      </p>
      {lines.length > 0 ? (
        <ul className="mt-3 space-y-2 text-sm">
          {lines.map((line, index) => (
            <li key={`${line.position ?? index}-${line.description ?? "line"}`}>
              {line.description}
              {typeof line.line_total_minor === "number"
                ? ` · ${formatMinor(line.line_total_minor, currency)}`
                : ""}
            </li>
          ))}
        </ul>
      ) : null}
      {typeof value.total_minor === "number" ? (
        <p className="mt-3 text-sm font-semibold">
          Total {formatMinor(value.total_minor, currency)}
        </p>
      ) : null}
    </section>
  );
}
