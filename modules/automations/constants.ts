export const AUTOMATION_PATHS = {
  admin: "/admin/automations",
  adminDetail: (publicId: string) => `/admin/automations/${publicId}`,
} as const;

export const AUTOMATION_EVENT_TYPES = [
  "payment.confirmed",
  "store_order.paid",
  "work_request.submitted",
] as const;

export const AUTOMATION_ACTIONS = [
  "create_notification",
  "create_admin_follow_up",
  "development_fail",
] as const;

export const AUTOMATION_RUN_STATUSES = [
  "pending",
  "processing",
  "succeeded",
  "failed",
  "skipped",
] as const;
