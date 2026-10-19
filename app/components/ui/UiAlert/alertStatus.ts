export const ALERT_STATUSES = ["info", "success", "warning", "error"] as const;

export type AlertStatus = (typeof ALERT_STATUSES)[number];
