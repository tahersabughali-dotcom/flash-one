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
import { QUOTE_PATHS } from "@/modules/quotes";
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
        {contract.acceptedAt ? <li>Acknowledged: {contract.acceptedAt}</li> : null}
      </ul>
      {contract.status === "issued" ? (
        <ContractAcceptForm contractPublicId={contract.publicId} />
      ) : null}
    </main>
  );
}
