import { redirect } from "next/navigation";
import { requirePlatformAdmin } from "@/lib/server/auth";
import { AUTH_PATHS } from "@/modules/auth/constants";
import { listInvoices } from "@/lib/server/invoices";
import { listPayments } from "@/lib/server/payments";
import { listReceipts } from "@/lib/server/receipts";
import { listReconciliationItems } from "@/lib/server/reconciliation";
import { csvResponse, toCsv } from "@/lib/server/finance/csv";
import { REPORT_PATHS } from "@/modules/reports";

export async function GET(
  _request: Request,
  context: { params: Promise<{ kind: string }> },
) {
  const { kind } = await context.params;
  const access = await requirePlatformAdmin(REPORT_PATHS.admin);
  if (!access.authorized) {
    redirect(AUTH_PATHS.admin);
  }

  if (kind === "invoices") {
    const rows = await listInvoices(1);
    return csvResponse(
      "flash-one-invoices.csv",
      toCsv(
        ["invoice_number", "public_id", "status", "currency", "total_minor", "paid_minor", "credit_minor", "due_minor", "customer"],
        rows.map((row) => [
          row.invoiceNumber,
          row.publicId,
          row.status,
          row.currency,
          row.totalMinor,
          row.amountPaidMinor,
          row.creditIssuedMinor,
          row.amountDueMinor,
          row.customerLabel,
        ]),
      ),
    );
  }
  if (kind === "payments") {
    const rows = await listPayments(1);
    return csvResponse(
      "flash-one-payments.csv",
      toCsv(
        ["public_id", "status", "source", "provider", "currency", "amount_minor", "unallocated_minor", "customer"],
        rows.map((row) => [
          row.publicId,
          row.status,
          row.sourceType,
          row.provider,
          row.currency,
          row.amountMinor,
          row.unallocatedMinor,
          row.customerLabel,
        ]),
      ),
    );
  }
  if (kind === "receipts") {
    const rows = await listReceipts(1);
    return csvResponse(
      "flash-one-receipts.csv",
      toCsv(
        ["receipt_number", "public_id", "currency", "amount_minor", "issued_at", "invoices"],
        rows.map((row) => [
          row.receiptNumber,
          row.publicId,
          row.currency,
          row.amountMinor,
          row.issuedAt,
          row.invoiceNumbers.join(" "),
        ]),
      ),
    );
  }
  if (kind === "reconciliation") {
    const rows = await listReconciliationItems(1);
    return csvResponse(
      "flash-one-reconciliation.csv",
      toCsv(
        ["public_id", "status", "source", "currency", "amount_minor", "matched_payment"],
        rows.map((row) => [
          row.publicId,
          row.status,
          row.sourceType,
          row.currency,
          row.amountMinor,
          row.matchedPaymentPublicId,
        ]),
      ),
    );
  }
  redirect(REPORT_PATHS.admin);
}
