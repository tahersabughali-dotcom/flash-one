export const AUTOMATION_PATHS = {
  admin: "/admin/automations",
  adminNew: "/admin/automations/new",
  adminDetail: (publicId: string) => `/admin/automations/${publicId}`,
} as const;

export const AUTOMATION_EVENT_TYPES = [
  "payment.confirmed",
  "store_order.paid",
  "work_request.submitted",
  "quote.issued",
  "quote.accepted",
  "project.created",
  "project.assignment",
  "task.assignment",
  "deliverable.submitted",
  "invoice.issued",
  "payment.recorded",
  "refund.status",
  "case.created",
  "case.updated",
  "payout.approved",
] as const;

export const AUTOMATION_ACTIONS = [
  "create_notification",
  "create_admin_follow_up",
  "create_operational_task",
  "create_case",
  "record_activity",
  "development_fail",
] as const;

export const AUTOMATION_RUN_STATUSES = [
  "pending",
  "processing",
  "succeeded",
  "failed",
  "skipped",
] as const;

export const AUTOMATION_EVENT_LABELS: Record<(typeof AUTOMATION_EVENT_TYPES)[number], string> = {
  "payment.confirmed": "Payment confirmed",
  "store_order.paid": "Store order paid",
  "work_request.submitted": "Work request submitted",
  "quote.issued": "Quote issued",
  "quote.accepted": "Quote accepted",
  "project.created": "Project created",
  "project.assignment": "Project assignment",
  "task.assignment": "Task assignment",
  "deliverable.submitted": "Deliverable submitted",
  "invoice.issued": "Invoice issued",
  "payment.recorded": "Payment recorded",
  "refund.status": "Refund status",
  "case.created": "Case created",
  "case.updated": "Case updated",
  "payout.approved": "Payout approved",
};

export const AUTOMATION_ACTION_LABELS: Record<(typeof AUTOMATION_ACTIONS)[number], string> = {
  create_notification: "Create in-app notification",
  create_admin_follow_up: "Create admin follow-up",
  create_operational_task: "Create operational task",
  create_case: "Create case",
  record_activity: "Record activity",
  development_fail: "Development fail (dev only)",
};
