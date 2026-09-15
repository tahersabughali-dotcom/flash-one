export const CONTRACT_PATHS = {
  detail: (publicId: string) => `/app/contracts/${publicId}`,
} as const;

export const CONTRACT_STATUSES = [
  "draft",
  "issued",
  "accepted",
  "superseded",
] as const;

export type ContractStatus = (typeof CONTRACT_STATUSES)[number];

export const CONTRACT_STATUS_LABELS: Record<ContractStatus, string> = {
  draft: "Draft",
  issued: "Issued",
  accepted: "Accepted",
  superseded: "Superseded",
};

export const CONTRACT_DOCUMENT_TYPES = ["contract", "statement_of_work"] as const;
export type ContractDocumentType = (typeof CONTRACT_DOCUMENT_TYPES)[number];

export const CONTRACT_DOCUMENT_TYPE_LABELS: Record<ContractDocumentType, string> = {
  contract: "Contract",
  statement_of_work: "Statement of Work",
};
