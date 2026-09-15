export type AdminFinanceFormState = {
  error: string | null;
};

export function mapFinanceError(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("not authorized") || lower.includes("platform admin")) {
    return "Admin access is required.";
  }
  if (lower.includes("accepted quote")) {
    return "Use an accepted quote, or create a manual invoice.";
  }
  if (lower.includes("both individual and organization")) {
    return "Choose either a customer or a business.";
  }
  if (lower.includes("requires a customer")) {
    return "Select a customer or business.";
  }
  if (lower.includes("immutable")) {
    return "Issued invoice values cannot be changed.";
  }
  if (lower.includes("cannot void")) {
    return "This invoice cannot be voided.";
  }
  if (lower.includes("cross-currency")) {
    return "Currency must match.";
  }
  if (lower.includes("exceeds payment")) {
    return "Allocation exceeds the unallocated payment amount.";
  }
  if (lower.includes("exceeds invoice")) {
    return "Allocation exceeds the invoice amount due.";
  }
  if (lower.includes("already exists")) {
    return "An allocation already exists for this payment and invoice.";
  }
  if (lower.includes("cannot allocate")) {
    return "That payment cannot be allocated to this invoice.";
  }
  if (lower.includes("unsupported currency")) {
    return "Choose GBP, USD, or EUR.";
  }
  if (lower.includes("amount does not match")) {
    return "Amount must match the payment.";
  }
  return "Unable to complete this financial action.";
}
