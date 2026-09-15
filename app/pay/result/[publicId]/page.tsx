import { notFound } from "next/navigation";
import { formatMinor } from "@/modules/invoices";
import { ATTEMPT_STATUS_LABELS, type AttemptStatus } from "@/modules/payment-requests";
import {
  getPublicAttemptStatus,
  getPublicGuestReceipt,
  readIngestKey,
} from "@/lib/server/payments/core";

function statusLabel(status: string): string {
  if ((ATTEMPT_STATUS_LABELS as Record<string, string>)[status]) {
    return ATTEMPT_STATUS_LABELS[status as AttemptStatus];
  }
  return "Processing";
}

export default async function PayResultPage({
  params,
}: {
  params: Promise<{ publicId: string }>;
}) {
  const { publicId } = await params;
  if (!/^PAT-[A-F0-9]{12}$/.test(publicId)) {
    notFound();
  }
  const attempt = await getPublicAttemptStatus(publicId);
  if (!attempt || String(attempt.status) === "not_found") {
    notFound();
  }
  const ingestKey = await readIngestKey(publicId);
  let receiptNumber: string | null = null;
  let receiptAmount: string | null = null;
  if (ingestKey && String(attempt.status) === "succeeded") {
    const receipt = await getPublicGuestReceipt(publicId, ingestKey);
    if (receipt && receipt.status === "ok") {
      receiptNumber = String(receipt.receipt_number ?? "");
      if (receipt.amount_minor && receipt.currency) {
        receiptAmount = formatMinor(Number(receipt.amount_minor), String(receipt.currency));
      }
    }
  }
  return (
    <main>
      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-navy/50">
        {String(attempt.public_id)}
      </p>
      <h1 className="mt-3 text-3xl font-extrabold tracking-[-0.04em] text-navy-deep">
        {statusLabel(String(attempt.status))}
      </h1>
      <p className="mt-4 text-[15px] text-muted">
        {formatMinor(Number(attempt.amount_minor ?? 0), String(attempt.currency ?? "GBP"))}
      </p>
      {receiptNumber ? (
        <p className="mt-4 text-[15px]">
          Receipt {receiptNumber}
          {receiptAmount ? ` · ${receiptAmount}` : ""}
        </p>
      ) : null}
      <p className="mt-6 text-sm text-muted">
        This page shows current status only. A browser return is not proof of payment.
      </p>
    </main>
  );
}
