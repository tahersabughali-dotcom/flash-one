import { INVOICE_STATUS_LABELS as INVOICE_LABELS } from "@/modules/invoices/constants";
import { PAYMENT_STATUS_LABELS as PAYMENT_LABELS } from "@/modules/payments/constants";
import { PAYMENT_REQUEST_STATUS_LABELS as PAYMENT_REQUEST_LABELS } from "@/modules/payment-requests/constants";
import { REFUND_STATUS_LABELS as REFUND_LABELS } from "@/modules/refunds/constants";
import { CREDIT_NOTE_STATUS_LABELS as CREDIT_NOTE_LABELS } from "@/modules/credit-notes/constants";
import { ORDER_STATUS_LABELS as ORDER_LABELS } from "@/modules/store/constants";

export const INVOICE_STATUS_LABELS = INVOICE_LABELS;
export const PAYMENT_STATUS_LABELS = PAYMENT_LABELS;
export const PAYMENT_REQUEST_STATUS_LABELS = PAYMENT_REQUEST_LABELS;
export const REFUND_STATUS_LABELS = REFUND_LABELS;
export const CREDIT_NOTE_STATUS_LABELS = CREDIT_NOTE_LABELS;
export const ORDER_STATUS_LABELS = ORDER_LABELS;

export const RECONCILIATION_STATUS_LABELS = {
  unmatched: "Unmatched",
  suggested: "Review required",
  matched: "Matched",
  reconciled: "Confirmed",
  ignored: "Ignored",
} as const;

export const ALLOCATION_STATUS_LABELS = {
  allocated: "Allocated",
  unallocated: "Unallocated",
  partial: "Partially allocated",
} as const;

const LABEL_MAPS = [
  INVOICE_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
  PAYMENT_REQUEST_STATUS_LABELS,
  REFUND_STATUS_LABELS,
  CREDIT_NOTE_STATUS_LABELS,
  RECONCILIATION_STATUS_LABELS,
  ORDER_STATUS_LABELS,
] as const;

export function financialStatusLabel(status: string): string {
  for (const map of LABEL_MAPS) {
    if (status in map) {
      return map[status as keyof typeof map];
    }
  }
  if (status in ALLOCATION_STATUS_LABELS) {
    return ALLOCATION_STATUS_LABELS[status as keyof typeof ALLOCATION_STATUS_LABELS];
  }
  return status.split("_").join(" ");
}
