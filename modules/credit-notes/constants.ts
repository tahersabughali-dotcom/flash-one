export const CREDIT_NOTE_PATHS = {
  adminList: "/admin/credit-notes",
  adminNew: "/admin/credit-notes/new",
  adminDetail: (publicId: string) => `/admin/credit-notes/${publicId}`,
} as const;

export const CREDIT_NOTE_STATUSES = ["draft", "issued", "void"] as const;
export type CreditNoteStatus = (typeof CREDIT_NOTE_STATUSES)[number];

export const CREDIT_NOTE_STATUS_LABELS: Record<CreditNoteStatus, string> = {
  draft: "Draft",
  issued: "Issued",
  void: "Void",
};

export const MAX_CREDIT_NOTE_REASON_LENGTH = 400;
export const MAX_CREDIT_NOTE_NOTES_LENGTH = 4000;
