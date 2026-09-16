import { redirect } from "next/navigation";
import { requirePlatformAdmin } from "@/lib/server/auth";
import { AUTH_PATHS } from "@/modules/auth/constants";
import { listInvoices } from "@/lib/server/invoices";
import { listPayments } from "@/lib/server/payments";
import { listReceipts } from "@/lib/server/receipts";
import { listReconciliationItems } from "@/lib/server/reconciliation";
import { listExpenses, listPayouts, listSupportCases, listSuppliers, listFreelancers } from "@/lib/server/operations";
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
  if (kind === "freelancers") {
    const rows = await listFreelancers(1);
    return csvResponse(
      "flash-one-freelancers.csv",
      toCsv(
        ["public_id", "name", "status", "specialty"],
        rows.map((row) => [row.publicId, row.title, row.status, row.meta]),
      ),
    );
  }
  if (kind === "suppliers") {
    const rows = await listSuppliers(1);
    return csvResponse(
      "flash-one-suppliers.csv",
      toCsv(
        ["public_id", "name", "status", "type"],
        rows.map((row) => [row.publicId, row.title, row.status, row.meta]),
      ),
    );
  }
  if (kind === "cases") {
    const rows = await listSupportCases(1);
    return csvResponse(
      "flash-one-cases.csv",
      toCsv(
        ["public_id", "title", "status", "type", "priority"],
        rows.map((row) => [row.public_id, row.title, row.status, row.case_type, row.priority]),
      ),
    );
  }
  if (kind === "expenses") {
    const rows = await listExpenses(1);
    return csvResponse(
      "flash-one-expenses.csv",
      toCsv(
        ["public_id", "description", "status", "category", "currency", "amount_minor", "expense_date"],
        rows.map((row) => [
          row.public_id,
          row.description,
          row.status,
          row.category,
          row.currency,
          row.amount_minor,
          row.expense_date,
        ]),
      ),
    );
  }
  if (kind === "payouts") {
    const rows = await listPayouts(1);
    return csvResponse(
      "flash-one-payouts.csv",
      toCsv(
        ["public_id", "reason", "status", "beneficiary_kind", "currency", "amount_minor", "due_date"],
        rows.map((row) => [
          row.public_id,
          row.reason,
          row.status,
          row.beneficiary_kind,
          row.currency,
          row.amount_minor,
          row.due_date,
        ]),
      ),
    );
  }
  redirect(REPORT_PATHS.admin);
}
